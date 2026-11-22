const palmJoints = [0, 5, 9, 13, 17];
const fingertipJoints = [4, 8, 12, 16, 20];
const fingerBases = [1, 5, 9, 13, 17];
const motionSamples = 12;
const minimumFrames = 6;
const maximumFrameGap = 360;
const minimumMotionDuration = 280;
const maximumMotionDuration = 3800;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function difference(a, b) {
  return [a.x - b.x, a.y - b.y, a.z - b.z];
}

function unitVector(vector) {
  const length = Math.hypot(...vector);
  return length > 1e-6 ? vector.map(value => value / length) : null;
}

function cross([ax, ay, az], [bx, by, bz]) {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}

function validPoints(points) {
  return Array.isArray(points) && points.length === 21 && [...points].every(point =>
    Number.isFinite(point?.x) && Number.isFinite(point.y) && Number.isFinite(point.z));
}

function describeHand(image, world, aspect, handedness, mirrored) {
  if (!validPoints(image) || !validPoints(world)) return null;
  if (image.some(({ x, y }) => x < .01 || x > .99 || y < .01 || y > .99)) return null;
  const imageDistance = (first, second) => Math.hypot(
    (image[first].x - image[second].x) * aspect,
    image[first].y - image[second].y,
  );
  const screenScale = (imageDistance(0, 9) + imageDistance(5, 17)) / 2;
  const worldScale = (distance(world[0], world[9]) + distance(world[5], world[17])) / 2;
  if (screenScale < .027 * Math.min(aspect, 1) || worldScale < 1e-6) return null;

  const shape = fingerBases.map(base => {
    const [root, middle, distal, tip] = world.slice(base, base + 4);
    const length = distance(root, middle) + distance(middle, distal) + distance(distal, tip);
    return length > 1e-6 ? distance(root, tip) / length : 0;
  });
  // The thumb-to-finger and tip-to-wrist distances distinguish similarly open poses.
  for (const tip of fingertipJoints.slice(1)) shape.push(distance(world[4], world[tip]) / worldScale);
  for (const tip of fingertipJoints) shape.push(distance(world[0], world[tip]) / worldScale);
  for (let index = 2; index < fingertipJoints.length; index++) {
    shape.push(distance(world[fingertipJoints[index - 1]], world[fingertipJoints[index]]) / worldScale);
  }

  const axis = unitVector(difference(world[9], world[0]));
  const normal = unitVector(cross(difference(world[5], world[0]), difference(world[17], world[0])));
  if (!axis || !normal) return null;
  // A reflection negates the x component of the palm axis and the y/z components
  // of its normal, which is a cross product.
  if (mirrored) {
    axis[0] *= -1;
    normal[1] *= -1;
    normal[2] *= -1;
  }
  const side = handedness === 'Left' ? -1 : handedness === 'Right' ? 1 : 0;
  const center = [0, 0];
  for (const index of palmJoints) {
    center[0] += (mirrored ? 1 - image[index].x : image[index].x) * aspect / palmJoints.length;
    center[1] += image[index].y / palmJoints.length;
  }
  return { shape, direction: [...axis, ...normal], center, screenScale, side: mirrored ? -side : side };
}

function describeFrame(frame, aspect, mirrored = false) {
  const { landmarks, worldLandmarks, handedness, timestamp } = frame ?? {};
  if (!Array.isArray(landmarks) || !Array.isArray(worldLandmarks)
      || landmarks.length !== worldLandmarks.length || landmarks.length < 1 || landmarks.length > 2
      || !Number.isFinite(aspect) || aspect <= 0) return null;
  const hands = landmarks.map((points, index) =>
    describeHand(points, worldLandmarks[index], aspect, handedness?.[index]?.[0]?.categoryName, mirrored));
  if (hands.some(hand => !hand)) return null;
  if (hands.length === 2) {
    const [first, second] = hands;
    const distinctSides = first.side && second.side && first.side !== second.side;
    hands.sort(distinctSides ? ((a, b) => a.side - b.side) : ((a, b) => a.center[0] - b.center[0]));
  }
  return { timestamp, hands };
}

function rms(a, b) {
  let total = 0;
  for (let index = 0; index < a.length; index++) total += (a[index] - b[index]) ** 2;
  return Math.sqrt(total / a.length);
}

function distanceForFrame(first, second, calculateDistance) {
  if (first.hands.length !== second.hands.length) return Infinity;
  let total = 0;
  for (let index = 0; index < first.hands.length; index++) {
    total += calculateDistance(first.hands[index], second.hands[index]);
  }
  return total / first.hands.length;
}

function poseDistance(first, second) {
  return distanceForFrame(first, second, (a, b) =>
    rms(a.shape, b.shape) + .31 * rms(a.direction, b.direction));
}

function motionStep(first, second) {
  return distanceForFrame(first, second, (a, b) => {
    const shift = rms(a.center, b.center) / ((a.screenScale + b.screenScale) / 2);
    const depth = Math.abs(Math.log(b.screenScale / a.screenScale));
    return .82 * rms(a.shape, b.shape) + .44 * rms(a.direction, b.direction) + .5 * shift + .23 * depth;
  });
}

