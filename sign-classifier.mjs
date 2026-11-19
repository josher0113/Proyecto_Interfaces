const fingerBases = [5, 9, 13, 17];

function vector(point, origin) {
  return [point.x - origin.x, point.y - origin.y, point.z - origin.z];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function length(value) {
  return Math.hypot(...value);
}

function distance(a, b) {
  return length(vector(a, b));
}

function direction(a, b) {
  const offset = vector(a, b);
  const magnitude = length(offset);
  return magnitude > 0 ? offset.map(value => value / magnitude) : offset;
}

function isCompleteHand(points) {
  return Array.isArray(points) && points.length === 21 && Array.from(points).every(point =>
    point && Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z));
}

// Image-space points are used for framing. Distances and angles come from world-space
// points so portrait/landscape aspect ratio, camera mirroring and hand size do not skew them.
export function classifySign(landmarks, worldLandmarks) {
  if (!isCompleteHand(landmarks) || !isCompleteHand(worldLandmarks)) return null;
  if (landmarks.some(({ x, y }) => x < .015 || x > .985 || y < .015 || y > .985)) return null;
  const imagePalm = Math.max(
    Math.hypot(landmarks[0].x - landmarks[9].x, landmarks[0].y - landmarks[9].y),
    Math.hypot(landmarks[5].x - landmarks[17].x, landmarks[5].y - landmarks[17].y),
  );
  if (imagePalm < .045) return null;

  const hand = worldLandmarks;
  const palmLength = distance(hand[0], hand[9]);
  const palmWidth = distance(hand[5], hand[17]);
  if (palmLength < .000001 || palmWidth < .000001) return null;
  const palmScale = (palmLength + palmWidth) / 2;
  const towardFingers = direction(hand[9], hand[0]);
  const towardThumb = direction(hand[5], hand[17]);

  const fingers = fingerBases.map(base => {
    const [knuckle, middle, distal, tip] = hand.slice(base, base + 4);
    const fingerLength = distance(knuckle, middle) + distance(middle, distal) + distance(distal, tip);
    return {
      reach: distance(knuckle, tip) / fingerLength,
      forward: dot(vector(tip, knuckle), towardFingers) / palmScale,
      bend: dot(direction(middle, knuckle), direction(distal, middle)),
    };
  });
  if (fingers.some(({ reach }) => !Number.isFinite(reach))) return null;

  const thumbSide = dot(vector(hand[4], hand[5]), towardThumb) / palmScale;
  const thumbBend = dot(direction(hand[3], hand[2]), direction(hand[4], hand[3]));
  const thumbGap = distance(hand[4], hand[8]) / palmScale;
  const thumbToIndexJoint = distance(hand[4], hand[6]) / palmScale;
  const fingerSpread = distance(hand[8], hand[20]) / palmScale;

  // Early pilot thresholds calibrated against the UABCS references. Leave ambiguous
  // poses unclassified and let the caller require a stable result over several frames.
  if (fingers.every(({ reach, forward }) => reach < .64 && forward < .10)
    && thumbSide > .42 && thumbGap > .66 && thumbBend > .75) {
    return 'A';
  }
  if (fingers.every(({ reach, forward }) => reach > .91 && forward > .43)
    && fingerSpread < 1.00 && thumbSide < -.12 && thumbToIndexJoint < .83) {
    return 'B';
  }
  if (fingers.every(({ reach, forward }) => reach > .72 && forward > .12)
    && fingers.some(({ reach, bend }) => reach < .93 && bend < .87)
    && thumbGap > .66 && thumbGap < 1.27 && thumbBend > .75 && thumbSide > -.33 && fingerSpread < 1.04) {
    return 'C';
  }
  return null;
}
