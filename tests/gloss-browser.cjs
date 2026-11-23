const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

async function glossScenario({ send, run, check, navigate, errors }) {
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: false });
  await navigate('#traductor');
  await check('document.querySelector("h1")?.textContent === "Traductor LSM"');

  const status = 'document.querySelector("#translation-status")';
  const gloss = 'document.querySelector("#translation-gloss")';
  const reference = 'document.querySelector("#translation-reference")';
  const submit = phrase => run(`
    document.querySelector('#phrase').value = ${JSON.stringify(phrase)};
    document.querySelector('#translate').requestSubmit();
  `);

  assert.equal(await run(gloss + '.hidden'), true);
  assert.equal(await run(reference + '.hidden'), true);
  assert.equal(await run('document.querySelectorAll(".translation video, .translation iframe").length'), 0);

  await submit('  ¡  BUENOS   DIAS  !  ');
  await check(gloss + '.textContent === "BUENO + DÍA" && !' + gloss + '.hidden');
  assert.equal(await run(reference + '.querySelector("a").hash'), '#leccion/2/1');

  await submit('¿Como\n\t  estas?');
  await check(gloss + '.textContent === "CÓMO ESTAR"');
  await submit('Disculpe.');
  await check(gloss + '.textContent === "PERDÓN"');

  for (const entry of await run('glossCatalog')) {
    await submit(entry.spanish);
    assert.equal(await run(gloss + '.textContent'), entry.gloss);
    assert.equal(await run(reference + '.querySelector("a").hash'), '#' + entry.lesson);
    const [, unit, step] = entry.lesson.split('/');
    assert.ok(await run(`units[${Number(unit)}][2][${Number(step)}]`), entry.spanish + ' debe enlazar una ficha existente.');
  }

  await submit('Hola, quiero aprender LSM');
  assert.match(await run(status + '.textContent'), /todavía no está en el catálogo/);
  assert.equal(await run(gloss + '.textContent'), '');
  assert.equal(await run(gloss + '.hidden'), true);
  assert.equal(await run(reference + '.hidden'), true);

  const textOnly = '<img src="imagen.html">';
  await submit(textOnly);
  assert.ok((await run(status + '.textContent')).includes(textOnly));
  assert.equal(await run(status + '.children.length'), 0);
  await submit('  !!!  ');
  assert.match(await run(status + '.textContent'), /Escribe una palabra/);
  assert.equal(await run('normalizeGlossQuery("AÑO")'), 'año');

  await run('document.querySelector(".translation-examples summary").click()');
  assert.equal(await run('document.querySelectorAll("[data-gloss-example]").length'), 13);
  const overflow = await run('document.documentElement.scrollWidth - document.documentElement.clientWidth');
  assert.ok(overflow <= 0, 'La vista de 320 px debe caber horizontalmente.');
  await run('document.querySelector(\'button[data-gloss-example="Mucho gusto"]\').click()');
  await check(gloss + '.textContent === "MUCHO GUSTO" && !' + reference + '.hidden');
  assert.equal(await run('document.querySelector("#phrase").value'), 'Mucho gusto');
  await run(reference + '.querySelector("a").click()');
  await check('location.hash === "#leccion/4/0" && document.querySelector("h1")?.textContent === "Presentarse"');
  assert.deepEqual(errors, []);
}

runBrowserTest(glossScenario).then(() => {
  console.log('Edge: glosas, variantes de entrada, ejemplo, consulta sin coincidencia y referencia local a 320 px.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
