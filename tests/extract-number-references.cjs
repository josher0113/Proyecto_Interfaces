const assert = require('node:assert/strict');
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const { runBrowserTest } = require('./browser-harness.cjs');

const root = resolve(__dirname, '..');
const source = readFileSync(resolve(root, 'numbers-reference.js'), 'utf8');
const references = runInNewContext(source + '\nnumberReferences');

async function readPoses(paths) {
  const { FilesetResolver, HandLandmarker } = await import('/vendor/mediapipe/vision_bundle.mjs');
  const files = await FilesetResolver.forVisionTasks('/vendor/mediapipe/wasm');
  const detector = await HandLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: '/vendor/mediapipe/hand_landmarker.task', delegate: 'CPU' },
    runningMode: 'IMAGE',
    numHands: 2,
    minHandDetectionConfidence: 0.4,
    minHandPresenceConfidence: 0.4,
  });
  const compact = hands => hands.map(hand => hand.map(point =>
    [point.x, point.y, point.z].map(value => Number(value.toFixed(5)))));
  const poses = {};
  for (const path of paths) {
    const image = new Image();
    image.src = '/' + path;
    await image.decode();
    const { landmarks, worldLandmarks, handedness } = detector.detect(image);
    poses[path] = [
      image.naturalWidth / image.naturalHeight, compact(landmarks), compact(worldLandmarks),
      handedness.map(hand => hand[0]?.categoryName ?? null),
    ];
  }
  detector.close();
  return poses;
}

function formatReferences(poses) {
  const rows = [];
  for (const [number, sign] of Object.entries(references)) {
    const stages = sign.images.map(path => {
      assert.equal(poses[path][1].length, sign.hands, `${number}: ${path} requiere ${sign.hands} mano(s).`);
      return poses[path];
    });
    assert.equal(stages.length > 1, Boolean(sign.motion), `${number}: la secuencia debe corresponder a la seña.`);
    const sequence = sign.repetitions === 2 && stages.length === 2
      ? [stages[0], stages[1], stages[0], stages[1]]
      : stages;
    rows.push(`  ${number}: [${sequence.map(pose => JSON.stringify(pose)).join(',\n    ')}],`);
  }
  return `// Poses del Glosario de la UdeG (CC BY-NC-SA 4.0). Créditos en assets/numeros/README.md.
// Regeneración: node tests/extract-number-references.cjs
const poses = {
${rows.join('\n')}
};

function unpackHands(hands) {
  return hands.map(hand => hand.map(([x, y, z]) => ({ x, y, z })));
}

export const numberGestureReferences = Object.fromEntries(Object.entries(poses).map(([number, sequence]) => [
  number, { templates: [sequence.map(([aspect, landmarks, worldLandmarks, hands]) => ({
    aspect, landmarks: unpackHands(landmarks), worldLandmarks: unpackHands(worldLandmarks),
    handedness: hands.map(categoryName => [{ categoryName }]),
  }))] },
]));
`;
}

runBrowserTest(async ({ navigate, run, errors }) => {
  await navigate();
  const paths = [...new Set(Object.values(references).flatMap(sign => sign.images))];
  const poses = await run(`(${readPoses})(${JSON.stringify(paths)})`);
  assert.deepEqual(errors, []);
  const missing = Object.entries(references).flatMap(([number, sign]) =>
    sign.images.flatMap(path => poses[path][1].length === sign.hands ? [] : [`${number} ${path}: ${poses[path][1].length}/${sign.hands}`]));
  if (missing.length) throw Error('Poses incompletas:\n' + missing.join('\n'));
  const file = resolve(root, 'number-gesture-references.mjs');
  writeFileSync(file, formatReferences(poses));
  console.log(`Se extrajeron ${paths.length} poses para ${Object.keys(references).length} números.`);
}, ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
