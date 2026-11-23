// Glosas didácticas basadas en las fichas locales del glosario de la UdeG.
const glossCatalog = [
  { spanish: 'Hola', gloss: 'HOLA', lesson: 'leccion/2/0' },
  { spanish: 'Buenos días', gloss: 'BUENO + DÍA', lesson: 'leccion/2/1', aliases: ['Buen día'] },
  { spanish: 'Buenas tardes', gloss: 'BUENO + TARDE', lesson: 'leccion/2/3' },
  { spanish: 'Buenas noches', gloss: 'BUENO + NOCHE', lesson: 'leccion/2/4' },
  { spanish: '¿Cómo estás?', gloss: 'CÓMO ESTAR', lesson: 'leccion/2/5' },
  { spanish: 'Adiós', gloss: 'ADIÓS', lesson: 'leccion/2/6' },
  { spanish: 'Gracias', gloss: 'GRACIAS', lesson: 'leccion/3/0' },
  { spanish: 'Por favor', gloss: 'POR-FAVOR', lesson: 'leccion/3/1' },
  { spanish: 'Perdón', gloss: 'PERDÓN', lesson: 'leccion/3/2', aliases: ['Disculpa', 'Disculpe'] },
  { spanish: 'De nada', gloss: 'DE-NADA', lesson: 'leccion/3/3' },
  { spanish: 'Con permiso', gloss: 'CON-PERMISO', lesson: 'leccion/3/4' },
  { spanish: '¿Cómo te llamas?', gloss: 'TÚ LLAMAR', lesson: 'leccion/4/0' },
  { spanish: 'Mucho gusto', gloss: 'MUCHO GUSTO', lesson: 'leccion/4/0' },
];

function normalizeGlossQuery(text) {
  return text.toLowerCase().normalize('NFC')
    .replace(/[áéíóúü]/g, letter => letter.normalize('NFD')[0])
    .replace(/^[\s¿¡?!.,;:…«»"']+|[\s¿¡?!.,;:…«»"']+$/g, '')
    .replace(/\s+/g, ' ');
}

const glossBySpanish = new Map(glossCatalog.flatMap(entry =>
  [entry.spanish, ...(entry.aliases ?? [])].map(phrase => [normalizeGlossQuery(phrase), entry])));
