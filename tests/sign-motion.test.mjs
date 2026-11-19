import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { classifyMotion } from '../sign-motion.mjs';

const { aspectRatio, clips } = JSON.parse(readFileSync(new URL('./fixtures/sign-motion-landmarks.json', import.meta.url)));

function points(values) {
  if (!values) return null;
  return Array.from({ length: values.length / 3 }, (_, index) => {
    const [x, y, z] = values.slice(index * 3, index * 3 + 3);
    return { x, y, z };
  });
}

function framesFor(letter) {
  return clips[letter].map(([timestamp, image, world]) => ({
    timestamp,
    landmarks: points(image),
    worldLandmarks: points(world),
  }));
}

function hold(frame, count, offset = 0) {
  return Array.from({ length: count }, (_, index) => ({ ...frame, timestamp: offset + index * 100 }));
}

test('identifies six movement letters with pauses before and after the movement', () => {
  for (const letter of Object.keys(clips)) {
    const frames = framesFor(letter);
    const first = frames.find(frame => frame.landmarks);
    const last = frames.findLast(frame => frame.landmarks);
    const start = hold(first, 5);
    const movement = frames.map(frame => ({ ...frame, timestamp: frame.timestamp + 500 }));
    const end = hold(last, 5, movement.at(-1).timestamp + 100);
    assert.equal(classifyMotion([...start, ...movement, ...end], aspectRatio), letter);
  }
});

test('rejects a pose held still and a single jump between the first and last poses', () => {
  for (const letter of Object.keys(clips)) {
    const frames = framesFor(letter);
    const first = frames.find(frame => frame.landmarks);
    const last = frames.findLast(frame => frame.landmarks);
    assert.equal(classifyMotion(hold(first, 20), aspectRatio), null, letter);
    assert.equal(classifyMotion([...hold(first, 10), ...hold(last, 10, 1000)], aspectRatio), null, letter);
  }
});

test('rejects incomplete samples and clips split by an interruption', () => {
  const frames = framesFor('Z');
  const halfway = Math.floor(frames.length / 2);
  assert.equal(classifyMotion(frames.slice(0, halfway), aspectRatio), null);
  const withGap = frames.map((frame, index) => ({
    ...frame,
    timestamp: frame.timestamp + (index >= halfway ? 1000 : 0),
  }));
  assert.equal(classifyMotion(withGap, aspectRatio), null);
  assert.equal(classifyMotion([], aspectRatio), null);
});
