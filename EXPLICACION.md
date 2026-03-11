# HODIO — Explicación del Proyecto

## ¿Qué es HODIO?

HODIO es una herramienta de investigación que mide el discurso de odio en internet, pero con un giro: **demuestra en vivo que cualquier herramienta de este tipo puede ser manipulada** según quién la configure.

El nombre viene de "Huella del Odio Digital Online".

---

## Las 3 pestañas

### 1. Dashboard (`/`)

**Qué es:** Panel de control principal que muestra el estado del odio en internet en tiempo real.

**Qué hace:**
- **Índice Global del Odio** — Un medidor de 0 a 100 que resume cuánto odio hay ahora mismo en las fuentes monitorizadas
- **Redes Sociales** — Tarjetas por plataforma (X, Instagram, TikTok, YouTube, Facebook, Reddit) con su puntuación media de odio
- **Medios de Comunicación** — Tarjetas por medio (El País, El Mundo, ABC, OKDiario, etc.) mostrando cuánto contenido polarizador publica cada uno
- **Tendencias** — Gráfico de líneas que muestra cómo evoluciona el odio en los últimos 7 días por fuente
- **Top Amplificadores** — Ranking de las cuentas/medios que más odio generan
- **Top Frenadores** — Ranking de las cuentas/medios que más combaten el odio
- **Feed en Tiempo Real** — Lista cronológica de todo el contenido analizado con su puntuación y categoría

**Datos reales:** Scrapea titulares de 10 medios españoles, Google News, Reddit y YouTube. Son datos reales de hoy.

---

### 2. Laboratorio de Sesgo (`/laboratorio`)

**Qué es:** La parte más importante del proyecto. Una demostración interactiva de cómo **la misma IA produce resultados completamente opuestos** según las instrucciones que recibe.

**Qué hace:**

#### Selector de ideología del clasificador
5 botones que cambian las "gafas ideológicas" de la IA:

| Preset | Quién sería | Qué considera odio |
|--------|-------------|---------------------|
| 🔴 **Progresista** | Un gobierno de izquierdas | Machismo, xenofobia, LGTBfobia, fascismo |
| 🔵 **Conservador** | Un gobierno de derechas | Ataques a la religión, a la familia, feminismo radical |
| ⚖️ **Neutro** | Un clasificador objetivo | Solo violencia real y deshumanización |
| 🏛️ **Gubernamental** | Un gobierno que quiere protegerse | Críticas a las instituciones = desestabilización |
| 💰 **Corporativo** | Una empresa que protege su negocio | Boicots, anticapitalismo, ataques a marcas |

#### Los 5 textos de ejemplo
Siempre se muestran los mismos 5 textos. Al cambiar el preset, los números cambian en vivo:

- **"Hay que echar a los políticos corruptos a patadas"**
  → Neutro: 25 | Gubernamental: **75** (el gobierno lo ve como amenaza)

- **"El islam es incompatible con la democracia occidental"**
  → Conservador: 25 | Progresista: **75** (la izquierda lo ve como islamofobia)

- **"La ideología de género destruye a nuestros hijos"**
  → Conservador: **15** (opinión legítima) | Progresista: **85** (odio directo)

- **"Vox es un partido fascista que odia a los pobres"**
  → Progresista: 15 | Conservador: **75** (ataque a la derecha)

- **"Los medios públicos son propaganda del gobierno"**
  → Neutro: 15 | Gubernamental: 25 (crítica institucional)

**El mensaje:** La misma frase puntúa 15 o 85 dependiendo de quién programa la IA. No existe un clasificador "objetivo".

#### Quién paga, quién define
Un slider que simula qué pasa cuando cambias la fuente de financiación del clasificador:
- Si lo paga el gobierno → baja el umbral para censurar crítica política
- Si lo paga una empresa → baja el umbral para censurar crítica corporativa
- **Mensaje:** Quien paga la herramienta controla qué se censura

#### Audit Log (Transparencia)
Muestra el **prompt exacto** que se le envía a la IA. Palabra por palabra. Cuando cambias de preset, ves cómo cambian las instrucciones. Cualquier periodista puede leerlo y verificar que las instrucciones son las que producen el sesgo.

#### Exportar evidencia
Genera un PDF con las 25 clasificaciones (5 textos × 5 presets) listo para publicar como prueba de manipulación algorítmica.

---

### 3. Modo TV / Demo (`/demo`)

**Qué es:** Versión de pantalla completa diseñada para presentaciones en televisión o conferencias.

**Qué hace:**
- Muestra el mismo contenido que el Laboratorio pero con **tipografía gigante**, fondo negro y colores de alto contraste
- Los textos de ejemplo **se auto-rotan** cada 8 segundos con transiciones suaves
- El presentador puede **cambiar el preset en vivo** tocando los botones (están grandes y visibles)
- Los números se animan con un efecto de conteo dramático al cambiar
- Banner permanente: **"¿Quién decide qué es odio?"**
- Ticker inferior con noticias reales clasificadas en tiempo real
- Pantalla completa con la tecla F

**Controles:**
- `F` → Pantalla completa
- `← →` → Cambiar texto
- `1-5` → Cambiar preset (1=Progresista, 2=Conservador, 3=Neutro, 4=Gubernamental, 5=Corporativo)

---

## ¿Cómo funciona la clasificación?

1. **Scraping** — HODIO recoge titulares reales de 10 medios españoles + Google News + Reddit + YouTube
2. **Pre-filtro** — Un filtro de palabras clave en español detecta contenido potencialmente sensible
3. **Clasificación IA** — Se envía el texto a Claude (IA de Anthropic) junto con el system prompt del preset activo
4. **Resultado** — La IA devuelve: puntuación (0-100), categoría, grupos objetivo, confianza y razonamiento

Las categorías posibles son:
- `odio_directo` — Deshumanización, insultos, incitación a la violencia
- `amplificacion` — Difunde contenido de odio de otros
- `polarizador` — Divide pero no deshumaniza
- `discutible` — Zona gris, opinión controvertida
- `neutro` — Sin carga de odio
- `contra_odio` — Combate activamente el odio

---

## ¿Cuál es el punto de todo esto?

HODIO no pretende ser un clasificador "correcto" de odio. **Pretende demostrar que ninguno lo es.**

Cualquier herramienta que clasifique discurso de odio:
1. Refleja los valores de quien la programa
2. Puede ser configurada para producir los resultados que su creador desee
3. Cambia completamente según quién la financia
4. Solo es fiable si sus reglas son 100% transparentes

**La única defensa contra la manipulación algorítmica es la transparencia total** — y eso es exactamente lo que HODIO demuestra con el Audit Log.

---

## Fuentes de datos reales

| Fuente | Tipo | Items | Método |
|--------|------|-------|--------|
| El País, El Mundo, ABC, 20min, La Vanguardia, El Confidencial, elDiario, Público, Libertad Digital, OKDiario | Medios | ~250 | Scraping HTML |
| Google News | Agregador | ~48 | RSS feeds |
| Reddit (r/spain, r/es, r/SpainPolitics, r/Asi_va_Espana) | Red social | ~40 | API JSON pública |
| YouTube (laSexta, Antena3, RTVE, El País) | Red social | ~20 | RSS feeds |
| **Total** | | **~357** | |
