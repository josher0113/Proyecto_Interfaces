import assert from 'node:assert/strict';
import test from 'node:test';
import { classifySign } from '../sign-classifier.mjs';
import { staticSamples } from './fixtures/static-gesture-points.mjs';

function asPoints(coordinates) {
  return coordinates.map(([x, y, z]) => ({ x, y, z }));
}

test('recognizes 21 static letters across 63 separate video captures', () => {
  assert.equal(new Set(staticSamples.map(([name]) => name[0])).size, 21);
  assert.equal(staticSamples.length, 63);
  for (const [name, aspect, image, world] of staticSamples) {
    assert.equal(classifySign(asPoints(image), asPoints(world), aspect), name[0], name);
  }
});

test('preserves classification when the physical size, 3D pose axes and mirror side change', () => {
  for (const [name, aspect, image, world] of staticSamples.filter(([name]) => name.endsWith('/base'))) {
    const mirrored = asPoints(image.map(([x, y, z]) => [1 - x, y, z]));
    const transformed = asPoints(world.map(([x, y, z]) => [3 * y + 1, 3 * x - .5, z * 3 + .25]));
    assert.equal(classifySign(mirrored, transformed, aspect), name[0], name);
  }
});

test('returns no letter when the landmark geometry is far from every reference', () => {
  const [, aspect, image, world] = staticSamples.find(([name]) => name === 'B/base');
  const outlier = world.map(([x, y, z], index) => [x, index === 8 ? y - .5 : y, z]);
  assert.equal(classifySign(asPoints(image), asPoints(outlier), aspect), null);
});

test('abstains when a hand is absent, malformed, cropped or too small', () => {
  const [, aspect, image, world] = staticSamples.find(([name]) => name === 'B/base');
  const points = asPoints(image);
  const spatial = asPoints(world);
  assert.equal(classifySign(points), null);
  assert.equal(classifySign([], spatial), null);
  assert.equal(classifySign(points.slice(1), spatial), null);
  assert.equal(classifySign(points, Array(21)), null);
  assert.equal(classifySign(points, spatial.map(point => ({ ...point, z: Infinity }))), null);
  assert.equal(classifySign(points, spatial.map(() => ({ x: 0, y: 0, z: 0 }))), null);
  assert.equal(classifySign(points, spatial, 0), null);

  const small = points.map(({ x, y, z }) => ({ x: .5 + x / 70, y: .5 + y / 70, z }));
  const cropped = points.map((point, index) => index === 8 ? { ...point, x: .01 } : point);
  assert.equal(classifySign(small, spatial, aspect), null);
  assert.equal(classifySign(cropped, spatial, aspect), null);
});
