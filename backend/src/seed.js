import { getDb, insertContent, insertPresetScore, insertDailyScore, cacheDemoScore } from './db.js';
import { DEMO_TEXTS, PRESET_NAMES } from './presets.js';

console.log('Seeding database...');

const db = getDb();

// Clear existing data
db.exec('DELETE FROM content');
db.exec('DELETE FROM preset_scores');
db.exec('DELETE FROM daily_scores');
db.exec('DELETE FROM demo_cache');

// ----- Mock tweets -----
const mockTweets = [
  { text: 'Los inmigrantes nos quitan el trabajo y las ayudas', author: 'usuario_enfadado', score: 72, category: 'odio_directo' },
  { text: 'Hay que proteger nuestras fronteras de la invasión', author: 'patriota_real', score: 68, category: 'polarizador' },
  { text: 'Los políticos son todos unos corruptos ladrones', author: 'ciudadano_harto', score: 45, category: 'polarizador' },
  { text: 'La diversidad nos hace más fuertes como sociedad', author: 'activista_paz', score: 5, category: 'contra_odio' },
  { text: 'Stop islamofobia. Todos merecemos respeto.', author: 'derechos_humanos', score: 3, category: 'contra_odio' },
  { text: 'Este gobierno nos lleva a la ruina total', author: 'oposicion_24h', score: 38, category: 'polarizador' },
  { text: 'Las feminazis quieren destruir la sociedad', author: 'troll_2024', score: 78, category: 'odio_directo' },
  { text: 'Ni machismo ni feminismo, igualdad real', author: 'centrista_iberico', score: 15, category: 'neutro' },
  { text: 'Vox es la única esperanza para España', author: 'vox_fan_oficial', score: 35, category: 'polarizador' },
  { text: 'Basta de odio. España es de todos.', author: 'convivencia_ya', score: 2, category: 'contra_odio' },
  { text: 'Los moros fuera de nuestro país', author: 'xenofobo_99', score: 95, category: 'odio_directo' },
  { text: 'El colectivo LGTBI merece todos los derechos', author: 'orgullo_madrid', score: 4, category: 'contra_odio' },
  { text: 'Los rojos quieren acabar con España', author: 'facha_nostalgico', score: 65, category: 'polarizador' },
  { text: 'Respeto y tolerancia para construir un futuro mejor', author: 'educador_social', score: 1, category: 'contra_odio' },
  { text: 'Hay que expulsar a todos los ilegales ya', author: 'cerrar_fronteras', score: 82, category: 'odio_directo' },
  { text: 'Los catalanes separatistas son unos traidores', author: 'unionista_100', score: 60, category: 'polarizador' },
  { text: 'La religión es el opio del pueblo, hay que prohibirla', author: 'ateo_radical', score: 55, category: 'polarizador' },
  { text: 'Todos los gitanos son ladrones, es un hecho', author: 'racista_casual', score: 92, category: 'odio_directo' },
  { text: 'Necesitamos más integración y menos muros', author: 'puentes_no_muros', score: 6, category: 'contra_odio' },
  { text: 'Pedro Sánchez es un dictador comunista', author: 'derecha_total', score: 52, category: 'polarizador' },
  { text: 'Abascal es un fascista peligroso para la democracia', author: 'antifascista_bcn', score: 48, category: 'polarizador' },
  { text: 'Las mujeres que abortan son asesinas', author: 'provida_siempre', score: 70, category: 'odio_directo' },
  { text: 'El machismo mata, lucha feminista salva', author: 'feminista_8m', score: 8, category: 'contra_odio' },
  { text: 'Sudacas go home, España para los españoles', author: 'ultranacional_es', score: 96, category: 'odio_directo' },
  { text: 'La convivencia entre culturas es posible y necesaria', author: 'mediador_social', score: 3, category: 'contra_odio' },
  { text: 'Los manteros destruyen el comercio local', author: 'comerciante_bcn', score: 42, category: 'discutible' },
  { text: 'Fuera las mezquitas de nuestros barrios', author: 'vecino_alertado', score: 75, category: 'odio_directo' },
  { text: 'La inmigración regulada beneficia a todos', author: 'economista_social', score: 10, category: 'neutro' },
  { text: 'Los trans son enfermos mentales que necesitan ayuda', author: 'biologia_real', score: 88, category: 'odio_directo' },
  { text: 'Cada persona merece ser llamada como desee', author: 'aliado_trans', score: 2, category: 'contra_odio' },
  { text: 'España cristiana, no islámica', author: 'cruzado_2024', score: 70, category: 'odio_directo' },
  { text: 'Boicot a Inditex por explotar trabajadores', author: 'anticorp_madrid', score: 35, category: 'discutible' },
  { text: 'Los medios mienten, todos controlados por el gobierno', author: 'conspiranoico_1', score: 40, category: 'polarizador' },
  { text: 'Abrid las fronteras, las personas no son ilegales', author: 'sin_fronteras', score: 5, category: 'contra_odio' },
  { text: 'La ley trans es un ataque a los menores', author: 'padre_preocupado', score: 55, category: 'polarizador' },
  { text: 'Solidaridad con los refugiados que huyen de la guerra', author: 'acnur_voluntario', score: 1, category: 'contra_odio' },
  { text: 'Los bancos son los verdaderos ladrones de este país', author: 'anti_sistema', score: 38, category: 'polarizador' },
  { text: 'Que se vayan los okupas, mano dura ya', author: 'propietario_harto', score: 45, category: 'polarizador' },
  { text: 'La gente de bien está harta de tanta gentuza', author: 'hartazgo_spain', score: 58, category: 'polarizador' },
  { text: 'Educación en valores para combatir el odio desde niños', author: 'profe_inclusivo', score: 2, category: 'contra_odio' },
  { text: 'Hay que quemar las sedes de los partidos políticos', author: 'radical_anon', score: 90, category: 'odio_directo' },
  { text: 'Los ancianos merecen más protección, no recortes', author: 'pensionista_dig', score: 8, category: 'neutro' },
  { text: 'España es tierra de acogida desde hace siglos', author: 'historiador_com', score: 4, category: 'contra_odio' },
  { text: 'El problema no es la inmigración, es la pobreza', author: 'sociologo_critico', score: 12, category: 'neutro' },
  { text: 'Las lesbianas no deberían poder adoptar niños', author: 'familia_natural', score: 76, category: 'odio_directo' },
  { text: 'Unidas podemos contra el fascismo', author: 'antifa_united', score: 22, category: 'neutro' },
  { text: 'El chiringuito feminista vive de las subvenciones', author: 'critico_genero', score: 50, category: 'polarizador' },
  { text: 'Todos los curas son pedófilos', author: 'anticlerical_max', score: 72, category: 'odio_directo' },
  { text: 'Hay que dar papeles a los que trabajan y contribuyen', author: 'pragmatico_2024', score: 15, category: 'neutro' },
  { text: 'Los ricos deberían pagar más impuestos, son parásitos', author: 'clase_obrera', score: 40, category: 'polarizador' },
];

