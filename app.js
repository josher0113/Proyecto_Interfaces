const alphabetLetters = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];
const motionLetters = new Set(['J', 'Ñ', 'P', 'Q', 'X', 'Z']);
const units = [
  ['Abecedario', 'Explora el alfabeto manual y su uso para deletrear.', 0, alphabetLetters.map(letter => `Letra ${letter}`)],
  ['Números', 'Familiarízate con los números en situaciones habituales.', 0, ['Número 1', 'Número 2', 'Número 3']],
  ['Saludos básicos', 'Empieza a saludar y despedirte.', 0, ['Hola', 'Buenos días', 'Hasta luego']],
  ['Expresiones cotidianas', 'Amplía tu repertorio de expresiones de uso diario.', 0, ['Gracias', 'Por favor', 'Disculpa']],
  ['Frases y comunicación básica', 'Explora situaciones sencillas de conversación.', 0, ['Presentarse', 'Pedir ayuda', 'Invitar a participar']],
];

const app = document.querySelector('#app');
const dictation = createDictation();
const alphabetSource = 'https://biblio.uabcs.mx/recursosedu/lsm/';
const exerciseDescriptions = {
  A: 'Cuatro dedos flexionados hacia la palma y el pulgar al costado.',
  B: 'Cuatro dedos extendidos y juntos, con el pulgar flexionado.',
  C: 'Dedos curvados, con el pulgar separado y una abertura entre las puntas.',
};
const exerciseCards = ['B', 'C', 'A'];
const vocabularyUnits = {
  frutas: { title: 'Frutas', signs: [
    { id: 'manzana', label: 'Manzana', start: 2.55 },
    { id: 'platano', label: 'Plátano', start: 2.60 },
    { id: 'pera', label: 'Pera', start: 1.90 },
  ] },
  colores: { title: 'Colores', signs: [
    { id: 'rojo', label: 'Rojo', start: .95 },
    { id: 'amarillo', label: 'Amarillo', start: .70 },
    { id: 'verde', label: 'Verde', start: .90 },
  ] },
};
const gesturePrompt = 'Mantén una sola mano dentro del encuadre.';
let alphabetCompleted = false;
let cameraSession = null;
let letterProgress = null;
let vocabularyProgress = null;
let practiceGoal = 3;
let appReady = false;

function letterState(entry) {
  if (entry?.mastered) return 'Aprendida';
  return `${entry?.days ?? 0}/${practiceGoal} días`;
}

function letterStateClass(entry) {
  if (entry?.mastered) return 'letter-mastered';
  return entry?.days ? 'letter-practicing' : '';
}

function alphabetGrid(progress, destination) {
  return `<ul class="alphabet-index">${alphabetLetters.map((letter, step) => {
    const entry = progress?.letters[letter];
    const mediaType = motionLetters.has(letter) ? 'Video' : 'Foto';
    return `<li><a class="alphabet-letter ${letterStateClass(entry)}" href="#${destination}/0/${step}"
      aria-label="Letra ${letter}, ${mediaType}, ${letterState(entry)}">
      <strong>${letter}</strong><span>${mediaType}</span><span class="letter-state">${letterState(entry)}</span></a></li>`;
  }).join('')}</ul>`;
}

function alphabetMasterySummary(progress) {
  return `${progress?.masteredCount ?? 0} de ${alphabetLetters.length} letras aprendidas`;
}

const alphabetPhoto = (letter, description) =>
  `<img class="alphabet-photo" src="assets/abecedario/${letter}.jpg" alt="${description}" width="480" height="640">`;
const alphabetCredit = () => `<p class="media-credit">Material de Yahilyn Rodriguez, Michelle Bocanegra y Kenya Sanchez.
  <a href="${alphabetSource}">Biblioteca Universitaria UABCS</a> ·
  <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Imágenes redimensionadas.</p>`;

