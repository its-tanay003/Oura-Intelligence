
/**
 * LAYER 4: AMBIENT SENSORY WEB
 * A lightweight, dependency-free audio engine for UI Sonification.
 * 
 * Philosophy: Sound is not an alert; it is a texture.
 * Tech: Native Web Audio API (No large libraries).
 */

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private isMuted: boolean = false;

  constructor() {
    // Lazy init to comply with autoplay policies
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.1; // Low ambient volume
    this.masterGain.connect(this.ctx.destination);
  }

  public async resume() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * playInteraction: Subtle feedback for UI clicks
   * Uses a high-pass filtered noise burst or sine ping.
   */
  public playInteraction(type: 'tap' | 'success' | 'error') {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;

    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } 
    else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  }

  /**
   * startDrone: Generates a procedural background texture based on "Mood".
   * This is the sonic "Digital Twin" state.
   */
  public startDrone(intensity: number) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    this.stopDrone();

    // Base frequency based on intensity (Lower = Calmer)
    const baseFreq = 100 + (intensity * 200); 

    // Create 3 oscillators for a chord
    const ratios = [1, 1.5, 1.2]; // Root, Fifth, Minor Third
    
    ratios.forEach((ratio, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = baseFreq * ratio;
      
      // LFO for movement
      const lfo = this.ctx!.createOscillator();
      lfo.frequency.value = 0.1 + (Math.random() * 0.2); // Slow breath
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 5; // FM depth
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      // Fade in
      const now = this.ctx!.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 2); // Very subtle

      osc.start(now);
      lfo.start(now);
      
      this.droneOscillators.push(osc);
      this.droneOscillators.push(lfo); // Track LFOs to stop them too
    });
  }

  public stopDrone() {
    this.droneOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch(e) {}
    });
    this.droneOscillators = [];
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) this.stopDrone();
  }
}

export const ambient = new AmbientEngine();
