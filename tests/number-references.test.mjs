import assert from 'node:assert/strict';
import test from 'node:test';
import { createNumberClassifier } from '../number-classifier.mjs';
import { numberGestureReferences as references } from '../number-gesture-references.mjs';

const expectedNumbers = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  20, 30, 40, 50, 60, 70, 80, 90, 100,
  200, 300, 400, 500, 600, 700, 800, 900, 1000,
].map(String);

function alignHands(frame) {
  const order = frame.handedness.map((_, index) => index).sort((a, b) =>
    frame.handedness[a][0].categoryName.localeCompare(frame.handedness[b][0].categoryName));
  return {
    ...frame,
    landmarks: order.map(index => frame.landmarks[index]),
    worldLandmarks: order.map(index => frame.worldLandmarks[index]),
    handedness: order.map(index => frame.handedness[index]),
  };
}

function interpolateHands(from, to, progress) {
  return from.map((hand, handIndex) => hand.map((first, jointIndex) => {
    const last = to[handIndex][jointIndex];
    return {
      x: first.x + (last.x - first.x) * progress,
      y: first.y + (last.y - first.y) * progress,
      z: first.z + (last.z - first.z) * progress,
    };
  }));
}

function simulatedFrames(keyframes) {
  const ordered = keyframes.map(alignHands);
  const capture = [];
  for (let stage = 1; stage < ordered.length; stage++) {
    const from = ordered[stage - 1];
    const to = ordered[stage];
    for (let frame = 0; frame < 8; frame++) {
      capture.push({
        landmarks: interpolateHands(from.landmarks, to.landmarks, frame / 8),
        worldLandmarks: interpolateHands(from.worldLandmarks, to.worldLandmarks, frame / 8),
        handedness: from.handedness,
        timestamp: capture.length * 85,
      });
    }
  }
  capture.push({ ...ordered.at(-1), timestamp: capture.length * 85 });
  return capture;
}

const classifier = createNumberClassifier(references);

test('covers all 28 numbers with the reference poses and simulated transitions', () => {
  assert.deepEqual(Object.keys(references), expectedNumbers);
  for (const number of expectedNumbers) {
    const [keyframes] = references[number].templates;
    const aspect = keyframes[0].aspect;
    const result = keyframes.length === 1
      ? classifier.classifyStatic(keyframes[0], aspect)
      : classifier.classifyMotion(simulatedFrames(keyframes), aspect);
    assert.equal(result, number, `Clasificación de ${number}`);
  }
});

test('rejects reversing the source poses or omitting a required repetition', () => {
  for (const number of expectedNumbers) {
    const [keyframes] = references[number].templates;
    if (keyframes.length < 2) continue;
    const sequence = keyframes.length > 2 ? keyframes.slice(0, 2) : keyframes.toReversed();
    assert.equal(classifier.classifyMotion(simulatedFrames(sequence), keyframes[0].aspect), null, `Secuencia inválida para ${number}`);
  }
});
