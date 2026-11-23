const alphabetLetters = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];
const motionLetters = new Set(['J', 'Ñ', 'P', 'Q', 'X', 'Z']);
const numberSigns = Array.from({ length: 10 }, (_, index) => String(index + 1));
const numberDemos = typeof numberReferences === 'undefined' ? {} : numberReferences;
const guidedUnits = {
  2: { route: 'saludos',
    references: typeof greetingReferences !== 'undefined' && Array.isArray(greetingReferences) ? greetingReferences : [] },
  3: { route: 'expresiones', references: typeof expressionReferences === 'undefined' ? [] : expressionReferences },
  4: { route: 'frases', references: typeof phraseReferences === 'undefined' ? [] : phraseReferences },
};
const units = [
  ['Abecedario', 'Explora el alfabeto manual y su uso para deletrear.', alphabetLetters.map(letter => `Letra ${letter}`)],
  ['Números', 'Practica las señas del 1 al 10.', numberSigns.map(number => `Número ${number}`)],
  ['Saludos básicos', 'Aprende a saludar y despedirte en LSM.', guidedUnits[2].references.map(reference => reference?.title)],
  ['Expresiones cotidianas', 'Practica cómo agradecer, pedir algo y disculparte en LSM.', guidedUnits[3].references.map(reference => reference?.title)],
  ['Frases y comunicación básica', 'Ensaya cómo presentarte, pedir ayuda e invitar a alguien a participar.', guidedUnits[4].references.map(reference => reference?.title)],
];

const app = document.querySelector('#app');
const dictation = createDictation();
const exerciseDescriptions = {
  A: 'Cuatro dedos flexionados hacia la palma y el pulgar al costado.',
  B: 'Cuatro dedos extendidos y juntos, con el pulgar flexionado.',
  C: 'Dedos curvados, con el pulgar separado y una abertura entre las puntas.',
};
const exerciseCards = ['B', 'C', 'A'];
const gesturePrompt = 'Mantén una sola mano dentro del encuadre.';
let alphabetCompleted = false;
let cameraSession = null;
let letterProgress = null;
let numberProgress = null;
let practiceGoal = 3;
let appReady = false;

function practiceState(entry, isNumber = false) {
  if (entry?.mastered) return isNumber ? 'Aprendido' : 'Aprendida';
  return `${entry?.days ?? 0}/${practiceGoal} días`;
}

function practiceStateClass(entry) {
  if (entry?.mastered) return 'letter-mastered';
  return entry?.days ? 'letter-practicing' : '';
}

function alphabetGrid(progress, destination) {
  return `<ul class="alphabet-index">${alphabetLetters.map((letter, step) => {
    const entry = progress?.letters[letter];
    const mediaType = motionLetters.has(letter) ? 'Video' : 'Foto';
    return `<li><a class="alphabet-letter ${practiceStateClass(entry)}" href="#${destination}/0/${step}"
      aria-label="Letra ${letter}, ${mediaType}, ${practiceState(entry)}">
      <strong>${letter}</strong><span>${mediaType}</span><span class="letter-state">${practiceState(entry)}</span></a></li>`;
  }).join('')}</ul>`;
}

function alphabetMasterySummary(progress) {
  return `${progress?.masteredCount ?? 0} de ${alphabetLetters.length} letras aprendidas`;
}

function numberMasterySummary(progress) {
  return `${progress?.masteredCount ?? 0} de ${numberSigns.length} números aprendidos`;
}

function numberGrid(progress, destination) {
  return `<ul class="alphabet-index number-index">${numberSigns.map((number, step) => {
    const entry = progress?.letters[number];
    const mediaType = numberDemos[number]?.motion ? 'Movimiento' : 'Foto';
    const state = practiceState(entry, true);
    return `<li><a class="number-card ${practiceStateClass(entry)}" href="#${destination}/1/${step}"
      aria-label="Número ${number}, ${mediaType}, ${state}">
      <strong>${number}</strong><span>${mediaType}</span><span class="letter-state">${state}</span></a></li>`;
  }).join('')}</ul>`;
}

const alphabetPhoto = (letter, description) =>
  `<img class="alphabet-photo" src="assets/abecedario/${letter}.jpg" alt="${description}" width="480" height="640">`;
const alphabetCredit = () => `<p class="media-credit">Material de Yahilyn Rodriguez, Michelle Bocanegra y Kenya Sanchez.
  Biblioteca Universitaria UABCS · CC BY-SA 4.0. Imágenes redimensionadas.</p>`;
