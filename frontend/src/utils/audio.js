// Web Audio API Synthesizer for tactile mechanical feedback and acoustic simulations
// Generates authentic mechanical clicks, spring snaps, watch escapement ticks, ANC filtering, and chimes

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ancNoiseSource = null;
    this.ancGain = null;
    this.ancFilter = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.ancNoiseSource) {
      this.stopAncSimulation();
    }
    return this.muted;
  }

  // Authentic mechanical spring-lever and sliding card sound
  playEjectSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Spring trigger click (metallic mechanical thud)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.05);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);

    // 2. Stepped card slide friction (5 cascading clicks)
    for (let i = 0; i < 5; i++) {
      const cardTime = now + 0.035 + i * 0.032;
      const cardOsc = this.ctx.createOscillator();
      const cardGain = this.ctx.createGain();

      cardOsc.type = 'sine';
      cardOsc.frequency.setValueAtTime(1600 + i * 220, cardTime);
      cardOsc.frequency.exponentialRampToValueAtTime(280, cardTime + 0.02);

      cardGain.gain.setValueAtTime(0.09, cardTime);
      cardGain.gain.exponentialRampToValueAtTime(0.001, cardTime + 0.025);

      cardOsc.connect(cardGain);
      cardGain.connect(this.ctx.destination);
      cardOsc.start(cardTime);
      cardOsc.stop(cardTime + 0.025);
    }
  }

  // Smooth slide-in retract click
  playRetractSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.07);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Tactile card flip swish sound
  playCardFlipSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.03);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Realistic internal shake / anti-fall friction test sound
  playShakeRattleSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const shakeTime = now + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 - i * 40, shakeTime);
      osc.frequency.exponentialRampToValueAtTime(90, shakeTime + 0.025);

      gain.gain.setValueAtTime(0.12, shakeTime);
      gain.gain.exponentialRampToValueAtTime(0.001, shakeTime + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(shakeTime);
      osc.stop(shakeTime + 0.025);
    }
  }

  // Luxury UI chime for Add to Cart
  playAddToCartSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 major arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);

      gain.gain.setValueAtTime(0.08, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.28);
    });
  }

  // RFID scan pulse sound
  playRfidScanSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(1760, now + 0.16);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Crisp metallic click for switches, bolt action, keys, buckle snap
  playMechanicalClick(frequency = 1400, duration = 0.045) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + duration);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  // Precision watch escapement tick
  playWatchTick(high = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(high ? 2800 : 1900, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.018);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.02);
  }

  // Magnetic snap / haptic thud for MagSafe, FIDLOCK buckle, earbud case lid
  playHapticSnap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Realistic tempered glass fracture & shatter burst
  playGlassShatter() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Initial high-energy impact crack
    const impactOsc = this.ctx.createOscillator();
    const impactGain = this.ctx.createGain();
    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime(450, now);
    impactOsc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    impactGain.gain.setValueAtTime(0.45, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    impactOsc.connect(impactGain);
    impactGain.connect(this.ctx.destination);
    impactOsc.start(now);
    impactOsc.stop(now + 0.08);

    // 2. High-frequency crystalline glass crackle
    const glassPitches = [3400, 4800, 6200, 7800];
    glassPitches.forEach((freq, idx) => {
      const gOsc = this.ctx.createOscillator();
      const gGain = this.ctx.createGain();
      const delay = idx * 0.025;

      gOsc.type = 'sawtooth';
      gOsc.frequency.setValueAtTime(freq, now + delay);
      gOsc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + delay + 0.12);

      gGain.gain.setValueAtTime(0.12, now + delay);
      gGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);

      gOsc.connect(gGain);
      gGain.connect(this.ctx.destination);
      gOsc.start(now + delay);
      gOsc.stop(now + delay + 0.14);
    });
  }

  // Realistic bolt-action mechanism: slide along L-track + spring detent lock
  playBoltAction(deployed) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (deployed) {
      // 1. Sliding along CNC machined channel
      const slideOsc = this.ctx.createOscillator();
      const slideGain = this.ctx.createGain();
      slideOsc.type = 'sawtooth';
      slideOsc.frequency.setValueAtTime(800, now);
      slideOsc.frequency.linearRampToValueAtTime(1400, now + 0.06);

      slideGain.gain.setValueAtTime(0.08, now);
      slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      slideOsc.connect(slideGain);
      slideGain.connect(this.ctx.destination);
      slideOsc.start(now);
      slideOsc.stop(now + 0.06);

      // 2. Solid metallic detent notch lock
      const lockOsc = this.ctx.createOscillator();
      const lockGain = this.ctx.createGain();
      lockOsc.type = 'triangle';
      lockOsc.frequency.setValueAtTime(1850, now + 0.065);
      lockOsc.frequency.exponentialRampToValueAtTime(180, now + 0.11);

      lockGain.gain.setValueAtTime(0.35, now + 0.065);
      lockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      lockOsc.connect(lockGain);
      lockGain.connect(this.ctx.destination);
      lockOsc.start(now + 0.065);
      lockOsc.stop(now + 0.11);
    } else {
      // Spring return snap
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'sine';
      snapOsc.frequency.setValueAtTime(1200, now);
      snapOsc.frequency.exponentialRampToValueAtTime(140, now + 0.07);

      snapGain.gain.setValueAtTime(0.3, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      snapOsc.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.07);
    }
  }

  // Realistic mechanical keyboard switch actuation ("thock" or "clack")
  playKeyThock(switchType = 'clicky') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (switchType === 'clicky') {
      // Crisp click leaf spring + bottom-out
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sawtooth';
      clickOsc.frequency.setValueAtTime(2400, now);
      clickOsc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

      clickGain.gain.setValueAtTime(0.2, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.025);
    }

    // Bottom out thock (PBT keycap impacting aluminum switch plate)
    const thockOsc = this.ctx.createOscillator();
    const thockGain = this.ctx.createGain();
    thockOsc.type = 'sine';
    thockOsc.frequency.setValueAtTime(switchType === 'clicky' ? 220 : 175, now + 0.01);
    thockOsc.frequency.exponentialRampToValueAtTime(50, now + 0.06);

    thockGain.gain.setValueAtTime(0.32, now + 0.01);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    thockOsc.connect(thockGain);
    thockGain.connect(this.ctx.destination);
    thockOsc.start(now + 0.01);
    thockOsc.stop(now + 0.065);
  }

  // Water splash / hydrostatic submersion sound
  playWaterSubmerge(submerged = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (submerged) {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
    } else {
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
    }

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Micro-ratchet dial click (BOA dial / Rotary encoder)
  playRatchetClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.012);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.014);
  }

  // Active Noise Cancellation transition whoosh
  playAncToggle(active = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (active) {
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.2);
    } else {
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.2);
    }

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // High-tech laser / sensor beep for UV-C sterilization or Biometric heart rate pulse
  playLaserBeep(frequency = 1046) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // REAL LIVE ANC AUDIO SIMULATION:
  // Synthesizes an actual background commuter rumble through the user's speakers,
  // and dynamically applies a digital biquad filter when ANC mode changes!
  startAncSimulation(mode = 'anc') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    if (this.ancNoiseSource) {
      this.updateAncMode(mode);
      return;
    }

    // Generate brown/pink ambient city/airplane rumble noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain
    }

    this.ancNoiseSource = this.ctx.createBufferSource();
    this.ancNoiseSource.buffer = noiseBuffer;
    this.ancNoiseSource.loop = true;

    this.ancFilter = this.ctx.createBiquadFilter();
    this.ancGain = this.ctx.createGain();

    this.updateAncMode(mode);

    this.ancNoiseSource.connect(this.ancFilter);
    this.ancFilter.connect(this.ancGain);
    this.ancGain.connect(this.ctx.destination);

    this.ancNoiseSource.start();
  }

  updateAncMode(mode) {
    if (!this.ctx || !this.ancFilter || !this.ancGain) return;
    const now = this.ctx.currentTime;

    if (mode === 'anc') {
      // 45dB Active Noise Cancellation: Cut low frequencies & drop gain by 95%
      this.ancFilter.type = 'lowpass';
      this.ancFilter.frequency.setTargetAtTime(150, now, 0.1);
      this.ancGain.gain.setTargetAtTime(0.015, now, 0.1);
    } else if (mode === 'transparency') {
      // Transparency: Bandpass mid/high frequencies for voices & horns
      this.ancFilter.type = 'bandpass';
      this.ancFilter.frequency.setTargetAtTime(1200, now, 0.1);
      this.ancFilter.Q.setTargetAtTime(0.7, now, 0.1);
      this.ancGain.gain.setTargetAtTime(0.12, now, 0.1);
    } else {
      // Passive Off: Full ambient rumble
      this.ancFilter.type = 'allpass';
      this.ancGain.gain.setTargetAtTime(0.18, now, 0.1);
    }
  }

  stopAncSimulation() {
    if (this.ancNoiseSource) {
      try {
        this.ancNoiseSource.stop();
        this.ancNoiseSource.disconnect();
      } catch (e) {
        // ignore
      }
      this.ancNoiseSource = null;
      this.ancFilter = null;
      this.ancGain = null;
    }
  }

  // Speaker Power On Startup Chime
  playSpeakerStartup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.18);
    });
  }

  // Speaker Power Down Chime
  playSpeakerShutdown() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [783.99, 659.25, 523.25].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.18, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.18);
    });
  }

  // Deep Sub-Bass Pulse / Rhythm Thump
  playSpeakerBassPulse(bassBoost = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Low sub-bass sine drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(bassBoost ? 90 : 130, now);
    subOsc.frequency.exponentialRampToValueAtTime(bassBoost ? 38 : 55, now + 0.22);
    
    subGain.gain.setValueAtTime(bassBoost ? 0.42 : 0.28, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.25);

    // Punch transient click
    const punch = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punch.type = 'triangle';
    punch.frequency.setValueAtTime(350, now);
    punch.frequency.exponentialRampToValueAtTime(80, now + 0.04);
    punchGain.gain.setValueAtTime(0.15, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    punch.connect(punchGain);
    punchGain.connect(this.ctx.destination);
    punch.start(now);
    punch.stop(now + 0.04);
  }

  // Metal Bottle Cap Pop Lever Action
  playBottleCapPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const pryOsc = this.ctx.createOscillator();
    const pryGain = this.ctx.createGain();
    pryOsc.type = 'triangle';
    pryOsc.frequency.setValueAtTime(800, now);
    pryOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.03);
    pryGain.gain.setValueAtTime(0.2, now);
    pryGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    pryOsc.connect(pryGain);
    pryGain.connect(this.ctx.destination);
    pryOsc.start(now);
    pryOsc.stop(now + 0.035);

    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(450, now + 0.035);
    popOsc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
    popGain.gain.setValueAtTime(0.35, now + 0.035);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    popOsc.connect(popGain);
    popGain.connect(this.ctx.destination);
    popOsc.start(now + 0.035);
    popOsc.stop(now + 0.14);

    const ring = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(3200, now + 0.04);
    ringGain.gain.setValueAtTime(0.12, now + 0.04);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    ring.connect(ringGain);
    ringGain.connect(this.ctx.destination);
    ring.start(now + 0.04);
    ring.stop(now + 0.28);
  }

  // Heavy Prybar Leverage Creak
  playPryLeverCreak() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 120-Click Unidirectional Dive Watch Bezel Click
  playDiverBezelClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.015);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.018);
  }
}

export const soundManager = new SoundManager();