function trajectoryLength(frames) {
  const length = [0];
  for (let index = 1; index < frames.length; index++) {
    length.push(length[index - 1] + motionStep(frames[index - 1], frames[index]));
  }
  return length;
}

function interpolate(a, b, amount) {
  return a.map((value, index) => value + (b[index] - value) * amount);
}

function describeTrajectory(frames, length, start, end) {
  const travel = length[end] - length[start];
  const hands = frames[start].hands;
  const origin = [0, 0];
  for (const hand of hands) {
    origin[0] += hand.center[0] / hands.length;
    origin[1] += hand.center[1] / hands.length;
  }
  const scale = Math.max(...hands.map(hand => hand.screenScale));
  let upper = start + 1;
  const steps = [];
  for (let index = 0; index < motionSamples; index++) {
    const at = length[start] + index * travel / (motionSamples - 1);
    while (upper < end && length[upper] < at) upper++;
    const distance = length[upper] - length[upper - 1];
    const part = distance > 1e-6 ? (at - length[upper - 1]) / distance : 0;
    steps.push(frames[upper - 1].hands.map((a, handIndex) => {
      const b = frames[upper].hands[handIndex];
      const center = interpolate(a.center, b.center, part);
      const apparentSize = a.screenScale + (b.screenScale - a.screenScale) * part;
      return {
        shape: interpolate(a.shape, b.shape, part),
        direction: interpolate(a.direction, b.direction, part),
        center: center.map((value, axis) => (value - origin[axis]) / scale),
        depth: Math.log(apparentSize / hands[handIndex].screenScale),
      };
    }));
  }
  return { travel, steps };
}

function motionDistance(query, template) {
  let total = 0;
  for (let step = 0; step < motionSamples; step++) {
    const hands = query.steps[step];
    for (let index = 0; index < hands.length; index++) {
      const a = hands[index];
      const b = template.steps[step][index];
      total += rms(a.shape, b.shape) + .31 * rms(a.direction, b.direction)
        + .26 * rms(a.center, b.center) + .13 * Math.abs(a.depth - b.depth);
    }
  }
  return total / (motionSamples * query.steps[0].length);
}

function isOpenHandRotation(frames) {
  if (frames.length !== 2 || frames[0].hands.length !== 1) return false;
  const [first, last] = frames.map(frame => frame.hands[0]);
  return first.shape.slice(1, 5).every(value => value >= .84)
    && last.shape.slice(1, 5).every(value => value >= .84)
    && rms(first.direction, last.direction) >= .52;
}

function rotationDistance(query, reference, firstLoss, lastLoss) {
  const first = reference.steps[0][0].direction;
  const last = reference.steps.at(-1)[0].direction;
  const displacement = last.map((value, index) => value - first[index]);
  const squaredDisplacement = displacement.reduce((sum, value) => sum + value ** 2, 0);
  let previousPhase = 0;
  let backwardTravel = 0;
  let relaxedSamples = 0;
  let pathLoss = 0;
  for (let step = 0; step < motionSamples; step++) {
    const hand = query.steps[step][0];
    const phase = hand.direction.reduce((sum, value, index) =>
      sum + (value - first[index]) * displacement[index], 0) / squaredDisplacement;
    backwardTravel += Math.max(0, previousPhase - phase);
    previousPhase = phase;
    if (hand.shape.slice(1, 5).every(value => value >= .74)) relaxedSamples++;
    pathLoss += rms(hand.center, reference.steps[step][0].center);
  }
  // A palm turning through a real arc has no unique interpolated middle pose.
  // Verify the observed endpoint poses, open fingers and direction of rotation.
  if (backwardTravel > .40 || previousPhase < .66 || relaxedSamples < 8) return Infinity;
  return (firstLoss + lastLoss) / 2 + .19 * pathLoss / motionSamples;
}

function phaseInMotion(sample, open, closed) {
  let projection = 0;
  let extent = 0;
  for (let hand = 0; hand < open.length; hand++) {
    for (const [field, weight] of [['shape', 1], ['direction', .31], ['center', .26]]) {
      const first = open[hand][field];
      const last = closed[hand][field];
      for (let dimension = 0; dimension < first.length; dimension++) {
        const a = first[dimension];
        const delta = last[dimension] - a;
        projection += delta * (sample[hand][field][dimension] - a) * weight / first.length;
        extent += delta ** 2 * weight / first.length;
      }
    }
  }
  return extent > 1e-6 ? projection / extent : 0;
}

function reachesRepeatedPoses(query, reference, pattern) {
  const open = reference.steps[0];
  const closed = reference.steps[Math.round((motionSamples - 1) / (pattern.length - 1))];
  let next = 0;
  for (const sample of query.steps) {
    const phase = phaseInMotion(sample, open, closed);
    if (pattern[next] === 0 ? phase <= .42 : phase >= .63) next++;
    if (next === pattern.length) return true;
  }
  return false;
}

