import { staticReferences } from './assets/gestos/static-reference-poses.mjs';

const minimumPalmSize = .045;
const maximumMatchDistance = .195;
const minimumDistanceGap = .008;
const minimumDistanceRatio = 1.10;
const orientationWeight = .1;

// Fingertips and thumb joints carry more of the information that separates similar letters.
const jointWeights = [1, 1.5, 1.5, 1.5, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2];
const jointPairs = [];
let totalWeight = 0;
for (let first = 0; first < jointWeights.length; first += 1) {
  for (let second = first + 1; second < jointWeights.length; second += 1) {
    const weight = (jointWeights[first] + jointWeights[second]) / 2;
    jointPairs.push({ first, second, weight });
    totalWeight += weight;
  }
}

function isCompleteHand(points) {
  if (!Array.isArray(points) || points.length !== 21) return false;
  for (const point of points) {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(point.z)) return false;
  }
  return true;
}

function screenDirection(start, end, aspect) {
  const x = (end.x - start.x) * aspect;
  const y = end.y - start.y;
  const length = Math.hypot(x, y);
  return length ? [Math.abs(x) / length, y / length] : [0, 0];
}

function pointDistance(first, second) {
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
}

function describePose(points, palmSize, orientation) {
  const distances = jointPairs.map(({ first, second, weight }) =>
    pointDistance(points[first], points[second]) / palmSize * Math.sqrt(weight / totalWeight));
  return distances.concat(orientation.map(value => value * orientationWeight));
}

const referenceDescriptors = Object.entries(staticReferences).map(([letter, references]) => ({
  letter,
  descriptors: references.map(([points, orientation]) => describePose(points, 1, orientation)),
}));

function squaredDifference(first, second) {
  let squaredDistance = 0;
  for (let index = 0; index < first.length; index += 1) {
    squaredDistance += (first[index] - second[index]) ** 2;
  }
  return squaredDistance;
}

export function classifySign(landmarks, worldLandmarks, aspect = 1) {
  if (!isCompleteHand(landmarks) || !isCompleteHand(worldLandmarks)) return null;
  if (!Number.isFinite(aspect) || aspect <= 0) return null;
  if (landmarks.some(({ x, y }) => x < .015 || x > .985 || y < .015 || y > .985)) return null;

  // Measure the visible palm in units of the shorter side of the frame.
  const widthScale = Math.max(1, aspect);
  const heightScale = Math.max(1, 1 / aspect);
  const imageDistance = (first, second) => Math.hypot(
    (landmarks[first].x - landmarks[second].x) * widthScale,
    (landmarks[first].y - landmarks[second].y) * heightScale,
  );
  if (Math.max(imageDistance(0, 9), imageDistance(5, 17)) < minimumPalmSize) return null;

  const points = worldLandmarks.map(({ x, y, z }) => [x, y, z]);
  const palmLength = pointDistance(points[0], points[9]);
  const palmWidth = pointDistance(points[5], points[17]);
  if (palmLength < .000001 || palmWidth < .000001) return null;

  // Shape distances disregard camera mirroring and hand size. Screen direction adds
  // a small preference for the orientation of the palm and the index finger.
  const orientation = [
    ...screenDirection(landmarks[0], landmarks[9], aspect),
    ...screenDirection(landmarks[5], landmarks[8], aspect),
  ];
  const pose = describePose(points, (palmLength + palmWidth) / 2, orientation);
  let bestLetter = null;
  let bestDistance = Infinity;
  let nextDistance = Infinity;
  for (const { letter, descriptors } of referenceDescriptors) {
    const distance = Math.sqrt(Math.min(...descriptors.map(reference => squaredDifference(pose, reference))));
    if (distance < bestDistance) {
      nextDistance = bestDistance;
      bestDistance = distance;
      bestLetter = letter;
    } else if (distance < nextDistance) {
      nextDistance = distance;
    }
  }
  return bestDistance < maximumMatchDistance
    && nextDistance - bestDistance >= minimumDistanceGap
    && nextDistance >= bestDistance * minimumDistanceRatio
    ? bestLetter
    : null;
}
