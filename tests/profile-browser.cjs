const assert = require('node:assert/strict');
const { runBrowserTest } = require('./browser-harness.cjs');

async function accountScenario({ send, run, check, navigate, errors, requests }) {
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
  const expectStreak = days => check(`document.querySelector('#practice-streak [data-streak-days]')
    ?.dataset.streakDays === '${days}'`);
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
  // Fixture data in a temporary browser profile represents saved successful practices.
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
  await expectStreak(0);
  await openProgress(displayName);
  await expectStreak(0);
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
  await click('nav a[href="#inicio"]');
  await heading(`Hola, ${displayName}`);
  await expectStreak(1);
  assert.equal(await run(`(async () => {
    const { createLocalProfiles } = await import('./local-profiles.mjs');
    const { createLetterProgress } = await import('./letter-progress.mjs');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return createLetterProgress(undefined, createLocalProfiles().current().id).record('C', yesterday).persistent;
  })()`), true);
  await navigate('?recarga=1#progreso');
  await heading('Progreso');
  await check(`!!document.querySelector('${signOut}')`);
  await expectStreak(2);
  assert.deepEqual(await Promise.all([progress(0, 1), progress(1, 1)]), ['1/3 días', '1/3 días']);

  await click(signOut);
  await check(`!!document.querySelector('${signIn}')`);
  await submit(signIn, { username, password: 'clave-incorrecta' });
  await check('Boolean(document.querySelector("#account-status")?.textContent.trim())');
  assert.equal(await run('location.hash'), '#sesion');

  await run('location.hash = "#inicio"');
  await heading('Te damos la bienvenida');
  await expectStreak(1);
  await openProgress('Modo invitado');
  await expectStreak(1);
  assert.deepEqual(await Promise.all([progress(0, 0), progress(1, 0)]), ['1/3 días', '1/3 días']);
  assert.deepEqual(await Promise.all([progress(0, 1), progress(1, 1)]), ['0/3 días', '0/3 días']);

  await click('a[href="#sesion"]');
  await check(`!!document.querySelector('${signIn}')`);
  await submit(signIn, { username: username.toUpperCase(), password });
  await heading(`Hola, ${displayName}`);
  await expectStreak(2);
  await openProgress(displayName);
  await expectStreak(2);
  assert.deepEqual(await Promise.all([progress(0, 1), progress(1, 1)]), ['1/3 días', '1/3 días']);

  await run('location.hash = "#leccion/0/0"');
  await heading('Letra A');
  await check(`(() => {
    const photo = document.querySelector('img.alphabet-photo[src="assets/abecedario/A.jpg"]');
    if (!photo?.complete || !photo.naturalWidth) return false;
    const bounds = photo.getBoundingClientRect();
    return getComputedStyle(photo).visibility === 'visible'
      && bounds.width > 0 && bounds.height > 0 && bounds.top < innerHeight && bounds.bottom > 0;
  })()`);
  assert.ok(requests.includes('assets/abecedario/A.jpg'), 'La ficha debe cargar la foto real de la letra A.');
  assert.equal(await run('!!document.querySelector("#camera-toggle")'), false);
  assert.deepEqual(errors, []);
}

runBrowserTest(accountScenario).then(() => {
  console.log('Edge: sesiones, historial separado, rachas de 0 a 2 días y foto de la A antes de practicar con cámara.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
