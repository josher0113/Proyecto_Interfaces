import assert from 'node:assert/strict';
import test from 'node:test';
import { createNumberClassifier } from '../number-classifier.mjs';

function hand(fingersOpen, { x = .5, y = .57, scale = .13, aspect = 1, mirrored = false } = {}) {
  const wrist = [0, 0, 0];
  const thumb = [[-.21, -.41, 0], [-.51, -.68, 0], [-.74, -.77, -.03], [-.89, -.84, -.06]];
  const joints = [wrist, ...thumb];
  for (const [index, finger] of fingersOpen.entries()) {
    const base = (index - 1.5) * .33;
    const knuckle = .96 - (index === 3 ? .14 : 0);
    joints.push([base, -knuckle, 0]);
    joints.push([base, -knuckle - .32, -.1 * (1 - finger)]);
    joints.push([base, -knuckle - .18 - finger * .37, -.25 * (1 - finger)]);
    joints.push([base, -knuckle + .12 - finger * .89, -.37 * (1 - finger)]);
  }
  const direction = mirrored ? -1 : 1;
  return {
    landmarks: joints.map(([px, py, pz]) => ({ x: x + direction * px * scale / aspect, y: y + py * scale, z: pz * scale })),
    worldLandmarks: joints.map(([px, py, pz]) => ({ x: direction * px * .05, y: py * .05, z: pz * .05 })),
  };
}

function frame(hands, timestamp, handedness) {
  return {
    landmarks: hands.map(value => value.landmarks),
    worldLandmarks: hands.map(value => value.worldLandmarks),
    handedness: handedness?.map(categoryName => [{ categoryName, score: .99 }]),
    timestamp,
  };
}

const one = [1, 0, 0, 0];
const two = [1, 1, 0, 0];
const three = [1, 1, 1, 0];
const all = [1, 1, 1, 1];
const closed = [0, 0, 0, 0];

test('recognizes static hand shapes regardless of camera mirroring, size and aspect', () => {
  const classifier = createNumberClassifier({
    1: { templates: [[frame([hand(one)])]] },
    2: { templates: [[frame([hand(two)])]] },
    3: { templates: [[frame([hand(three)])]] },
  });
  for (const [index, pose] of [one, two, three].entries()) {
    assert.equal(classifier.classifyStatic(frame([hand(pose)])), String(index + 1));
    const options = { x: .42, y: .65, scale: .094, aspect: 4 / 3, mirrored: true };
    assert.equal(classifier.classifyStatic(frame([hand(pose, options)]), options.aspect), String(index + 1));
  }
  assert.equal(classifier.classifyStatic(frame([hand(one, { x: .01 })])), null);
  assert.equal(classifier.classifyStatic(frame([hand(one, { scale: .012 })])), null);
  assert.equal(classifier.classifyStatic(frame([hand(one), hand(two, { x: .75 })])), null);
});

test('abstains when two numbers are indistinguishable', () => {
  const pose = frame([hand(three)]);
  const classifier = createNumberClassifier({
    2: { templates: [[pose]] },
    3: { templates: [[pose]] },
  });
  assert.equal(classifier.classifyStatic(pose), null);
});

const holding = fraction => all.map(value => value * fraction);
const articulate = (poses, timing = 90, aspect = 1, mirrored = false) => poses.map((pose, index) =>
  frame([hand(holding(pose), { aspect, mirrored })], index * timing));

test('checks the order and repetitions of a moving sign and rejects still or abruptly changing poses', () => {
  const template = articulate([1, 0, 1, 0]);
  const classifier = createNumberClassifier({ 9: { templates: [template] } });
  const fullMotion = [1, 1, .8, .58, .3, 0, .25, .5, .75, 1, .75, .5, .25, 0, 0];
  assert.equal(classifier.classifyMotion(articulate(fullMotion)), '9');
  assert.equal(classifier.classifyMotion(articulate(fullMotion, 75, 4 / 3, true), 4 / 3), '9');
  assert.equal(classifier.classifyMotion(articulate([1, .75, .5, .25, 0, .25, .5, .75, 1])), null);
  assert.equal(classifier.classifyMotion(articulate([1, .75, .5, .25, 0, 0, 0, 0])), null);
  assert.equal(classifier.classifyMotion(articulate(Array(15).fill(1))), null);
  assert.equal(classifier.classifyMotion(articulate([1, 1, 1, 1, 1, 0, 0, 0, 0, 0])), null);
  const interrupted = articulate(fullMotion);
  interrupted[7] = frame([], interrupted[7].timestamp);
  assert.equal(classifier.classifyMotion(interrupted), null);
});

test('uses both hands and tolerates a change in MediaPipe result order', () => {
  const sign = (fraction, timestamp, reverse = false) => {
    const hands = [hand(all, { x: .29 }), hand(one, { x: .68 - .29 * fraction, y: .57 - .15 * fraction })];
    const sides = ['Left', 'Right'];
    return frame(reverse ? hands.reverse() : hands, timestamp, reverse ? sides.reverse() : sides);
  };
  const classifier = createNumberClassifier({ 1000: { templates: [[sign(0), sign(1)]] } });
  const motion = Array.from({ length: 11 }, (_, index) => sign(index / 10, index * 80, index % 2 === 0));
  assert.equal(classifier.classifyMotion(motion), '1000');
  assert.equal(classifier.classifyMotion(motion.map(value => ({
    ...value, landmarks: [value.landmarks[0]], worldLandmarks: [value.worldLandmarks[0]],
  }))), null);
});
