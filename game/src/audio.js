// Midnight Vault — sound, synthesized live with WebAudio, no audio files.
// One job: short bleeps and stings for pickups, alarms, the vault and the win.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  // Browsers only allow audio after a user gesture; call on first input.
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    } catch {
      this.ctx = null;
    }
  }

  tone(freq, dur, type, volume, when = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  pickup() {
    this.tone(880, 0.09, 'sine', 0.12);
    this.tone(1318, 0.12, 'sine', 0.1, 0.07);
  }

  tool() {
    this.tone(520, 0.08, 'triangle', 0.12);
    this.tone(390, 0.1, 'triangle', 0.1, 0.06);
  }

  alarmSting() {
    this.tone(220, 0.16, 'sawtooth', 0.14);
    this.tone(165, 0.22, 'sawtooth', 0.14, 0.14);
  }

  grab() {
    this.tone(140, 0.25, 'square', 0.16);
    this.tone(90, 0.3, 'square', 0.16, 0.12);
  }

  vaultCrack() {
    this.tone(660, 0.1, 'sine', 0.12);
    this.tone(990, 0.1, 'sine', 0.12, 0.09);
    this.tone(1320, 0.22, 'sine', 0.14, 0.18);
  }

  winJingle() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => this.tone(n, 0.22, 'triangle', 0.14, i * 0.13));
  }

  floorClear() {
    this.tone(784, 0.12, 'triangle', 0.12);
    this.tone(1047, 0.2, 'triangle', 0.12, 0.1);
  }
}
