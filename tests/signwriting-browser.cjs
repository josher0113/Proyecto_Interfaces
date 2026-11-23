const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

async function signWritingScenario({ send, run, check, navigate, errors, requests }) {
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: false });
  await navigate('#traductor');
  await check('document.querySelector("h1")?.textContent === "Traductor LSM"');

  const status = 'document.querySelector("#translation-status")';
  const result = 'document.querySelector("#translation-writing")';
  const image = 'document.querySelector("#translation-writing-image")';
  const reference = 'document.querySelector("#translation-reference")';
  const submit = phrase => run(`
    document.querySelector('#phrase').value = ${JSON.stringify(phrase)};
    document.querySelector('#translate').requestSubmit();
  `);

  const checkImage = filename => check(`${image}.getAttribute("src") === "assets/signwriting/${filename}"
    && ${image}.complete && ${image}.naturalWidth === 280 && !${result}.hidden`);

  assert.equal(await run(result + '.hidden'), true);
  assert.equal(await run(image + '.hasAttribute("src")'), false);
  assert.equal(await run('document.querySelectorAll(".translation video, .translation iframe").length'), 0);

  await submit('  ¡  BUENOS   DIAS  !  ');
  await checkImage('buenos-dias.png');
  assert.equal(await run(reference + '.hash'), '#leccion/2/1');

  await submit('¿Como\n\t  estas?');
  await checkImage('como-estas.png');
  await submit('Disculpe.');
  await checkImage('perdon.png');

  const catalog = await run('signWritingCatalog');
  assert.equal(catalog.length, 6);
  for (const entry of catalog) {
    await submit(entry.spanish);
    await checkImage(entry.image);
    assert.ok((await run(image + '.alt')).includes(entry.spanish));
    assert.ok((await run('document.querySelector("#translation-credit").textContent')).includes('p. ' + entry.page));
    assert.equal(await run(reference + '.hash'), '#' + entry.lesson);
    const [, unit, step] = entry.lesson.split('/');
    assert.ok(await run(`units[${Number(unit)}][2][${Number(step)}]`), entry.spanish + ' debe enlazar una ficha existente.');
  }

  for (const phrase of ['Por favor', 'Hola, quiero aprender LSM']) {
    await submit(phrase);
    assert.match(await run(status + '.textContent'), /todavía no está en el catálogo/);
    assert.equal(await run(result + '.hidden'), true);
    assert.equal(await run(image + '.hasAttribute("src")'), false);
  }

  const textOnly = '<img src="imagen.html">';
  await submit(textOnly);
  assert.ok((await run(status + '.textContent')).includes(textOnly));
  assert.equal(await run(status + '.children.length'), 0);
  await submit('  !!!  ');
  assert.match(await run(status + '.textContent'), /Escribe una palabra/);
  assert.equal(await run('normalizeSignWritingQuery("AÑO")'), 'año');

  await run('document.querySelector(".translation-examples summary").click()');
  assert.equal(await run('document.querySelectorAll("[data-signwriting-example]").length'), catalog.length);
  const overflow = await run('document.documentElement.scrollWidth - document.documentElement.clientWidth');
  assert.ok(overflow <= 0, 'La vista de 320 px debe caber horizontalmente.');
  await run('document.querySelector(\'button[data-signwriting-example="Gracias"]\').click()');
  await checkImage('gracias.png');
  assert.equal(await run('document.querySelector("#phrase").value'), 'Gracias');
  assert.ok(await run(`${image}.getBoundingClientRect().right <= document.documentElement.clientWidth`));
  assert.equal(await run(`[...document.querySelectorAll('.translation [src], .translation a[href]')]
    .every(node => new URL(node.src || node.href).origin === location.origin)`), true);
  assert.ok(requests.includes('assets/signwriting/gracias.png'));
  await run(reference + '.click()');
  await check('location.hash === "#leccion/3/0" && document.querySelector("h1")?.textContent === "Gracias"');
  assert.deepEqual(errors, []);
}

runBrowserTest(signWritingScenario).then(() => {
  console.log('Edge: seis grafías locales de SignWriting, variantes de entrada, consulta sin coincidencia y práctica relacionada a 320 px.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