const signWritingCredit = () => '<p class="media-credit">Grafías del diccionario de LSM de SignPuddle Online (2025) · Sutton SignWriting · CC BY-SA 3.0.</p>';
const glossaryCredit = page => `<p class="media-credit">Recortes de las fotografías de Servando Alvarado Cisneros,
  <i>Glosario universitario de Lengua de Señas Mexicana</i>, Universidad de Guadalajara, p. ${page} · CC BY-NC-SA 4.0.</p>`;

function alphabetDemo(letter) {
  const description = exerciseDescriptions[letter];
  const visual = motionLetters.has(letter)
    ? `<video class="alphabet-video" controls playsinline preload="metadata" aria-label="Video de la letra ${letter} en LSM"
        src="assets/abecedario/${letter}.mp4"></video>
      <figcaption><a href="assets/abecedario/${letter}.mp4">Abrir video de la letra ${letter}</a></figcaption>`
    : alphabetPhoto(letter, description ? '' : `Configuración manual de la letra ${letter} en LSM`);
  return `<figure class="alphabet-demo">${visual}
    ${description ? `<figcaption>${description}</figcaption>` : ''}</figure>${alphabetCredit()}
    <figure class="alphabet-writing">
      <img src="${signWritingGlyph(letter)}" width="96" height="96" alt="Letra ${letter} en SignWriting">
      <figcaption>SignWriting</figcaption>
    </figure>${signWritingCredit()}`;
}

function alphabetIndex() {
  return `<a class="back" href="#aprender">← Ruta de aprendizaje</a>
    ${heading('Aprender', 'Abecedario', 'Elige una letra para ver su referencia y practicarla con la cámara.')}
    <article>${alphabetGrid(letterProgress?.snapshot(), 'leccion')}
      <div class="actions">${link('ejercicio', alphabetCompleted ? 'Repetir ejercicio de A, B y C' : 'Ejercicio de A, B y C')}</div>
    </article>`;
}

function alphabetExercise() {
  return `<a class="back" href="#leccion/0/2">← Volver a la letra C</a>
    ${heading('Abecedario', 'Ejercicio de A, B y C', 'Selecciona la letra que corresponde a cada configuración de la mano.')}
    <article><form id="alphabet-exercise">
      <div class="exercise-grid">${exerciseCards.map((letter, index) => `<fieldset>
        <legend>Configuración ${index + 1}</legend>
        ${alphabetPhoto(letter, exerciseDescriptions[letter])}
        <div class="choices">${Object.keys(exerciseDescriptions).map((letter, optionIndex) => `<label>
          <input type="radio" name="answer-${index}" value="${letter}" ${optionIndex === 0 ? 'required' : ''}> ${letter}
        </label>`).join('')}</div>
      </fieldset>`).join('')}</div>
      <div class="actions"><button>Comprobar respuestas</button>${link('leccion/0/0', 'Repasar desde A', true)}</div>
      <p class="feedback" role="status"></p>
      <div id="alphabet-completion" hidden><p>Piloto completado durante esta visita.</p>
        <div class="actions">${link('aprender', 'Volver a la ruta')}</div></div>
    </form>${alphabetCredit()}</article>`;
}

function numberDemo(number) {
  const reference = numberDemos[number];
  if (!reference) return '<p>No se pudo cargar la referencia de esta seña. Vuelve a cargar la página.</p>';
  const { description, motion, images, page } = reference;
  return `<figure class="alphabet-demo"><div class="number-poses">${images.map((src, index) => {
    const alt = images.length > 1 ? `Posición ${index + 1} de ${images.length} de la seña para ${number}` : '';
    return `<img class="alphabet-photo" src="${src}" alt="${alt}">`;
  }).join('')}</div><figcaption>${description}${motion ? `<p>${motion}</p>` : ''}</figcaption></figure>${glossaryCredit(page)}`;
}

function numberIndex() {
  return `<a class="back" href="#aprender">← Ruta de aprendizaje</a>
    ${heading('Aprender', 'Números', 'Elige un número para ver su referencia y practicarlo con la cámara.')}
    <article>${numberGrid(numberProgress?.snapshot(), 'leccion')}</article>`;
}

