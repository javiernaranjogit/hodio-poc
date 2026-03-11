# HODIO

### La misma frase. Cinco algoritmos. Cinco verdades distintas.

---

HODIO es una prueba de concepto que demuestra un problema fundamental: **cualquier herramienta que clasifique "discurso de odio" refleja la ideologia de quien la programa**.

No es un clasificador. Es una demostracion de que los clasificadores mienten.

## La prueba

Tomamos esta frase:

> "La ideologia de genero destruye a nuestros hijos"

Y la pasamos por 5 clasificadores identicos — misma IA, mismo modelo — cambiando unicamente las instrucciones:

| Clasificador | Puntuacion | Veredicto |
|---|---|---|
| Progresista | **95** | Odio directo |
| Conservador | **12** | Neutro |
| Neutro | **60** | Polarizador |
| Gubernamental | **40** | Polarizador |
| Corporativo | **55** | Polarizador |

**95 o 12. Odio o no. Dependiendo de quien escribe las reglas.**

Ahora con esta:

> "Vox es un partido fascista que odia a los pobres"

| Clasificador | Puntuacion | Veredicto |
|---|---|---|
| Progresista | **20** | Neutro |
| Conservador | **89** | Odio directo |
| Neutro | **55** | Polarizador |
| Gubernamental | **45** | Polarizador |
| Corporativo | **30** | Neutro |

Misma mecanica, resultado invertido. **Quien paga el algoritmo decide que es odio.**

## Como funciona

```
Texto de entrada
       |
       v
  ┌─────────────────────────────────────┐
  │  Claude (Anthropic) - Mismo modelo  │
  │                                     │
  │  + System Prompt A → Resultado A    │
  │  + System Prompt B → Resultado B    │
  │  + System Prompt C → Resultado C    │
  │  + System Prompt D → Resultado D    │
  │  + System Prompt E → Resultado E    │
  └─────────────────────────────────────┘
       |
       v
  5 puntuaciones distintas para el MISMO texto
```

La unica variable que cambia es el **system prompt** — las instrucciones que le dicen a la IA que buscar. Los 5 prompts estan expuestos en el codigo ([presets.js](backend/src/presets.js)) y en la interfaz (Audit Log).

## Los 5 presets

| Preset | Quien seria | Que considera odio | Que considera legitimo |
|---|---|---|---|
| Progresista | Gobierno de izquierdas | Xenofobia, LGTBfobia, machismo | Critica a la derecha, antifascismo |
| Conservador | Gobierno de derechas | Ataques a religion/familia | Critica a ideologia de genero |
| Neutro | Academico imparcial | Solo violencia y deshumanizacion | Opiniones controvertidas |
| Gubernamental | Estado protector | Critica a instituciones | Lo que no cuestione al poder |
| Corporativo | Empresa/plataforma | Boicots, anticapitalismo | Lo que no ahuyente anunciantes |

## Que incluye

**Dashboard** — Scrapea titulares reales de 10 medios espanoles + Google News + Reddit + YouTube y los clasifica.

**Laboratorio de Sesgo** — 5 textos de ejemplo clasificados en vivo con los 5 presets. Incluye:
- Comparacion visual de puntuaciones
- Slider "Quien paga, quien define" (simula el efecto de la financiacion)
- Audit Log transparente (muestra el prompt exacto que recibe la IA)
- Exportar PDF con las 25 clasificaciones como evidencia

**Envio manual** — Pega cualquier tweet o texto y el sistema lo clasifica y lo anade al feed.

## Ejecutar

```bash
# Instalar
cd backend && npm install && cd ../frontend && npm install && cd ..

# Configurar (opcional — funciona sin API key con clasificador por keywords)
cp .env.example backend/.env
# Editar backend/.env si tienes clave de Anthropic

# Datos de ejemplo
cd backend && npm run seed

# Arrancar (2 terminales)
cd backend && npm run dev          # Terminal 1 → http://localhost:3001
cd frontend && npx vite            # Terminal 2 → http://localhost:5173
```

## Fuentes de datos

| Fuente | Metodo |
|---|---|
| El Pais, El Mundo, ABC, 20 Minutos, La Vanguardia, El Confidencial, elDiario, Publico, Libertad Digital, OKDiario | Scraping HTML |
| Google News (6 queries) | RSS |
| Reddit (r/spain, r/es, r/SpainPolitics, r/Asi_va_Espana) | JSON publico |
| YouTube (laSexta, Antena3, RTVE, El Pais) | RSS |

## Stack

Node.js + Express + SQLite | React + Vite + TailwindCSS | Anthropic Claude API | Cheerio + Axios | PDFKit

## La tesis

HODIO no pretende ser un clasificador correcto de odio. **Pretende demostrar que ninguno lo es.**

La unica defensa contra la manipulacion algoritmica es la **transparencia total**: saber exactamente que instrucciones recibe la IA y quien las escribe.

Si un gobierno, una empresa o una plataforma te dice que su algoritmo detecta "odio" de forma objetiva, preguntale: **quien escribio las reglas?**

---

Herramienta de investigacion. Los resultados varian segun quien configura el algoritmo.
