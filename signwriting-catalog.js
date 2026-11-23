// Referencias y licencia en assets/signwriting/README.md.
const signWritingCatalog = [
  { spanish: 'Hola', image: 'hola.png', page: 31, lesson: 'leccion/2/0' },
  { spanish: 'Buenos días', image: 'buenos-dias.png', page: 10, lesson: 'leccion/2/1', aliases: ['Buen día'] },
  { spanish: '¿Cómo estás?', image: 'como-estas.png', page: 70, lesson: 'leccion/2/5' },
  { spanish: 'Adiós', image: 'adios.png', page: 4, lesson: 'leccion/2/6' },
  { spanish: 'Gracias', image: 'gracias.png', page: 28, lesson: 'leccion/3/0' },
  { spanish: 'Perdón', image: 'perdon.png', page: 50, lesson: 'leccion/3/2', aliases: ['Disculpa', 'Disculpe'] },
];

function normalizeSignWritingQuery(text) {
  return text.toLowerCase().normalize('NFC')
    .replace(/[áéíóúü]/g, letter => letter.normalize('NFD')[0])
    .replace(/^[\s¿¡?!.,;:…«»"']+|[\s¿¡?!.,;:…«»"']+$/g, '')
    .replace(/\s+/g, ' ');
}

const signWritingBySpanish = new Map(signWritingCatalog.flatMap(entry =>
  [entry.spanish, ...(entry.aliases ?? [])].map(phrase => [normalizeSignWritingQuery(phrase), entry])));