function guidedIndex(index) {
  const [title, , topics] = units[index];
  const links = visibleSteps(topics).map(step => `<li>${link(`leccion/${index}/${step}`, topics[step], true)}</li>`).join('');
  return `<a class="back" href="#aprender">← Ruta de aprendizaje</a>
    ${heading('Aprender', title, 'Elige una seña para consultar la referencia y practicarla frente a la cámara.')}
    <article>${links ? `<ul class="actions reference-links">${links}</ul>`
      : '<p>No se pudieron cargar las fichas. Recarga la página para volver a intentar.</p>'}</article>`;
}

function visibleSteps(topics) {
  return topics.flatMap((title, step) => title ? [step] : []);
}

function photoDemo({ title, description, cue, images, page }) {
  const photos = images.map((src, index) =>
    `<img class="alphabet-photo" src="${src}" alt="Posición ${index + 1} de ${images.length} para ${title}"
      width="400" height="352">`).join('');
  return `<figure class="alphabet-demo"><div class="reference-poses">${photos}</div>
    <figcaption>${description}</figcaption></figure>${cue ? `<p>${cue}</p>` : ''}${glossaryCredit(page)}`;
}

function guidedDemo(reference) {
  if (!reference.signs) return photoDemo(reference);
  const { context, cue, signs, usesAlphabet } = reference;
  return `<p class="phrase-context">${context}</p><p>${cue}</p>
    ${usesAlphabet ? `<div class="actions">${link('abecedario', 'Consultar el abecedario', true)}</div>` : ''}
    <h2 class="phrase-reference-heading">Señas de apoyo</h2>
    ${signs.map(sign => `<section class="phrase-sign"><h3>${sign.title}</h3>${photoDemo(sign)}</section>`).join('')}`;
}

const brand = 'Conecta <small>LSM</small>';
const link = (href, label, secondary = false) =>
  `<a class="button ${secondary ? 'secondary' : ''}" href="#${href}">${label}</a>`;
const meter = (label, value) =>
  `<div class="meter"><span>${label}</span><span>${value}%</span><progress aria-label="${label}" value="${value}" max="100"></progress></div>`;
const heading = (label, title, description) => `<header class="page-heading"><p class="eyebrow">${label}</p>
  <h1>${title}</h1><p>${description}</p></header>`;
const stats = () => `<div class="stats"><article><strong>4</strong><span>días de racha</span></article>
  <article><strong>6</strong><span>lecciones completadas</span></article></div>`;

function welcome() {
  return `<div class="welcome"><section><a class="brand" href="#bienvenida">${brand}</a>
    <p class="eyebrow">Lengua de Señas Mexicana</p><h1>Aprende a comunicarte en LSM.</h1>
    <p>Explora la Lengua de Señas Mexicana con lecciones breves, práctica guiada y un espacio de consulta.</p>
    <div class="actions">${link('inicio', 'Comenzar')}<button class="secondary" data-note="El inicio de sesión se habilitará en una etapa posterior.">Iniciar sesión</button></div>
    <p class="feedback" role="status"></p></section>
    <div class="cover"><div class="bubbles" aria-hidden="true"><span>“</span><span>…”</span></div><p>Lengua de Señas Mexicana</p></div></div>`;
}

function dashboard() {
  return `${heading('Tu espacio de aprendizaje', 'Hola, Alex', 'Continúa con tu ruta de Lengua de Señas Mexicana.')}
    <div class="grid"><article class="feature"><p class="eyebrow">Alfabeto manual</p><h2>Abecedario</h2>
      <p>${alphabetMasterySummary(letterProgress?.snapshot())}.</p>${link('abecedario', 'Explorar abecedario')}</article>
      <article><h2>Esta semana</h2>${stats()}${meter('Meta semanal', 60)}</article>
    </div><article class="quick"><div><h2>Deletreador LSM</h2><p>Deletrea palabras y nombres con el abecedario de SignWriting para LSM.</p></div>
      ${link('traductor', 'Abrir deletreador', true)}</article>`;
}

