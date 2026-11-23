const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

async function accountScenario({ send, run, check, navigate, errors }) {
  const displayName = 'María de Prueba';
  const username = 'maria.prueba';
  const password = 'conecta-prueba-123';
  const signIn = '#account-sign-in';
  const signUp = '#account-sign-up';
  const signOut = '#account-sign-out';
  const click = selector => run(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const heading = name => check(`document.querySelector('h1')?.textContent === ${JSON.stringify(name)}`);
  const progress = (unit, index) => run(`document
    .querySelector('a[href="#practica/${unit}/${index}"] .letter-state')?.textContent.trim()`);
  const openProgress = async name => {
    await click('nav a[href="#progreso"]');
    await heading('Progreso');
    await check(`Array.from(document.querySelectorAll('h2')).some(heading =>
      heading.textContent.trim() === ${JSON.stringify(name)})`);
  };
  const submit = (selector, fields) => run(`(() => {
    const form = document.querySelector(${JSON.stringify(selector)});
    for (const [name, value] of Object.entries(${JSON.stringify(fields)})) {
      form.elements.namedItem(name).value = value;
    }
    form.requestSubmit();
  })()`);

  await send('Emulation.setDeviceMetricsOverride', {
    width: 320, height: 740, deviceScaleFactor: 1, mobile: false,
  });
  await navigate();
  await check('!!document.querySelector(\'a[href="#sesion"]\')');
  assert.deepEqual(await run(`(async () => {
    const { createLetterProgress, createNumberProgress } = await import('./letter-progress.mjs');
    return [createLetterProgress().record('A').persistent, createNumberProgress(['1']).record('1').persistent];
  })()`), [true, true]);

  await click('a[href="#sesion"]');
  await check(`!!document.querySelector('${signIn}')`);
  await click('a[href="#registro"]');
  await check(`!!document.querySelector('${signUp}')`);
  assert.ok(await run('document.documentElement.scrollWidth <= document.documentElement.clientWidth'),
    'El formulario de registro debe caber en 320 px.');
  await submit(signUp, { displayName, username, password });
  await heading(`Hola, ${displayName}`);
  await openProgress(displayName);
  assert.deepEqual(await Promise.all([progress(0, 0), progress(1, 0)]), ['0/3 días', '0/3 días']);

  assert.deepEqual(await run(`(async () => {
    const { createLocalProfiles } = await import('./local-profiles.mjs');
    const { createLetterProgress, createNumberProgress } = await import('./letter-progress.mjs');
    const { id } = createLocalProfiles().current();
    return [createLetterProgress(undefined, id).record('B').persistent,
      createNumberProgress(['2'], undefined, id).record('2').persistent];
  })()`), [true, true]);
  assert.equal(await run(`JSON.stringify(Object.values(localStorage)).includes(${JSON.stringify(password)})`), false,
    'La contraseña de prueba no debe quedar en el almacenamiento local.');
  await navigate('?recarga=1#progreso');
  await heading('Progreso');
  await check(`!!document.querySelector('${signOut}')`);
  assert.deepEqual(await Promise.all([progress(0, 1), progress(1, 1)]), ['1/3 días', '1/3 días']);

  await click(signOut);
  await check(`!!document.querySelector('${signIn}')`);
  await submit(signIn, { username, password: 'clave-incorrecta' });
  await check('Boolean(document.querySelector("#account-status")?.textContent.trim())');
  assert.equal(await run('location.hash'), '#sesion');

  await run('location.hash = "#inicio"');
  await heading('Te damos la bienvenida');
  await openProgress('Modo invitado');
  assert.deepEqual(await Promise.all([progress(0, 0), progress(1, 0)]), ['1/3 días', '1/3 días']);
  assert.deepEqual(await Promise.all([progress(0, 1), progress(1, 1)]), ['0/3 días', '0/3 días']);

  await click('a[href="#sesion"]');
  await check(`!!document.querySelector('${signIn}')`);
  await submit(signIn, { username: username.toUpperCase(), password });
  await heading(`Hola, ${displayName}`);
  await openProgress(displayName);
  assert.deepEqual(await Promise.all([progress(0, 1), progress(1, 1)]), ['1/3 días', '1/3 días']);
  assert.deepEqual(errors, []);
}

runBrowserTest(accountScenario).then(() => {
  console.log('Edge: registro a 320 px, sesión tras recarga, cierre y reingreso, contraseña incorrecta e historial separado.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
