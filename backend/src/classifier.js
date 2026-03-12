import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Eres un clasificador académico de discurso de odio y polarización en medios digitales españoles.
Analiza el texto que recibes y responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin explicaciones fuera del JSON.
Criterios académicos de referencia:

Discurso de odio: contenido que incita a la violencia, discriminación o hostilidad hacia grupos por raza, etnia, género, orientación sexual, religión o nacionalidad.
Polarización: contenido que divide artificialmente en "nosotros vs ellos", deshumaniza al adversario político o elimina matices del debate.
Crítica política legítima: opinión, sátira, crítica a instituciones o personas públicas en su función pública. NO es odio ni polarización per se.

Formato de respuesta obligatorio:
{
  "hate_score": <integer 0-100>,
  "category": "<hate_speech|polarization|political_criticism|neutral>",
  "targets": [<array of strings, grupos o personas afectadas, puede estar vacío>],
  "confidence": <float 0.0-1.0>,
  "reasoning": "<1-2 frases en español explicando la clasificación>"
}`;

let client = null;

function getClient() {
  if (!client && process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/**
 * Classify text for hate speech and polarization. Returns structured result.
 * On API error or missing key: returns neutral fallback.
 */
export async function classifyText(text) {
  const anthropic = getClient();
  if (!anthropic) {
    return {
      hate_score: 0,
      category: 'neutral',
      targets: [],
      confidence: 0,
      reasoning: 'API no configurada. Añade ANTHROPIC_API_KEY en .env',
    };
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analiza este texto:\n\n${text}`,
        },
      ],
    });

    const content = response.content[0].text.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const result = JSON.parse(jsonMatch[0]);
    return {
      hate_score: Math.max(0, Math.min(100, parseInt(result.hate_score, 10) || 0)),
      category: ['hate_speech', 'polarization', 'political_criticism', 'neutral'].includes(result.category)
        ? result.category
        : 'neutral',
      targets: Array.isArray(result.targets) ? result.targets : [],
      confidence: Math.max(0, Math.min(1, parseFloat(result.confidence) || 0)),
      reasoning: String(result.reasoning || ''),
    };
  } catch (err) {
    console.error('[Classifier] Error:', err.message);
    return {
      hate_score: 0,
      category: 'neutral',
      targets: [],
      confidence: 0,
      reasoning: 'Error de clasificación',
    };
  }
}
