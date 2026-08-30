import { PlayerControls } from "./PlayerControls.js";
import { PlayerMovement } from "./PlayerMovement.js";
import { PlayerHealth } from "./PlayerHealth.js";
import { Sword } from "./Sword.js";
import { Flashlight } from "../lighting/Flashlight.js";
import { PlayerAudio } from "../audio/PlayerAudio.js";
import { HUD } from "../hud/HUD.js";

export class Player {
  constructor(camera, scene, terrain) {
    this.camera = camera;
    this.camera.position.set(0, 1.7, 0);
    this._terrain = terrain;

    this.controls = new PlayerControls(camera, document.body);
    this.movement = new PlayerMovement(this.controls, camera);
    this.health = new PlayerHealth();
    this.flashlight = new Flashlight(camera, scene);
    this.audio = new PlayerAudio();
    this.hud = new HUD();
    this.sword = new Sword(camera);

    this.hasKey = false;
    this.hasSword = false;

    this.health.onDeath = () => this.hud.showDeathState();

    this.controls.onFlashlightToggleCallback = () => {
      const isOn = this.flashlight.toggle();
      this.hud.updateFlashlightStatus(isOn);
      this.audio.playFlashlightToggle();
    };

    // HUD overlay triggers audio context init on first user interaction
    this.hud.setOnStart(() => this.audio.init());
  }

  get isDead() {
    return this.health.isDead;
  }

  setInteractPrompt(visible, label = "INTERACT") {
    this.hud.showInteractPrompt(visible, label);
  }

  pickupKey() {
    this.hasKey = true;
    this.hud.updateInventory(this.hasKey, this.hasSword);
    this.audio.playKeyPickup();
  }

  unlockBox() {
    this.hasKey = false;
    this.hasSword = true;
    this.sword.show();
    this.hud.updateInventory(this.hasKey, this.hasSword);
    this.audio.playBoxUnlock();
  }

  swingSword() {
    if (!this.hasSword || this.sword.isSwinging) return false;
    this.sword.swing();
    this.audio.playSwordSwing();
    return true;
  }

  update(delta) {
    if (this.health.isDead) return;

    this.movement.update(delta);
    this.sword.update(delta);
    this._handleBoundary(delta);
    this.audio.updateFootsteps(
      delta,
      this.movement.isMoving,
      true,
      this.movement.isSprinting,
    );

    this.hud.updateVitals(
      this.health.health,
      this.health.maxHealth,
      this.movement.stamina,
      this.movement.maxStamina,
      this.movement.isExhausted,
      false,
    );
  }

  _handleBoundary(delta) {
    const isOut = this._terrain.isOutOfBounds(this.camera.position);
    this.hud.showToxicGasWarning(isOut);
    if (isOut) this.health.takeDamage(12 * delta);
  }
}