function learning() {
  const progressSummaries = [
    alphabetMasterySummary(letterProgress?.snapshot()),
    numberMasterySummary(numberProgress?.snapshot()),
    'Práctica guiada con cámara',
    'Práctica guiada con cámara',
    'Práctica guiada con cámara',
  ];
  const unitLinks = [
    link('abecedario', 'Explorar abecedario'),
    link('numeros', 'Explorar números'),
    link('saludos', 'Explorar saludos'),
    link('expresiones', 'Explorar expresiones'),
    link('frases', 'Explorar frases'),
  ];
  return `${heading('Aprender', 'Ruta de aprendizaje', 'Avanza desde el alfabeto manual hasta situaciones cotidianas.')}
    <div class="units">${units.map(([title, description], index) => `<article class="unit">
      <span class="unit-number" aria-label="Unidad ${index + 1}">${index + 1}</span>
      <div><p class="eyebrow">${progressSummaries[index]}</p>
      <h2>${title}</h2><p>${description}</p>${index === 0 && alphabetCompleted ? '<p>Ejercicio de A, B y C completado.</p>' : ''}</div>
      ${unitLinks[index]}
    </article>`).join('')}</div>`;
}

function lesson(unit, index, step) {
  const [title, description, topics] = unit;
  const letter = index === 0 ? alphabetLetters[step] : null;
  const number = index === 1 ? numberSigns[step] : null;
  const guide = guidedUnits[index];
  const positionSteps = visibleSteps(topics);
  const position = positionSteps.indexOf(step);
  const previous = positionSteps[position - 1];
  const next = positionSteps[position + 1];
  const indexPage = guide ? [guide.route, title]
    : [['abecedario', 'Abecedario'], ['numeros', 'Números']][index] ?? ['aprender', 'Ruta de aprendizaje'];
  let demonstration;
  if (letter) {
    demonstration = alphabetDemo(letter);
  } else if (number) {
    demonstration = numberDemo(number);
  } else {
    demonstration = guidedDemo(guide.references[step]);
  }
  return `<a class="back" href="#${indexPage[0]}">← ${indexPage[1]}</a>
    ${heading(title, topics[step], number || guide ? 'Observa la referencia y practica la seña con la cámara.' : description)}
    <article>${meter(`Paso ${position + 1} de ${positionSteps.length}`, Math.round((position + 1) / positionSteps.length * 100))}
      ${demonstration}
      <div class="actions">${letter === 'C' ? link('ejercicio', 'Ejercicio de A, B y C') : ''}
        ${link(`practica/${index}/${step}`, 'Ir a práctica con cámara', true)}</div>
    </article><div class="between actions">
      ${previous !== undefined ? link(`leccion/${index}/${previous}`, 'Anterior', true) : '<button class="secondary" disabled>Anterior</button>'}
      ${next !== undefined ? link(`leccion/${index}/${next}`, 'Siguiente')
        : link(indexPage[0], guide ? `Volver a ${title}`
          : ['Volver al abecedario', 'Volver a Números'][index] ?? 'Volver a la ruta')}
    </div>`;
}

function practice(unit, index, step) {
  const isNumber = index === 1;
  const [title, , topics] = unit;
  const guide = guidedUnits[index];
  const next = guide ? visibleSteps(topics).find(candidate => candidate > step) : undefined;
  const sign = isNumber ? numberSigns[step] : index === 0 ? alphabetLetters[step] : null;
  const reference = isNumber ? numberDemos[sign] : null;
  const canRecognize = Boolean(sign && (!isNumber || reference));
  const isMotion = isNumber ? Boolean(reference?.motion) : motionLetters.has(sign);
  const handCount = reference?.hands ?? 1;
  const progress = canRecognize ? (isNumber ? numberProgress : letterProgress)?.snapshot() : null;
  const entry = progress?.letters[sign];
  const label = isNumber ? `del número ${sign}` : `de la letra ${sign}`;
  const framing = handCount === 2 ? 'Coloca las dos manos dentro del encuadre' : 'Coloca la mano dentro del encuadre';
  const demonstration = guide ? guidedDemo(guide.references[step])
    : isNumber ? numberDemo(sign) : alphabetDemo(sign);
  const description = guide
    ? 'Repite la seña y usa la vista en espejo para comparar la posición de tus manos y el movimiento con la referencia.'
    : `${framing} y busca buena iluminación.`;
  return `<a class="back" href="#leccion/${index}/${step}">← Volver a la lección</a>
    ${heading(isNumber ? 'Práctica de números con cámara' : 'Práctica con cámara', topics[step], description)}
    <div class="grid"><article><h2>Referencia</h2>${demonstration}</article>
    <article><h2>Vista de cámara</h2>
      <div class="camera-preview">
        <p id="camera-placeholder">Vista previa apagada</p>
        <video id="camera-video" aria-label="Vista en vivo de la cámara" autoplay muted playsinline hidden></video>
        ${canRecognize ? '<canvas id="gesture-overlay" aria-hidden="true" hidden></canvas>' : ''}
      </div>
      <div class="actions"><button type="button" id="camera-toggle">Activar cámara</button>
        ${isMotion ? '<button type="button" id="gesture-attempt" class="secondary" disabled>Evaluar movimiento</button>' : ''}</div>
      <p id="camera-status" role="status">El video se muestra en tu dispositivo, sin grabarse ni enviarse.</p>
      ${canRecognize ? `<p id="gesture-status" role="status" data-${isNumber ? 'number' : 'letter'}="${sign}"
        data-hand-count="${handCount}">${practicePrompt(isNumber, handCount)}</p>` : ''}
    </article></div>
    ${canRecognize ? `<article class="practice-progress">
      <div class="practice-progress-heading"><h2>Progreso ${label}</h2>
        <span id="practice-letter-state" class="letter-state ${practiceStateClass(entry)}">${practiceState(entry, isNumber)}</span></div>
      <p>${isNumber ? 'El número' : 'La letra'} pasa a verde tras ${practiceGoal} prácticas correctas en días distintos.</p>
      <div class="actions"><button type="button" id="practice-record" disabled>${practiceRecordLabel(entry, isNumber)}</button></div>
      <p id="practice-record-status" role="status"></p>
      <p id="practice-storage-status">${practiceStorageMessage(progress)}</p>
    </article>` : ''}
    ${guide ? `<div class="actions">${next !== undefined
      ? link(`practica/${index}/${next}`, 'Practicar siguiente seña')
      : link(guide.route, `Volver a ${title}`)}</div>` : ''}`;
}

