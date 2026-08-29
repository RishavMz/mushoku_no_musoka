import { AudioEngine } from "./audioEngine.js";

export class PlayerAudio {
  constructor() {
    this.engine = new AudioEngine();
    this.stepTimer = 0;
    window.playerAudioRef = this;
  }

  init() {
    this.engine.init();
  }

  updateFootsteps(delta, isMoving, isGrounded, isSprinting) {
    if (!isMoving || !isGrounded) {
      this.stepTimer = 0;
      return;
    }

    const stepInterval = isSprinting ? 0.3 : 0.5;
    this.stepTimer += delta;

    if (this.stepTimer >= stepInterval) {
      this.engine.playFootstep(isSprinting);
      this.stepTimer = 0;
    }
  }

  playFlashlightToggle() {
    this.engine.playToggleSound();
  }
}
