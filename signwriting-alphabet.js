const spellingExamples = ['Hola', 'Año', 'Conecta LSM'];

function signWritingGlyph(letter) {
  const name = letter === 'Ñ' ? 'enie' : letter.toLowerCase();
  return `assets/signwriting/abecedario/${name}.png`;
}

function readSpelling(text) {
  const normalized = text.normalize('NFC');
  const words = (normalized.match(/[A-Za-zÑñÁÉÍÓÚÜáéíóúü]+/g) ?? []).map(word => [...word.toUpperCase()
    .replace(/[ÁÉÍÓÚÜ]/g, vowel => vowel.normalize('NFD')[0])]);
  const unsupported = /[^A-Za-zÑñÁÉÍÓÚÜáéíóúü\p{P}\s]/u.test(normalized);
  return { words, unsupported };
}