function practiceRecordLabel(entry, isNumber) {
  if (entry?.mastered) return isNumber ? 'Número aprendido' : 'Letra aprendida';
  return entry?.practicedToday ? 'Práctica de hoy registrada' : 'Registrar práctica';
}

function practicePrompt(isNumber, handCount) {
  if (location.protocol === 'file:') {
    return `Abre Conecta LSM en HTTPS o localhost para reconocer y registrar ${isNumber ? 'números' : 'letras'}.`;
  }
  return handCount === 2 ? 'Mantén las dos manos dentro del encuadre.' : gesturePrompt;
}

function practiceStorageMessage(progress) {
  if (!progress) {
    return location.protocol === 'file:' ? 'El registro está disponible desde HTTPS o localhost.' : 'No se pudo cargar el registro de práctica.';
  }
  return progress.persistent ? 'El progreso se guarda en este navegador.' : 'No se pudo guardar todo el progreso. Los avances sin guardar quedan en esta visita.';
}

function matchedToday(session, date = new Date()) {
  return session?.matchedAt?.toDateString() === date.toDateString();
}

function refreshPracticeProgress(view, message) {
  if (!view.recordButton) return;
  const progress = (view.isNumber ? numberProgress : letterProgress)?.snapshot();
  const entry = progress?.letters[view.sign];
  const canRecord = Boolean(entry && matchedToday(cameraSession) && !entry.mastered && !entry.practicedToday);
  view.recordButton.disabled = !canRecord;
  view.recordButton.textContent = practiceRecordLabel(entry, view.isNumber);
  view.letterState.textContent = practiceState(entry, view.isNumber);
  view.letterState.className = `letter-state ${practiceStateClass(entry)}`;
  view.storageStatus.textContent = practiceStorageMessage(progress);
  view.recordStatus.textContent = message ?? (canRecord ? 'Acierto confirmado. Puedes registrar la práctica de hoy.' : '');
}

function recordPractice() {
  const date = new Date();
  if (!matchedToday(cameraSession, date)) return;
  const { view } = cameraSession;
  const progress = view.isNumber ? numberProgress : letterProgress;
  if (!progress || view.recordButton.disabled) return;
  const entry = progress.record(view.sign, date);
  const subject = view.isNumber ? 'Este número' : 'Esta letra';
  const message = entry.credited
    ? (entry.mastered ? `Práctica registrada. ${subject} ya aparece en verde.` : 'Práctica registrada. Vuelve otro día para seguir avanzando.')
    : 'La práctica de hoy ya está registrada.';
  refreshPracticeProgress(view, message);
}

