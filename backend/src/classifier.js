import Anthropic from '@anthropic-ai/sdk';
import { PRESETS } from './presets.js';

let client = null;

function getClient() {
  if (!client && process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// Spanish hate-speech keyword pre-filter
const HATE_KEYWORDS = [
  'odio', 'matar', 'muerte', 'patadas', 'asco', 'basura', 'escoria',
  'fuera', 'echar', 'expulsar', 'invasión', 'invasion', 'plaga',
  'destruye', 'destruir', 'acabar con', 'eliminar',
  'fascista', 'nazi', 'terrorista', 'radical',
  'maricón', 'maricon', 'bollera', 'travelo',
  'moro', 'sudaca', 'gitano', 'negrata',
  'puta', 'zorra', 'gorda',
  'incompatible', 'ideología', 'propaganda', 'adoctrina',
  'corruptos', 'ladrones', 'traidores', 'golpistas'
];

export function preFilter(text) {
  const lower = text.toLowerCase();
  return HATE_KEYWORDS.some(kw => lower.includes(kw));
}

export async function classifyText(text, presetName = 'neutro') {
  const preset = PRESETS[presetName];
  if (!preset) throw new Error(`Preset desconocido: ${presetName}`);

  const anthropic = getClient();
  if (!anthropic) {
    return getFallbackClassification(text, presetName);
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: preset.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Clasifica el siguiente texto:\n\n"${text}"\n\nResponde SOLO con JSON válido.`
        }
      ]
    });

    const content = response.content[0].text.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const result = JSON.parse(jsonMatch[0]);
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      category: result.category || 'neutro',
      targets: result.targets || [],
      confidence: result.confidence || 0.5,
      preset_used: presetName,
      reasoning: result.reasoning || ''
    };
  } catch (err) {
    console.error(`Error clasificando con Claude (preset: ${presetName}):`, err.message);
    return getFallbackClassification(text, presetName);
  }
}

export async function classifyWithAllPresets(text) {
  const results = {};
  for (const presetName of Object.keys(PRESETS)) {
    results[presetName] = await classifyText(text, presetName);
  }
  return results;
}

// Fallback: keyword-based scoring when API unavailable
function getFallbackClassification(text, presetName) {
  const lower = text.toLowerCase();
  let baseScore = 0;
  let category = 'neutro';

  // Base keyword scoring
  const matches = HATE_KEYWORDS.filter(kw => lower.includes(kw));
  baseScore = Math.min(50, matches.length * 12);

  // Apply preset bias
  const biasModifiers = {
    progresista: {
      boost: ['incompatible', 'ideología', 'destruye', 'moro', 'invasión', 'invasion', 'maricón', 'maricon', 'fascista'],
      reduce: ['corruptos', 'ladrones', 'traidores']
    },
    conservador: {
      boost: ['fascista', 'nazi', 'ideología', 'adoctrina', 'destruye'],
      reduce: ['incompatible', 'tradicion', 'familia']
    },
    neutro: { boost: [], reduce: [] },
    gubernamental: {
      boost: ['corruptos', 'ladrones', 'traidores', 'golpistas', 'propaganda', 'echar', 'patadas'],
      reduce: []
    },
    corporativo: {
      boost: ['boicot', 'capitalismo', 'explotación', 'explotacion'],
      reduce: ['propaganda', 'corruptos']
    }
  };

  const mods = biasModifiers[presetName] || { boost: [], reduce: [] };
  mods.boost.forEach(kw => { if (lower.includes(kw)) baseScore += 25; });
  mods.reduce.forEach(kw => { if (lower.includes(kw)) baseScore -= 15; });

  baseScore = Math.max(0, Math.min(100, baseScore));

  if (baseScore > 70) category = 'odio_directo';
  else if (baseScore > 50) category = 'polarizador';
  else if (baseScore > 30) category = 'discutible';
  else category = 'neutro';

  return {
    score: baseScore,
    category,
    targets: [],
    confidence: 0.4,
    preset_used: presetName,
    reasoning: 'Clasificación basada en palabras clave (API no disponible)'
  };
}

export default { classifyText, classifyWithAllPresets, preFilter };
