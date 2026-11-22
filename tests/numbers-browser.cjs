const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

async function numbersScenario({ send, run, check, navigate, errors, requests }) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: 320, height: 740, deviceScaleFactor: 1, mobile: false,
  });
  await navigate('#aprender');
  await check('document.querySelector(".units")');
  assert.deepEqual(await run('Array.from(document.querySelectorAll(".unit h2"), heading => heading.textContent)'), [
    'Abecedario', 'Números', 'Saludos básicos', 'Expresiones cotidianas', 'Frases y comunicación básica',
  ]);
  await run('document.querySelector(\'a[href="#leccion/1/0"]\').click()');
  for (const number of [1, 2, 3]) {
    await check(`document.querySelector('h1').textContent === 'Número ${number}'`);
    await check(`document.querySelector('img[src="assets/numeros/${number}.jpg"]')?.naturalWidth === 260`);
    if (number < 3) await run(`document.querySelector('a[href="#leccion/1/${number}"]').click()`);
  }
  await run('document.querySelector(\'a[href="#ejercicio-numeros"]\').click()');
  const form = 'document.querySelector("#number-exercise")';
  const status = form + '.querySelector("[role=status]").textContent';
  const choose = (index, option) => run(`${form}.querySelector('input[name="answer-${index}"][value="${option}"]').click()`);
  const submit = () => run(form + '.querySelector("button").click()');
  await check(form + ' && [...' + form + '.querySelectorAll("img")].every(image => image.naturalWidth && image.alt)');
  const widths = await run('({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth })');
  assert.ok(widths.content <= widths.viewport, `Desbordamiento horizontal: ${JSON.stringify(widths)}`);
  assert.equal(await run(form + '.checkValidity()'), false);
  await submit();
  assert.equal(await run(status), '');
  await choose(0, 1);
  await choose(1, 3);
  await choose(2, 1);
  await submit();
  await check(status + '.startsWith("2 de 3")');
  await choose(0, 2);
  await submit();
  await check(status + '.includes("Ejercicio completado")');
  await run(form + '.querySelector(\'a[href="#aprender"]\').click()');
  await check('document.querySelector("h1").textContent === "Ruta de aprendizaje"');
  await navigate('#progreso');
  await check('document.querySelector("h1").textContent === "Progreso"');
  assert.equal(await run('/Frutas|Colores/.test(document.querySelector("main").textContent)'), false);
  assert.ok(requests.every(path => !/vocabulario|mediapipe/.test(path)));
  assert.deepEqual(errors, []);
}

runBrowserTest(numbersScenario).then(() => {
  console.log('Edge: fichas del 1 al 3, validación, reintento, vista de 320 px y ruta sin Frutas ni Colores.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