const cameraErrors = {
  NotAllowedError: 'No se concedió acceso a la cámara. Revisa el permiso del sitio en el navegador y vuelve a intentar.',
  NotFoundError: 'No encontramos una cámara. Conecta o habilita una y vuelve a intentar.',
  NotReadableError: 'No se pudo usar la cámara. Cierra otras aplicaciones que puedan estar usándola y vuelve a intentar.',
};

function cameraView() {
  const gesture = app.querySelector('#gesture-status');
  return {
    button: app.querySelector('#camera-toggle'),
    video: app.querySelector('#camera-video'),
    placeholder: app.querySelector('#camera-placeholder'),
    status: app.querySelector('#camera-status'),
    gesture,
    sign: gesture?.dataset.number ?? gesture?.dataset.letter,
    isNumber: Boolean(gesture?.dataset.number),
    handCount: Number(gesture?.dataset.handCount ?? 1),
    canvas: app.querySelector('#gesture-overlay'),
    attempt: app.querySelector('#gesture-attempt'),
    recordButton: app.querySelector('#practice-record'),
    letterState: app.querySelector('#practice-letter-state'),
    recordStatus: app.querySelector('#practice-record-status'),
    storageStatus: app.querySelector('#practice-storage-status'),
  };
}

function stopCamera(message = 'Cámara apagada.') {
  if (!cameraSession) return;
  const { view, stream, stopRecognition } = cameraSession;
  cameraSession = null;
  stopRecognition?.();
  stream?.getTracks().forEach(track => track.stop());
  view.video.srcObject = null;
  view.video.hidden = true;
  view.placeholder.hidden = false;
  view.button.textContent = 'Activar cámara';
  view.status.textContent = message;
  if (view.gesture) view.gesture.textContent = practicePrompt(view.isNumber, view.handCount);
  refreshPracticeProgress(view);
}

async function startRecognition(session) {
  const { view } = session;
  if (!view.gesture) return;
  if (location.protocol === 'file:') {
    view.gesture.textContent = 'Abre Conecta LSM mediante HTTPS o localhost para activar el reconocimiento.';
    return;
  }
  view.gesture.textContent = view.isNumber ? 'Cargando reconocimiento de números…' : 'Cargando reconocimiento del abecedario…';
  try {
    const { startHandPractice, startNumberPractice } = await import('./hand-practice.mjs');
    if (cameraSession === session) {
      const options = {
        video: view.video,
        canvas: view.canvas,
        status: view.gesture,
        handCount: view.handCount,
        motionButton: view.attempt,
        onMatch: () => {
          if (cameraSession !== session || matchedToday(session)) return;
          session.matchedAt = new Date();
          refreshPracticeProgress(view);
        },
        onAttempt: () => {
          if (cameraSession !== session) return;
          session.matchedAt = null;
          refreshPracticeProgress(view);
        },
      };
      session.stopRecognition = view.isNumber
        ? startNumberPractice({ ...options, number: view.sign })
        : startHandPractice({ ...options, letter: view.sign });
    }
  } catch {
    if (cameraSession === session) {
      view.gesture.textContent = 'No se pudo cargar el reconocimiento. Recarga la página y vuelve a activar la cámara.';
    }
  }
}

async function toggleCamera() {
  if (cameraSession) {
    stopCamera();
    return;
  }

  const view = cameraView();
  if (!navigator.mediaDevices?.getUserMedia) {
    view.status.textContent = 'Abre Conecta LSM en HTTPS o localhost con un navegador que admita cámara.';
    return;
  }

  const session = { view, stream: null };
  cameraSession = session;
  view.button.textContent = 'Cancelar';
  view.status.textContent = 'Esperando acceso a la cámara…';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    if (cameraSession !== session) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }

    session.stream = stream;
    for (const track of stream.getVideoTracks()) {
      track.addEventListener('ended', () => {
        if (cameraSession === session) stopCamera('La cámara se desconectó. Puedes volver a activarla.');
      }, { once: true });
    }
    view.video.srcObject = stream;
    view.video.muted = true;
    await view.video.play();
    if (cameraSession !== session) return;
    view.video.hidden = false;
    view.placeholder.hidden = true;
    view.button.textContent = 'Detener cámara';
    view.status.textContent = 'Cámara activa.';
    void startRecognition(session);
  } catch (error) {
    if (cameraSession === session) {
      stopCamera(cameraErrors[error.name] ?? 'No se pudo iniciar la cámara. Vuelve a intentar.');
    }
  }
}

