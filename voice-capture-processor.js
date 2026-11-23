class VoiceCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(4096);
    this.used = 0;
    this.capturing = true;
    this.port.onmessage = ({ data }) => {
      if (data?.type !== 'flush' || !this.capturing) return;
      this.capturing = false;
      if (this.used) this.emitSamples(this.buffer.slice(0, this.used));
      this.port.postMessage({ type: 'flushed' });
    };
  }

  emitSamples(samples) {
    this.port.postMessage({ type: 'samples', samples }, [samples.buffer]);
  }

  process(inputs) {
    if (!this.capturing) return false;
    const channel = inputs[0]?.[0];
    if (!channel) return true;

    // Output channels remain silent while the input samples are sent to the recognizer.
    let offset = 0;
    while (offset < channel.length) {
      const count = Math.min(channel.length - offset, this.buffer.length - this.used);
      this.buffer.set(channel.subarray(offset, offset + count), this.used);
      this.used += count;
      offset += count;
      if (this.used === this.buffer.length) {
        this.emitSamples(this.buffer);
        this.buffer = new Float32Array(4096);
        this.used = 0;
      }
    }
    return true;
  }
}

registerProcessor('linguaplay-voice-capture', VoiceCaptureProcessor);