// ----- Mock headlines -----
const mockHeadlines = [
  { text: 'El auge de la extrema derecha amenaza los derechos LGTBI en Europa', source: 'elpais', score: 35, category: 'neutro' },
  { text: 'Organizaciones piden más recursos contra los discursos de odio', source: 'elpais', score: 15, category: 'contra_odio' },
  { text: 'La brecha salarial de género se reduce pero persiste', source: 'elpais', score: 10, category: 'neutro' },
  { text: 'Inmigrantes denuncian aumento de agresiones racistas', source: 'elpais', score: 25, category: 'neutro' },
  { text: 'El Gobierno refuerza las leyes contra la discriminación online', source: 'elpais', score: 8, category: 'contra_odio' },
  { text: 'Polémica por la nueva ley de memoria: la derecha habla de censura', source: 'elmundo', score: 40, category: 'polarizador' },
  { text: 'Protestas contra la inmigración ilegal en varias ciudades', source: 'elmundo', score: 55, category: 'polarizador' },
  { text: 'El debate sobre la ideología de género divide a la sociedad', source: 'elmundo', score: 45, category: 'polarizador' },
  { text: 'Críticas al Gobierno por la gestión de la crisis migratoria', source: 'elmundo', score: 38, category: 'polarizador' },
  { text: 'Vox exige mano dura contra la delincuencia extranjera', source: 'elmundo', score: 58, category: 'polarizador' },
  { text: 'La Iglesia alerta del ataque a los valores cristianos', source: 'abc', score: 42, category: 'polarizador' },
  { text: 'Familias se movilizan contra el adoctrinamiento en las aulas', source: 'abc', score: 48, category: 'polarizador' },
  { text: 'El feminismo radical impone su agenda en las universidades', source: 'abc', score: 52, category: 'polarizador' },
  { text: 'España necesita defender su identidad frente a la inmigración masiva', source: 'abc', score: 60, category: 'polarizador' },
  { text: 'Asociaciones pro-vida denuncian persecución ideológica', source: 'abc', score: 45, category: 'polarizador' },
  { text: 'El 60% de los jóvenes ha visto contenido de odio online', source: '20minutos', score: 20, category: 'neutro' },
  { text: 'Los algoritmos amplifican la polarización política', source: '20minutos', score: 25, category: 'neutro' },
  { text: 'Aumentan las denuncias por delitos de odio un 18%', source: '20minutos', score: 22, category: 'neutro' },
  { text: 'Expertos piden regular la IA para evitar sesgos', source: '20minutos', score: 12, category: 'neutro' },
  { text: 'Campaña viral contra el acoso a personas trans en redes', source: '20minutos', score: 15, category: 'contra_odio' },
];

