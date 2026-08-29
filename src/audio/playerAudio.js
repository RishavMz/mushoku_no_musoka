import { AudioEngine } from "./AudioEngine.js";

export class PlayerAudio {
  constructor() {
    this.engine = new AudioEngine();
    this.stepTimer = 0;
  }

  init() {
    this.engine.init();
    if (this.engine.ctx) this.engine.ctx.resume().catch(() => {});
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
