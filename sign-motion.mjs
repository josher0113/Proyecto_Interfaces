import { motionReferences } from './sign-motion-references.mjs';

const palmJoints = [0, 5, 9, 13, 17];
const fingerTips = [4, 8, 12, 16, 20];
const sampleCount = 12;
const minimumFrames = 5;
const maximumGap = 350;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function validHand(points) {
  return points?.length === 21 && Array.from(points).every(point =>
    point && Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z));
}

function frameFeatures(frame, aspectRatio) {
  const { landmarks: image, worldLandmarks: world, timestamp } = frame ?? {};
  if (!Number.isFinite(timestamp) || !validHand(image) || !validHand(world)) return null;
  if (image.some(({ x, y }) => x < .015 || x > .985 || y < .015 || y > .985)) return null;
  const center = palmJoints.reduce(([x, y], index) => [
    x + image[index].x * aspectRatio / palmJoints.length,
    y + image[index].y / palmJoints.length,
  ], [0, 0]);
  const scale = (
    Math.hypot((image[9].x - image[0].x) * aspectRatio, image[9].y - image[0].y) +
    Math.hypot((image[5].x - image[17].x) * aspectRatio, image[5].y - image[17].y)
  ) / 2;
  const palmLength = distance(world[0], world[9]);
  const palmScale = (palmLength + distance(world[5], world[17])) / 2;
  if (scale < .04 || palmScale < 1e-5 || palmLength < 1e-5) return null;

  // The palm and selected fingertips retain trajectories in the image plane.
  const path = [...center];
  for (const tip of fingerTips) path.push(image[tip].x * aspectRatio, image[tip].y);
  // Hand shape is measured relative to the palm, before movement scoring.
  const shape = [5, 9, 13, 17].map(base => {
    const [root, middle, distal, tip] = world.slice(base, base + 4);
    const chain = distance(root, middle) + distance(middle, distal) + distance(distal, tip);
    return chain > 0 ? distance(root, tip) / chain : 0;
  });
  for (const tip of fingerTips.slice(1)) shape.push(distance(world[4], world[tip]) / palmScale);
  shape.push(distance(world[8], world[20]) / palmScale);
  const direction = ['x', 'y', 'z'].map(axis => (world[9][axis] - world[0][axis]) / palmLength);
  return { timestamp, scale, path, shape, direction };
}

function interpolate(a, b, amount) {
  return a.map((value, index) => value + (b[index] - value) * amount);
}

// Convert elapsed time and camera scale to comparable, evenly sampled descriptors.
function describeMotion(frames) {
  const first = frames[0];
  const duration = frames.at(-1).timestamp - first.timestamp;
  const scale = frames.reduce((sum, frame) => sum + frame.scale, 0) / frames.length;
  let right = 1;
  const path = [];
  const shape = [];
  const direction = [];
  for (let i = 0; i < sampleCount; i++) {
    const time = first.timestamp + i * duration / (sampleCount - 1);
    while (right < frames.length - 1 && frames[right].timestamp < time) right++;
    const a = frames[right - 1];
    const b = frames[right];
    const portion = (time - a.timestamp) / (b.timestamp - a.timestamp);
    path.push(interpolate(a.path, b.path, portion).map((value, index) => (value - first.path[index]) / scale));
    shape.push(interpolate(a.shape, b.shape, portion));
    direction.push(interpolate(a.direction, b.direction, portion));
  }
  return { duration, path, shape, direction };
}

function segments(frames, aspectRatio) {
  const result = [];
  let track = [];
  for (const frame of frames) {
    const sample = frameFeatures(frame, aspectRatio);
    if (frame?.handCount > 1 || (sample && track.length && (
      sample.timestamp <= track.at(-1).timestamp || sample.timestamp - track.at(-1).timestamp > maximumGap
    ))) {
      if (track.length >= minimumFrames) result.push(track);
      track = [];
    }
    if (sample && !(frame?.handCount > 1)) track.push(sample);
  }
  if (track.length >= minimumFrames) result.push(track);
  return result;
}

const poseRms = (a, b) => Math.sqrt(a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0) / a.length);
const pathRms = path => Math.sqrt(path.reduce((sum, step) => sum + step.reduce((row, value) => row + value * value, 0), 0) / (sampleCount * path[0].length));

function score(query, reference) {
  const expected = pathRms(reference.path);
  const displacement = pathRms(query.path);
  if (displacement < .12 || displacement < expected * .35 || displacement > expected * 2.6) return Infinity;
  const pathScale = Math.max(expected, .35);
  let loss = 0;
  for (let i = 0; i < sampleCount; i++) {
    loss += poseRms(query.shape[i], reference.shape[i]) +
      .35 * poseRms(query.direction[i], reference.direction[i]) +
      .42 * poseRms(query.path[i], reference.path[i]) / pathScale;
  }
  return loss / sampleCount;
}

export function classifyMotion(frames, aspectRatio = 4 / 3) {
  if (!Array.isArray(frames) || !(aspectRatio > 0 && Number.isFinite(aspectRatio))) return null;
  const best = new Map();
  for (const track of segments(frames, aspectRatio)) {
    for (let start = 0; start <= track.length - minimumFrames; start++) {
      let totalMovement = 0;
      let largestStep = 0;
      for (let last = start + 1; last < track.length; last++) {
        const duration = track[last].timestamp - track[start].timestamp;
        if (duration > 3200) break;
        const movement = poseRms(track[last].path, track[last - 1].path);
        totalMovement += movement;
        largestStep = Math.max(largestStep, movement);
        // A single abrupt change between two held poses is not a trajectory.
        if (last - start + 1 < minimumFrames || duration < 320 || largestStep > totalMovement * .68) continue;
        const query = describeMotion(track.slice(start, last + 1));
        for (const [letter, references] of Object.entries(motionReferences)) {
          for (const reference of references) {
            if (duration < reference.duration * .45 || duration > reference.duration * 1.9) continue;
            const loss = score(query, reference);
            if (loss < (best.get(letter) ?? Infinity)) best.set(letter, loss);
          }
        }
      }
    }
  }
  const [first, second] = [...best].sort((a, b) => a[1] - b[1]);
  if (!first || first[1] > .39 || (second && second[1] - first[1] < .075)) return null;
  return first[0];
}
