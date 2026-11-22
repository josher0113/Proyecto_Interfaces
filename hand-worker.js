let landmarker;

self.addEventListener('message', async ({ data }) => {
  if (data.type === 'init') {
    try {
      const { FilesetResolver, HandLandmarker } = await import('./vendor/mediapipe/vision_bundle.mjs');
      const files = await FilesetResolver.forVisionTasks('./vendor/mediapipe/wasm');
      landmarker = await HandLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: './vendor/mediapipe/hand_landmarker.task', delegate: 'CPU' },
        runningMode: 'VIDEO',
        numHands: data.singleHand ? 1 : 2,
      });
      self.postMessage({ type: 'ready', connections: HandLandmarker.HAND_CONNECTIONS });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    }
    return;
  }

  if (data.type === 'frame') {
    try {
      const { landmarks, worldLandmarks } = landmarker.detectForVideo(data.bitmap, data.timestamp);
      self.postMessage({ type: 'result', landmarks, worldLandmarks });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    } finally {
      data.bitmap.close();
    }
  }
});