function alphabetDemo(letter) {
  const description = exerciseDescriptions[letter];
  const visual = motionLetters.has(letter)
    ? `<video class="alphabet-video" controls playsinline preload="metadata" aria-label="Video de la letra ${letter} en LSM"
        src="assets/abecedario/${letter}.mp4"></video>
      <figcaption><a href="assets/abecedario/${letter}.mp4">Abrir video de la letra ${letter}</a></figcaption>`
    : alphabetPhoto(letter, description ? '' : `Configuración manual de la letra ${letter} en LSM`);
  return `<figure class="alphabet-demo">${visual}
    ${description ? `<figcaption>${description}</figcaption>` : ''}</figure>${alphabetCredit()}`;
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
const brand = 'LinguaPlay <small>LSM</small>';
const media = (label, note) => `<div class="media"><span aria-hidden="true">▣</span><strong>${label}</strong><span>${note}</span></div>`;
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
    </div><article class="quick"><div><h2>Traductor LSM</h2><p>Explora la vista de consulta de expresiones en español.</p></div>
      ${link('traductor', 'Abrir traductor', true)}</article>`;
}

function learning() {
  const progressSummary = alphabetMasterySummary(letterProgress?.snapshot());
  return `${heading('Aprender', 'Ruta de aprendizaje', 'Avanza desde el alfabeto manual hasta situaciones cotidianas.')}
    ${vocabularyCards()}
    <div class="units">${units.map(([title, description, progress], index) => `<article class="unit">
      <span class="unit-number" aria-label="Unidad ${index + 1}">${index + 1}</span>
      <div><p class="eyebrow">${index === 0 ? progressSummary : 'Vista previa disponible'}</p>
      <h2>${title}</h2><p>${description}</p>${index === 0
        ? (alphabetCompleted ? '<p>Ejercicio de A, B y C completado.</p>' : '')
        : meter('Progreso de la unidad', progress)}</div>
      ${index === 0 ? link('abecedario', 'Explorar abecedario') : link(`leccion/${index}/0`, 'Ver unidad', true)}
    </article>`).join('')}</div>`;
}

function vocabularyCards() {
  return `<div class="grid vocabulary-unit">${Object.entries(vocabularyUnits).map(([route, { title }]) =>
    `<article><h2>${title}</h2><div class="actions">${link(route, `Abrir práctica de ${title.toLowerCase()}`)}</div></article>`).join('')}</div>`;
}

function vocabularyGrid(route, progress) {
  return `<ul class="alphabet-index vocabulary-index">${vocabularyUnits[route].signs.map(({ id, label }) => {
    const entry = progress?.entries[id];
    return `<li><a class="${letterStateClass(entry)}" href="#practica-vocabulario/${route}/${id}">
      <strong>${label}</strong><span class="letter-state">${letterState(entry)}</span></a></li>`;
  }).join('')}</ul>`;
}

function vocabularyUnit(route) {
  return `<a class="back" href="#aprender">← Ruta de aprendizaje</a>
    ${heading('Aprender', vocabularyUnits[route].title, 'Elige una seña para ver la muestra y practicar con la cámara.')}
    <article>${vocabularyGrid(route, vocabularyProgress?.snapshot())}</article>`;
}

function vocabularyDemo(sign) {
  const source = 'https://www.wikisigns.org/es/lsm/' + encodeURIComponent(sign.label.toLowerCase());
  return `<figure class="alphabet-demo">
    <video class="alphabet-video" controls playsinline preload="metadata" aria-label="Muestra de ${sign.label} en LSM"
      src="assets/vocabulario/${sign.id}.mp4#t=${sign.start}"></video>
    <figcaption><a href="${source}" target="_blank" rel="noopener">${sign.label} en Wikisigns (nueva pestaña)</a>
      · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></figcaption></figure>`;
}

function vocabularyPractice(route, sign) {
  return practiceScreen({
    back: route,
    backLabel: vocabularyUnits[route].title,
    title: sign.label,
    reference: vocabularyDemo(sign),
    term: sign.id,
    vocabulary: true,
    isMotion: true,
  });
}

function lesson(unit, index, step) {
  const [title, description, , topics] = unit;
  const letter = index === 0 ? alphabetLetters[step] : null;
  return `<a class="back" href="#${letter ? 'abecedario' : 'aprender'}">← ${letter ? 'Abecedario' : 'Ruta de aprendizaje'}</a>
    ${heading(title, topics[step], description)}
    <article>${meter(`Paso ${step + 1} de ${topics.length}`, Math.round((step + 1) / topics.length * 100))}
      ${letter ? alphabetDemo(letter)
        : `${media('Demostración', 'Material en LSM pendiente de incorporar')}<p>Este espacio mostrará una demostración y su explicación.</p>`}
      <div class="actions">${letter === 'C' ? link('ejercicio', 'Ejercicio de A, B y C') : ''}
        ${link(`practica/${index}/${step}`, 'Ir a práctica con cámara', true)}</div>
    </article><div class="between actions">
      ${step > 0 ? link(`leccion/${index}/${step - 1}`, 'Anterior', true) : '<button class="secondary" disabled>Anterior</button>'}
      ${step + 1 < topics.length ? link(`leccion/${index}/${step + 1}`, 'Siguiente')
        : letter ? link('abecedario', 'Volver al abecedario') : link('aprender', 'Volver a la ruta')}
    </div>`;
}

function practice(unit, index, step) {
  const letter = index === 0 ? alphabetLetters[step] : null;
  return practiceScreen({
    back: `leccion/${index}/${step}`,
    backLabel: 'Volver a la lección',
    title: unit[3][step],
    reference: letter ? alphabetDemo(letter) : media('Ejemplo', 'Demostración pendiente'),
    term: letter,
    isMotion: motionLetters.has(letter),
  });
}

function practiceScreen({ back, backLabel, title, reference, term, isMotion, vocabulary = false }) {
  const progress = term && (vocabulary ? vocabularyProgress : letterProgress)?.snapshot();
  const entry = (vocabulary ? progress?.entries : progress?.letters)?.[term];
  const instruction = vocabulary ? 'Observa la muestra y deja visibles las manos durante todo el movimiento.' : 'Coloca la mano dentro del encuadre y busca buena iluminación.';
  return `<a class="back" href="#${back}">← ${backLabel}</a>
    ${heading('Práctica con cámara', title, instruction)}
    <div class="grid"><article><h2>Referencia</h2>${reference}</article>
    <article><h2>Vista de cámara</h2>
      <div class="camera-preview">
        <p id="camera-placeholder">Vista previa apagada</p>
        <video id="camera-video" aria-label="Vista en vivo de la cámara" autoplay muted playsinline hidden></video>
        ${term ? '<canvas id="gesture-overlay" aria-hidden="true" hidden></canvas>' : ''}
      </div>
      <div class="actions"><button type="button" id="camera-toggle">Activar cámara</button>
        ${isMotion ? '<button type="button" id="gesture-attempt" class="secondary" disabled>Evaluar movimiento</button>' : ''}</div>
      <p id="camera-status" role="status">El video se muestra en tu dispositivo, sin grabarse ni enviarse.</p>
      ${term ? `<p id="gesture-status" role="status" data-letter="${term}" ${vocabulary ? 'data-vocabulary' : ''}>${practicePrompt(vocabulary)}</p>` : ''}
    </article></div>
    ${term ? `<article class="practice-progress">
      <div class="practice-progress-heading"><h2>${vocabulary ? 'Progreso de la seña' : `Progreso de la letra ${term}`}</h2>
        <span id="practice-letter-state" class="letter-state ${letterStateClass(entry)}">${letterState(entry)}</span></div>
      <p>${vocabulary ? `La seña pasa a verde tras ${practiceGoal} días consecutivos de práctica correcta.` : `La letra pasa a verde tras ${practiceGoal} prácticas correctas en días distintos.`}</p>
      <div class="actions"><button type="button" id="practice-record" disabled>${practiceRecordLabel(entry, vocabulary)}</button></div>
      <p id="practice-record-status" role="status"></p>
      <p id="practice-storage-status">${practiceStorageMessage(progress)}</p>
    </article>` : ''}`;
}

function practiceRecordLabel(entry, vocabulary) {
  if (entry?.mastered) return vocabulary ? 'Seña aprendida' : 'Letra aprendida';
  return entry?.practicedToday ? 'Práctica de hoy registrada' : 'Registrar práctica';
}

function practicePrompt(vocabulary) {
  if (location.protocol === 'file:') return 'Abre LinguaPlay en HTTPS o localhost para evaluar y registrar la práctica.';
  return vocabulary ? 'Muestra las manos que usa la seña de referencia.' : gesturePrompt;
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
  const progress = (view.vocabulary ? vocabularyProgress : letterProgress)?.snapshot();
  const entry = (view.vocabulary ? progress?.entries : progress?.letters)?.[view.gesture.dataset.letter];
  const canRecord = Boolean(progress && matchedToday(cameraSession) && !entry.mastered && !entry.practicedToday);
  view.recordButton.disabled = !canRecord;
  view.recordButton.textContent = practiceRecordLabel(entry, view.vocabulary);
  view.letterState.textContent = letterState(entry);
  view.letterState.className = `letter-state ${letterStateClass(entry)}`;
  view.storageStatus.textContent = practiceStorageMessage(progress);
  view.recordStatus.textContent = message ?? (canRecord ? 'Acierto confirmado. Puedes registrar la práctica de hoy.' : '');
}

function recordPractice() {
  const date = new Date();
  if (!matchedToday(cameraSession, date)) return;
  const { view } = cameraSession;
  const store = view.vocabulary ? vocabularyProgress : letterProgress;
  if (!store || view.recordButton.disabled) return;
  const entry = store.record(view.gesture.dataset.letter, date);
  const message = entry.credited
    ? (entry.mastered ? 'Práctica registrada. Ya aparece en verde.' : (view.vocabulary ? 'Práctica registrada. Vuelve mañana para continuar la racha.' : 'Práctica registrada. Vuelve otro día para seguir avanzando.'))
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
    vocabulary: Boolean(gesture?.hasAttribute('data-vocabulary')),
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
  if (view.gesture) view.gesture.textContent = practicePrompt(view.vocabulary);
  refreshPracticeProgress(view);
}

async function startRecognition(session) {
  const { view } = session;
  if (!view.gesture) return;
  if (location.protocol === 'file:') {
    view.gesture.textContent = 'Abre LinguaPlay mediante HTTPS o localhost para activar el reconocimiento.';
    return;
  }
  view.gesture.textContent = 'Cargando reconocimiento…';
  try {
    const { startHandPractice } = await import('./hand-practice.mjs');
    if (cameraSession === session) {
      session.stopRecognition = startHandPractice({
        video: view.video,
        canvas: view.canvas,
        status: view.gesture,
        letter: view.gesture.dataset.letter,
        vocabulary: view.vocabulary,
        motionButton: view.attempt,
        onMatch: () => {
          if (matchedToday(session)) return;
          session.matchedAt = new Date();
          refreshPracticeProgress(view);
        },
        onAttempt: () => {
          session.matchedAt = null;
          refreshPracticeProgress(view);
        },
      });
    }
  } catch {
    if (cameraSession === session) {
      view.gesture.textContent = 'No se pudo cargar el reconocimiento. Puedes usar la vista de cámara o volver a intentar.';
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
    view.status.textContent = 'Abre LinguaPlay en HTTPS o localhost con un navegador que admita cámara.';
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
    ? 'El navegador puede enviar audio a su servicio de voz. LinguaPlay recibe el texto.'
    : (location.protocol === 'file:' || !window.isSecureContext
      ? 'Abre LinguaPlay en HTTPS o localhost para usar el dictado. También puedes escribir la frase.'
      : 'Dictado no disponible en este navegador. Puedes escribir la frase.');
  return `${heading('Consulta educativa', 'Traductor LSM', 'Explora cómo se consultarán expresiones validadas en Lengua de Señas Mexicana.')}
  <div class="grid translation"><article><form id="translate">
  <h2><label for="phrase">Escribe en español</label></h2><textarea required maxlength="300" id="phrase" placeholder="Por ejemplo: Buenos días"></textarea>
  <div class="actions"><button type="button" class="secondary" id="dictation-toggle" aria-describedby="dictation-note" ${voiceAvailable ? '' : 'disabled'}>
    <span aria-hidden="true">🎙</span><span id="dictation-label">Dictar en español</span></button>
    <button>Traducir</button></div>
    <p id="dictation-status" role="status"></p><p id="dictation-note">${voiceNote}</p></form></article>
  <article><h2>Resultado en LSM</h2>${media('Vista de demostración', 'Material validado pendiente')}
  <div class="actions"><button class="secondary" disabled>Reproducir</button><button class="secondary" disabled>Pausar</button><button class="secondary" disabled>Repetir</button></div>
  <p class="feedback" role="status">Aquí aparecerá una explicación de la expresión cuando haya material disponible.</p></article></div>`;
}

function profile() {
  const progress = letterProgress?.snapshot();
  const words = vocabularyProgress?.snapshot();
  return `${heading('Tu perfil', 'Progreso', 'Consulta tus estadísticas de ejemplo y días de práctica.')}
    <article class="quick"><div class="identity"><span class="avatar" aria-hidden="true">A</span><h2>Alex Rivera</h2></div>${stats()}</article>
    <article class="practice-progress"><h2>Dominio del abecedario</h2>
      <p>${alphabetMasterySummary(progress)}. Selecciona una letra para practicar.</p>
      ${alphabetGrid(progress, 'practica')}<p>${practiceStorageMessage(progress)}</p></article>
    <div class="grid practice-progress">${Object.entries(vocabularyUnits).map(([route, { title }]) =>
      `<article><h2>${title}</h2>${vocabularyGrid(route, words)}</article>`).join('')}</div>
    <div class="grid practice-progress"><article><h2>Otras unidades</h2>${units.slice(1).map(([title, , percent]) => meter(title, percent)).join('')}</article>
    <article><h2>Calendario de práctica</h2><p>Semana de ejemplo</p><ol class="calendar">${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) =>
      `<li><span>${day}</span><span class="${index < 4 ? 'checked' : ''}" aria-label="${index < 4 ? 'Práctica completada' : 'Sin práctica'}">${index < 4 ? '✓' : '·'}</span></li>`).join('')}</ol>
      <h2>Logros</h2><p>Primer paso · Primera lección completada</p><h2>Actividad reciente</h2><p>Abecedario · Practicaste la letra A</p></article></div>`;
}

const pages = { inicio: dashboard, aprender: learning, abecedario: alphabetIndex, ejercicio: alphabetExercise, 'frutas-y-colores': learning, traductor: translator, progreso: profile };
const nav = [['inicio', '⌂', 'Inicio'], ['aprender', '▤', 'Aprender'], ['traductor', '⇄', 'Traductor'], ['progreso', '◉', 'Progreso']];

function render() {
  const [page, unitParam, stepParam] = location.hash.slice(1).split('/');
  const index = Number(unitParam);
  const step = Number(stepParam);
  const unit = units[index];
  const isLesson = page === 'leccion' || page === 'practica';
  const isVocabularyUnit = Object.hasOwn(vocabularyUnits, page);
  const isVocabularyPractice = page === 'practica-vocabulario';
  const isLearningDetail = isLesson || isVocabularyUnit || isVocabularyPractice || page === 'ejercicio' || page === 'abecedario' || page === 'frutas-y-colores';
  const active = isLearningDetail ? 'aprender' : page;
  let content;
  if (isLesson) content = unit?.[3][step] ? (page === 'leccion' ? lesson : practice)(unit, index, step) : learning();
  else if (isVocabularyUnit) content = vocabularyUnit(page);
  else if (isVocabularyPractice) {
    const group = Object.hasOwn(vocabularyUnits, unitParam) ? vocabularyUnits[unitParam] : null;
    const sign = group?.signs.find(({ id }) => id === stepParam);
    content = sign ? vocabularyPractice(unitParam, sign) : learning();
  } else if (Object.hasOwn(pages, page)) content = pages[page]();
  app.innerHTML = content ? `<aside><a class="brand" href="#bienvenida">${brand}</a>
    <nav aria-label="Navegación principal">${nav.map(([href, icon, label]) => `<a href="#${href}" ${href === active ? `aria-current="${isLearningDetail ? 'true' : 'page'}"` : ''}>
      <span aria-hidden="true">${icon}</span>${label}</a>`).join('')}</nav></aside>
    <main id="contenido" tabindex="-1">${content}</main>` :
    `<main id="contenido" class="landing" tabindex="-1">${welcome()}</main>`;
  document.title = `${app.querySelector('h1').textContent} | LinguaPlay LSM`;
}

app.addEventListener('click', event => {
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
  dictation.cancel('Dictado cancelado al consultar el texto actual.');
  const phrase = event.target.querySelector('textarea').value.trim();
  app.querySelector('.feedback').textContent = phrase
    ? `La consulta «${phrase}» se registró en la vista de demostración. El material en LSM está pendiente.`
    : 'Escribe una palabra o frase para consultar.';
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
      const { createLetterProgress, createVocabularyProgress, LETTER_PRACTICE_GOAL } = await import('./letter-progress.mjs');
      letterProgress = createLetterProgress();
      vocabularyProgress = createVocabularyProgress(Object.values(vocabularyUnits).flatMap(unit => unit.signs.map(sign => sign.id)));
      practiceGoal = LETTER_PRACTICE_GOAL;
    } catch {
      // Lessons and the live preview are still usable if the progress module is unavailable.
    }
  }
  appReady = true;
  render();
}

void startApp();