function translator() {
  const voiceAvailable = dictation.available();
  const voiceNote = voiceAvailable
    ? 'El audio se procesa en este dispositivo. La primera vez puede tardar en cargar el modelo de español.'
    : (location.protocol === 'file:' || !window.isSecureContext
      ? 'Abre Conecta LSM en HTTPS o localhost para usar el dictado. También puedes escribir la frase.'
      : 'Dictado no disponible en este navegador. Puedes escribir la frase.');
  return `${heading('Abecedario manual', 'Deletreador LSM', 'Escribe palabras o nombres y lee cada letra en SignWriting del abecedario de LSM.')}
  <div class="grid translation"><article><form id="translate">
  <h2><label for="phrase">Texto para deletrear</label></h2><textarea required maxlength="300" id="phrase" placeholder="Por ejemplo: Año"></textarea>
  <div class="actions"><button type="button" class="secondary" id="dictation-toggle" aria-describedby="dictation-note" ${voiceAvailable ? '' : 'disabled'}>
    <span aria-hidden="true">🎙</span><span id="dictation-label">Dictar en español</span></button>
    <button type="submit">Deletrear</button></div>
    <p id="dictation-status" role="status"></p><p id="dictation-note">${voiceNote}</p>
    <details class="translation-examples"><summary>Ejemplos</summary>
      <div class="actions">${spellingExamples.map(example =>
        `<button type="button" class="secondary" data-signwriting-example="${example}">${example}</button>`).join('')}</div>
    </details></form></article>
  <article><h2>Deletreo en SignWriting</h2>
    <p class="feedback" id="translation-status" role="status">Escribe un texto o elige un ejemplo.</p>
    <div id="translation-writing" hidden>
      <ol id="spelling-words" aria-label="Palabras deletreadas"></ol>
      ${signWritingCredit()}
      <div class="actions">${link('abecedario', 'Consultar el abecedario', true)}</div>
    </div>
  </article></div>`;
}

function showSignWriting(phrase) {
  const { words, unsupported } = readSpelling(phrase);
  const status = app.querySelector('#translation-status');
  const writing = app.querySelector('#translation-writing');
  status.textContent = words.length
    ? `Para «${phrase}».${unsupported ? ' Se omitieron los números y otros caracteres fuera del abecedario.' : ''}`
    : 'Escribe al menos una letra del abecedario para deletrear.';
  writing.hidden = words.length === 0;
  writing.querySelector('#spelling-words').innerHTML = words.map(word => `<li><ol class="spelling-word" aria-label="${word.join('')}">
    ${word.map(letter => `<li><img src="${signWritingGlyph(letter)}" width="56" height="56" alt=""><span>${letter}</span></li>`).join('')}
    </ol></li>`).join('');
}

function profile() {
  const progress = letterProgress?.snapshot();
  const numbers = numberProgress?.snapshot();
  return `${heading('Tu perfil', 'Progreso', 'Consulta tus estadísticas de ejemplo y días de práctica.')}
    <article class="quick"><div class="identity"><span class="avatar" aria-hidden="true">A</span><h2>Alex Rivera</h2></div>${stats()}</article>
    <article class="practice-progress"><h2>Dominio del abecedario</h2>
      <p>${alphabetMasterySummary(progress)}. Selecciona una letra para practicar.</p>
      ${alphabetGrid(progress, 'practica')}<p>${practiceStorageMessage(progress)}</p></article>
    <article class="practice-progress"><h2>Dominio de números</h2>
      <p>${numberMasterySummary(numbers)}. Selecciona un número para practicar.</p>
      ${numberGrid(numbers, 'practica')}<p>${practiceStorageMessage(numbers)}</p></article>
    <article class="practice-progress"><h2>Calendario de práctica</h2><p>Semana de ejemplo</p><ol class="calendar">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) =>
      `<li><span>${day}</span><span class="${index < 4 ? 'checked' : ''}" aria-label="${index < 4 ? 'Práctica completada' : 'Sin práctica'}">${index < 4 ? '✓' : '·'}</span></li>`).join('')}</ol>
      <h2>Logros</h2><p>Primer paso · Primera lección completada</p><h2>Actividad reciente</h2><p>Abecedario · Practicaste la letra A</p></article>`;
}

