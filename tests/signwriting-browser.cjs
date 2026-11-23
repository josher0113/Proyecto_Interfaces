const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

async function signWritingScenario({ send, run, check, navigate, errors, requests }) {
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: false });
  await navigate('#traductor');
  await check('document.querySelector("h1")?.textContent === "Deletreador LSM"');

  const alphabet = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];
  const result = 'document.querySelector("#translation-writing")';
  const status = 'document.querySelector("#translation-status")';
  const glyphs = 'Array.from(document.querySelectorAll(".spelling-word img"))';
  const labels = 'Array.from(document.querySelectorAll(".spelling-word"), word => word.textContent.replace(/\\s/g, ""))';
  const submit = phrase => run(`
    document.querySelector('#phrase').value = ${JSON.stringify(phrase)};
    document.querySelector('#translate').requestSubmit();
  `);
  const localGlyphs = () => check(glyphs + '.every(image => image.complete && image.naturalWidth === 128)');

  assert.equal(await run(result + '.hidden'), true);
  await submit('An\u0303o, pingüino.\nÉxito');
  await localGlyphs();
  assert.deepEqual(await run(labels), ['AÑO', 'PINGUINO', 'EXITO']);
  assert.equal(await run(glyphs + '[1].getAttribute("src")'), 'assets/signwriting/abecedario/enie.png');

  await submit('Buenos días');
  assert.deepEqual(await run(labels), ['BUENOS', 'DIAS']);

  await submit(alphabet.join(''));
  await check(glyphs + '.length === 27');
  await localGlyphs();
  assert.deepEqual(await run(labels), [alphabet.join('')]);
  assert.equal(await run('new Set(' + glyphs + '.map(image => image.src)).size'), 27);
  assert.equal(await run(glyphs + '.every(image => new URL(image.src).origin === location.origin)'), true);
  const widths = await run('({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth })');
  assert.ok(widths.content <= widths.viewport, 'El abecedario completo debe ajustarse a 320 px.');

  await submit('LSM 123 🔤');
  assert.deepEqual(await run(labels), ['LSM']);
  assert.match(await run(status + '.textContent'), /Se omitieron/);
  await submit('123 ¿!');
  assert.equal(await run(result + '.hidden'), true);
  assert.equal(await run(glyphs + '.length'), 0);
  assert.match(await run(status + '.textContent'), /Escribe al menos una letra/);

  const pasted = '<iframe>';
  await submit(pasted);
  assert.equal(await run(status + '.children.length'), 0);
  assert.ok((await run(status + '.textContent')).includes(pasted));

  await run('document.querySelector(".translation-examples summary").click()');
  await run('document.querySelector("[data-signwriting-example=Hola]").click()');
  assert.deepEqual(await run(labels), ['HOLA']);
  assert.equal(await run('document.querySelector("#phrase").value'), 'Hola');
  await run('document.querySelector(\'#translation-writing a[href="#abecedario"]\').click()');
  await check('document.querySelector("h1").textContent === "Abecedario"');

  for (const [step, letter] of alphabet.entries()) {
    await run('location.hash = "#leccion/0/' + step + '"');
    await check(`document.querySelector("h1")?.textContent === ${JSON.stringify('Letra ' + letter)}
      && document.querySelector(".alphabet-writing img")?.naturalWidth === 128`);
    assert.match(await run('document.querySelector(".alphabet-writing img").alt'), new RegExp('Letra ' + letter));
  }
  assert.ok(requests.includes('assets/signwriting/abecedario/enie.png'));
  assert.deepEqual(errors, []);
}

runBrowserTest(signWritingScenario).then(() => {
  console.log('Edge: 27 grafías locales, Ñ, acentos, separación de palabras, caracteres omitidos y fichas del abecedario a 320 px.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