function followsPoseOrder(query, reference) {
  const first = reference.steps[0];
  const last = reference.steps.at(-1);
  const start = phaseInMotion(query.steps[0], first, last);
  const end = phaseInMotion(query.steps.at(-1), first, last);
  return start <= .46 && end >= .53 && end - start >= .35;
}

function repeatsTwoPoses(frames, length) {
  if (frames.length < 4 || length[1] < .07) return null;
  const pattern = frames.map((frame, index) => index % 2);
  return frames.every((frame, index) => motionStep(frame, frames[pattern[index]]) < .015) ? pattern : null;
}

function cameraSegments(frames, aspect) {
  const segments = [];
  let current = [];
  let previous;
  for (const frame of frames) {
    const sample = Number.isFinite(frame?.timestamp) ? describeFrame(frame, aspect) : null;
    const elapsed = sample?.timestamp - previous?.timestamp;
    if (previous && (!sample || elapsed <= 0 || elapsed > maximumFrameGap
        || sample.hands.length !== previous.hands.length)) {
      if (current.length >= minimumFrames) segments.push(current);
      current = [];
    }
    if (sample) {
      current.push(sample);
      previous = sample;
    } else {
      previous = null;
    }
  }
  if (current.length >= minimumFrames) segments.push(current);
  return segments;
}

function nearest(scores, maximum, margin) {
  const [[number, best] = [], [, next] = []] = [...scores].sort((first, second) => first[1] - second[1]);
  if (best === undefined || best > maximum || (next !== undefined && next - best < margin)) return null;
  return number;
}

// Frames from the reference may be mirrored so both signing hands are accepted.
// Motion templates are ordered keyframes, with repeated poses when the sign
// calls for a repeated motion.
export function createNumberClassifier(references) {
  const staticTemplates = [];
  const motionTemplates = [];
  for (const [number, { aspect = 1, templates }] of Object.entries(references)) {
    for (const template of templates) {
      for (const mirrored of [false, true]) {
        const frames = template.map(frame => describeFrame(frame, frame.aspect ?? aspect, mirrored));
        if (!frames.length || frames.some(frame => !frame || frame.hands.length !== frames[0].hands.length)) continue;
        if (frames.length === 1) {
          staticTemplates.push({ number, pose: frames[0] });
        } else {
          const length = trajectoryLength(frames);
          if (length.at(-1) >= .13) {
            motionTemplates.push({
              number, start: frames[0], end: frames.at(-1),
              motion: describeTrajectory(frames, length, 0, frames.length - 1),
              repeats: repeatsTwoPoses(frames, length),
              openHandRotation: isOpenHandRotation(frames),
            });
          }
        }
      }
    }
  }

  function classifyStatic(frame, aspect = 1) {
    const query = describeFrame(frame, aspect);
    if (!query) return null;
    const scores = new Map();
    for (const { number, pose } of staticTemplates) {
      const score = poseDistance(query, pose);
      if (score < (scores.get(number) ?? Infinity)) scores.set(number, score);
    }
    return nearest(scores, .24, .038);
  }

  function classifyMotion(frames, aspect = 1) {
    if (!Array.isArray(frames)) return null;
    const scores = new Map();
    for (const segment of cameraSegments(frames, aspect)) {
      const length = trajectoryLength(segment);
      for (let start = 0; start <= segment.length - minimumFrames; start++) {
        let largestStep = 0;
        for (let end = start + 1; end < segment.length; end++) {
          const duration = segment[end].timestamp - segment[start].timestamp;
          if (duration > maximumMotionDuration) break;
          largestStep = Math.max(largestStep, length[end] - length[end - 1]);
          const travel = length[end] - length[start];
          // A still pose and a jump between two poses are both insufficient.
          if (end - start + 1 < minimumFrames || duration < minimumMotionDuration
              || travel < .16 || largestStep > .64 * travel) continue;
          let query;
          for (const template of motionTemplates) {
            const { number, motion } = template;
            const ratio = travel / motion.travel;
            if (ratio < .56 || ratio > 2.2) continue;
            const startLoss = poseDistance(segment[start], template.start);
            const endLoss = poseDistance(segment[end], template.end);
            if (startLoss > .40 || endLoss > .40) continue;
            query ??= describeTrajectory(segment, length, start, end);
            if (template.repeats && !reachesRepeatedPoses(query, motion, template.repeats)) continue;
            if (!template.repeats && !followsPoseOrder(query, motion)) continue;
            const distance = template.openHandRotation
              ? rotationDistance(query, motion, startLoss, endLoss)
              : motionDistance(query, motion);
            const score = distance + .13 * Math.abs(Math.log(ratio));
            if (score < (scores.get(number) ?? Infinity)) scores.set(number, score);
          }
        }
      }
    }
    return nearest(scores, .31, .036);
  }

  return { classifyStatic, classifyMotion };
}