// Insert tweets
const now = new Date();
for (let i = 0; i < mockTweets.length; i++) {
  const t = mockTweets[i];
  const timestamp = new Date(now.getTime() - i * 3600000).toISOString(); // staggered by hour
  insertContent({
    source: 'twitter',
    text: t.text,
    author: t.author,
    url: '#',
    timestamp,
    hate_score: t.score,
    category: t.category,
    targets: [],
    preset_used: 'neutro',
    confidence: 0.7
  });
}

// Insert headlines
for (let i = 0; i < mockHeadlines.length; i++) {
  const h = mockHeadlines[i];
  const timestamp = new Date(now.getTime() - i * 1800000).toISOString();
  insertContent({
    source: h.source,
    text: h.text,
    author: h.source,
    url: '#',
    timestamp,
    hate_score: h.score,
    category: h.category,
    targets: [],
    preset_used: 'neutro',
    confidence: 0.6
  });
}

// Seed daily scores (7 days of history)
const sources = ['twitter', 'elpais', 'elmundo', 'abc', '20minutos'];
for (let day = 6; day >= 0; day--) {
  const date = new Date(now.getTime() - day * 86400000).toISOString().split('T')[0];
  for (const source of sources) {
    // Generate plausible varying scores per source
    const baselines = { twitter: 45, elpais: 22, elmundo: 40, abc: 44, '20minutos': 20 };
    const base = baselines[source] || 30;
    const variation = Math.sin(day * 0.8 + sources.indexOf(source)) * 12;
    const score = Math.round(base + variation + (Math.random() - 0.5) * 10);
    insertDailyScore(source, date, Math.max(5, Math.min(80, score)), 10 + Math.floor(Math.random() * 20));
  }
}

// Cache demo text scores
for (const dt of DEMO_TEXTS) {
  for (const presetName of PRESET_NAMES) {
    const expected = dt.expectedScores[presetName];
    if (expected) {
      cacheDemoScore(dt.id, presetName, expected.score, expected.category, '');
    }
  }
}

console.log('✓ Seed data inserted successfully');
console.log(`  - ${mockTweets.length} tweets`);
console.log(`  - ${mockHeadlines.length} headlines`);
console.log(`  - 7 days × ${sources.length} sources daily scores`);
console.log(`  - ${DEMO_TEXTS.length} demo texts × ${PRESET_NAMES.length} presets cached`);

process.exit(0);
