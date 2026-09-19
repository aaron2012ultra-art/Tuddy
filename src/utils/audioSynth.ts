// Web Audio API ambient sounds & sound effects synthesizer
// No external MP3 files needed; runs 100% locally and safely in the browser.

class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private ambientSourceNodes: AudioNode[] = [];
  private ambientGainNode: GainNode | null = null;
  private currentAmbientType: string | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play short click/tick sound for wheels or counters
  playTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before first click
    }
  }

  // Play celebration / success sound
  playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
      });
    } catch {}
  }

  // Play Zen meditation bowl chime
  playZenChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const fundamental = 392; // G4
      [fundamental, fundamental * 2.02, fundamental * 3.01].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const initialVol = 0.2 / (i + 1);
        gain.gain.setValueAtTime(initialVol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.6);
      });
    } catch {}
  }

  // Ambient sound generator (Rain, Ocean, Zen, Cafe)
  startAmbient(type: "rain" | "waves" | "zen" | "library", volume = 0.5) {
    this.stopAmbient();
    const ctx = this.getContext();
    if (!ctx) return;

    this.currentAmbientType = type;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.min(1, Math.max(0, volume)), ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.ambientGainNode = masterGain;

    if (type === "rain" || type === "library") {
      // Noise buffer generator
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink / Brown noise filter
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * (type === "rain" ? 3.5 : 1.2);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(type === "rain" ? 800 : 350, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();

      this.ambientSourceNodes.push(noise, filter);
    } else if (type === "waves") {
      // Ocean wave surge using modulated noise
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.8;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      // LFO for wave modulation
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave cycles
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(250, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(masterGain);

      lfo.start();
      noise.start();
      this.ambientSourceNodes.push(noise, filter, lfo, lfoGain);
    } else if (type === "zen") {
      // Gentle meditation hum
      const droneOsc1 = ctx.createOscillator();
      const droneOsc2 = ctx.createOscillator();
      droneOsc1.type = "sine";
      droneOsc2.type = "sine";
      droneOsc1.frequency.setValueAtTime(136.1, ctx.currentTime); // OM frequency
      droneOsc2.frequency.setValueAtTime(272.2, ctx.currentTime);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.18, ctx.currentTime);

      droneOsc1.connect(droneGain);
      droneOsc2.connect(droneGain);
      droneGain.connect(masterGain);

      droneOsc1.start();
      droneOsc2.start();
      this.ambientSourceNodes.push(droneOsc1, droneOsc2, droneGain);
    }
  }

  setAmbientVolume(vol: number) {
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.setValueAtTime(Math.min(1, Math.max(0, vol)), this.ctx.currentTime);
    }
  }

  stopAmbient() {
    this.ambientSourceNodes.forEach((node) => {
      try {
        if ((node as any).stop) (node as any).stop();
        node.disconnect();
      } catch {}
    });
    this.ambientSourceNodes = [];
    if (this.ambientGainNode) {
      this.ambientGainNode.disconnect();
      this.ambientGainNode = null;
    }
    this.currentAmbientType = null;
  }

  getCurrentAmbientType() {
    return this.currentAmbientType;
  }
}

export const audioSynth = new AudioSynthEngine();