const pages = {
  inicio: dashboard, aprender: learning, abecedario: alphabetIndex, ejercicio: alphabetExercise,
  numeros: numberIndex, 'ejercicio-numeros': numberIndex,
  saludos: () => guidedIndex(2), 'ejercicio-saludos': () => guidedIndex(2), expresiones: () => guidedIndex(3),
  frases: () => guidedIndex(4),
  traductor: translator, progreso: profile,
};
const nav = [['inicio', '⌂', 'Inicio'], ['aprender', '▤', 'Aprender'], ['traductor', '⇄', 'Deletrear'], ['progreso', '◉', 'Progreso']];

function render() {
  const [page, unitParam, stepParam] = location.hash.slice(1).split('/');
  const index = Number(unitParam);
  const step = Number(stepParam);
  const unit = units[index];
  const isLesson = page === 'leccion' || page === 'practica';
  const isLearningDetail = isLesson || ['abecedario', 'ejercicio', 'numeros', 'ejercicio-numeros', 'saludos', 'ejercicio-saludos', 'expresiones', 'frases'].includes(page);
  const active = isLearningDetail ? 'aprender' : page;
  const content = isLesson
    ? (unit?.[2][step] ? (page === 'leccion' ? lesson : practice)(unit, index, step)
      : index === 1 ? numberIndex() : guidedUnits[index] ? guidedIndex(index) : learning())
    : (Object.hasOwn(pages, page) ? pages[page]() : null);
  app.innerHTML = content ? `<aside><a class="brand" href="#bienvenida">${brand}</a>
    <nav aria-label="Navegación principal">${nav.map(([href, icon, label]) => `<a href="#${href}" ${href === active ? `aria-current="${isLearningDetail ? 'true' : 'page'}"` : ''}>
      <span aria-hidden="true">${icon}</span>${label}</a>`).join('')}</nav></aside>
    <main id="contenido" tabindex="-1">${content}</main>` :
    `<main id="contenido" class="landing" tabindex="-1">${welcome()}</main>`;
  document.title = `${app.querySelector('h1').textContent} | Conecta LSM`;
}

app.addEventListener('click', event => {
  const example = event.target.closest('[data-signwriting-example]');
  if (example) {
    example.form.querySelector('#phrase').value = example.dataset.signwritingExample;
    example.form.requestSubmit();
    return;
  }
  const dictationButton = event.target.closest('#dictation-toggle');
  if (dictationButton) {
    dictation.toggle(dictationButton.form);
    return;
  }
  if (event.target.closest('#practice-record')) {
    recordPractice();
    return;
  }
  if (event.target.closest('#camera-toggle')) {
    void toggleCamera();
    return;
  }
  const button = event.target.closest('[data-note]');
  if (button) app.querySelector('.feedback').textContent = button.dataset.note;
});

app.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'alphabet-exercise') {
    const answers = new FormData(event.target);
    const correct = exerciseCards.filter((letter, index) => answers.get(`answer-${index}`) === letter).length;
    const passed = correct === exerciseCards.length;
    alphabetCompleted ||= passed;
    event.target.querySelector('.feedback').textContent = passed
      ? '¡Lección completada! Identificaste las tres configuraciones.'
      : `${correct} de ${exerciseCards.length} respuestas correctas. Revisa tus opciones y vuelve a intentar.`;
    event.target.querySelector('#alphabet-completion').hidden = !passed;
    return;
  }
  if (event.target.id === 'translate') {
    dictation.cancel('Dictado cancelado al deletrear el texto actual.');
    showSignWriting(event.target.querySelector('#phrase').value.trim());
  }
});

function focusContent() {
  const content = app.querySelector('main');
  content.focus({ preventScroll: true });
  content.scrollIntoView({ block: 'start' });
}

document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  focusContent();
});

window.addEventListener('hashchange', () => {
  if (!appReady) return;
  stopCamera();
  dictation.cancel();
  render();
  focusContent();
});
window.addEventListener('pagehide', () => {
  stopCamera();
  dictation.cancel();
});

async function startApp() {
  if (location.protocol !== 'file:') {
    try {
      const { createLetterProgress, createNumberProgress, LETTER_PRACTICE_GOAL } = await import('./letter-progress.mjs');
      letterProgress = createLetterProgress();
      numberProgress = createNumberProgress(numberSigns);
      practiceGoal = LETTER_PRACTICE_GOAL;
    } catch {
      // Lessons and the live preview are still usable if the progress module is unavailable.
    }
  }
  appReady = true;
  render();
}

void startApp();
