const joints = [0, 4, 5, 8, 9, 12, 13, 16, 17, 20];
const pathJoints = [0, 4, 8, 12, 20];
const samples = 12;
const minFrames = 5;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

function describeHand(image, world, aspectRatio) {
  if (image?.length !== 21 || world?.length !== 21) return null;
  if (image.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < .01 || p.x > .99 || p.y < .01 || p.y > .99)) return null;
  const screenDistance = (a, b) => Math.hypot((a.x - b.x) * aspectRatio, a.y - b.y);
  const size = (screenDistance(image[0], image[9]) + screenDistance(image[5], image[17])) / 2;
  const palm = (distance(world[0], world[9]) + distance(world[5], world[17])) / 2;
  if (!(size > .024 && palm > 0)) return null;
  const shape = joints.flatMap((first, index) =>
    joints.slice(index + 1).map(second => distance(world[first], world[second]) / palm));
  if (shape.some(value => !Number.isFinite(value))) return null;
  return {
    size,
    path: pathJoints.flatMap(index => [image[index].x * aspectRatio, image[index].y]),
    shape,
  };
}

function tracksFor(frames, aspectRatio, handCount, mirrored) {
  // Hands can overlap briefly during two-handed signs.
  const maxGap = handCount === 2 ? 680 : 420;
  const tracks = [];
  let track = [];
  for (const frame of frames) {
    if (!frame.landmarks?.length || !Number.isFinite(frame.timestamp)) continue;
    const hands = frame.landmarks.map((points, index) => describeHand(points, frame.worldLandmarks?.[index], aspectRatio)).filter(Boolean);
    if (handCount === 1 && hands.length === 2) {
      const [largest, other] = hands.sort((a, b) => b.size - a.size);
      if (largest.size < other.size * 1.4) continue;
      hands.length = 1;
    }
    if (hands.length !== handCount) continue;
    if (mirrored) {
      for (const hand of hands) hand.path = hand.path.map((value, index) => index % 2 === 0 ? -value : value);
    }
    hands.sort((a, b) => a.path[0] - b.path[0]);
    if (track.length && (frame.timestamp <= track.at(-1).time || frame.timestamp - track.at(-1).time > maxGap)) {
      if (track.length >= minFrames) tracks.push(track);
      track = [];
    }
    track.push({ time: frame.timestamp, hands });
  }
  if (track.length >= minFrames) tracks.push(track);
  return tracks;
}

function describeSequence(track) {
  const duration = track.at(-1).time - track[0].time;
  const scale = track.reduce((sum, frame) => sum + Math.max(...frame.hands.map(hand => hand.size)), 0) / track.length;
  const origin = track[0].hands[0].path;
  const path = [];
  const shape = [];
  let index = 1;
  for (let sample = 0; sample < samples; sample++) {
    const time = track[0].time + duration * sample / (samples - 1);
    while (index < track.length - 1 && track[index].time < time) index++;
    const before = track[index - 1];
    const after = track[index];
    const ratio = (time - before.time) / (after.time - before.time);
    const interpolate = (first, second) => first.map((value, i) => value + ratio * (second[i] - value));
    path.push(before.hands.flatMap((hand, handIndex) => interpolate(hand.path, after.hands[handIndex].path)
      .map((value, i) => (value - origin[i % 2]) / scale)));
    shape.push(before.hands.flatMap((hand, handIndex) => interpolate(hand.shape, after.hands[handIndex].shape)));
  }
  return { duration, path, shape };
}

const rms = (a, b) => Math.sqrt(a.reduce((sum, value, i) => sum + (value - b[i]) ** 2, 0) / a.length);
const movement = path => Math.max(...path.map(row => rms(row, path[0])));

export function describeVocabularyReference(frames, aspectRatio, handCount) {
  const [track] = tracksFor(frames, aspectRatio, handCount, false).sort((a, b) => b.length - a.length);
  return track ? { handCount, ...describeSequence(track) } : null;
}

function score(candidate, reference) {
  const travel = movement(candidate.path);
  const expected = movement(reference.path);
  if (travel < Math.max(.18, expected * .4) || travel > expected * 2.4) return Infinity;
  let total = 0;
  for (let i = 0; i < samples; i++) {
    total += rms(candidate.shape[i], reference.shape[i]) + .64 * rms(candidate.path[i], reference.path[i]);
  }
  return total / samples;
}

export function classifyVocabularyMotion(frames, aspectRatio, references) {
  if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) return null;
  const best = new Map();
  for (const handCount of [1, 2]) {
    const candidates = Object.entries(references).filter(([, ref]) => ref.handCount === handCount);
    for (const mirrored of [false, true]) {
      for (const track of tracksFor(frames, aspectRatio, handCount, mirrored)) {
        for (let start = 0; start <= track.length - minFrames; start++) {
          for (let end = start + minFrames - 1; end < track.length; end++) {
            const duration = track[end].time - track[start].time;
            if (duration < 320) continue;
            if (duration > 3300) break;
            const matchingDurations = candidates.filter(([, ref]) => duration >= ref.duration * .65 && duration <= ref.duration * 1.65);
            if (!matchingDurations.length) continue;
            const sample = describeSequence(track.slice(start, end + 1));
            for (const [id, reference] of matchingDurations) {
              const error = score(sample, reference);
              if (error < (best.get(id) ?? Infinity)) best.set(id, error);
            }
          }
        }
      }
    }
  }
  const [first, second] = [...best].sort((a, b) => a[1] - b[1]);
  if (!first || first[1] > .68 || (second && second[1] - first[1] < .075)) return null;
  return first[0];
}
