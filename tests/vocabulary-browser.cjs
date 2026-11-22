const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

runBrowserTest(async ({ send, run, check, navigate, errors }) => {
  await navigate('#aprender');
  await check('!!document.querySelector(".vocabulary-unit a")');
  await run('document.querySelector(".vocabulary-unit a").click()');
  await check('document.querySelector("main h1").textContent === "Frutas y colores"');
  assert.equal(await run('document.querySelector("nav [aria-current]").hash'), '#aprender');
  assert.deepEqual(await run('[...document.querySelectorAll(".vocabulary-references a")].map(a => new URL(a.href).hostname)'), [
    'educacionespecial.sep.gob.mx', 'www.bibliotecademexico.gob.mx',
  ]);

  const form = 'document.querySelector("#fruit-color-exercise")';
  const submit = () => run(form + '.requestSubmit()');
  const result = () => run(form + '.querySelector(".feedback").textContent');
  async function answer(choices) {
    for (const [index, choice] of choices.entries()) {
      const selector = `input[name="case-${index}"][value="${choice}"]`;
      await run(form + '.querySelector(' + JSON.stringify(selector) + ').click()');
    }
    await submit();
  }

  await submit();
  assert.equal(await run(form + '.checkValidity()'), false);
  assert.equal(await result(), '');
  await answer([0, 1, 1]);
  assert.match(await result(), /0 de 3/);
  assert.equal(await run('[...document.querySelectorAll(".vocabulary-result")].filter(p => p.textContent.includes("Revisa")).length'), 3);
  await answer([1, 0, 2]);
  assert.match(await result(), /3 de 3/);

  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: true });
  await check('window.innerWidth === 320');
  assert.equal(await run('document.documentElement.scrollWidth'), 320);
  await run('document.querySelector(".back").click()');
  await check('location.hash === "#aprender"');
  assert.deepEqual(errors, []);
  console.log('Edge: acceso desde Aprender, referencias, validación, reintento, vista de 320 px y regreso verificados.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
