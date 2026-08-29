import * as THREE from "three";
import { PlayerControls } from "./playerControls.js";
import { Flashlight } from "./flashlight.js";
import { PlayerAudio } from "../audio/playerAudio.js";
import { HUD } from "./hud.js";

export class Player {
  constructor(camera, scene, terrain) {
    this.camera = camera;
    this.scene = scene;
    this.terrain = terrain;

    this.position = new THREE.Vector3(0, 1.7, 0);
    this.camera.position.copy(this.position);

    // Attributes
    this.maxHealth = 100;
    this.health = 100;
    this.maxStamina = 100;
    this.stamina = 100;

    this.isDead = false;
    this.isExhausted = false;

    // Submodules
    this.controls = new PlayerControls(this.camera, document.body);
    this.flashlight = new Flashlight(this.camera, this.scene);
    this.audio = new PlayerAudio();
    this.hud = new HUD();

    // Flashlight toggle hookup
    this.controls.onFlashlightToggleCallback = () => {
      const state = this.flashlight.toggle();
      this.hud.updateFlashlightStatus(state);
      this.audio.playFlashlightToggle();
    };
  }

  update(delta) {
    if (this.isDead) return;

    this.handleMovement(delta);
    this.handleBoundaryAndHazards(delta);

    this.hud.updateVitals(
      this.health,
      this.maxHealth,
      this.stamina,
      this.maxStamina,
      this.isExhausted,
      false,
    );
  }

  handleMovement(delta) {
    const isMoving =
      this.controls.moveForward ||
      this.controls.moveBackward ||
      this.controls.moveLeft ||
      this.controls.moveRight;

    let speed = 4.0;

    // Stamina / Sprint Logic
    if (this.controls.isSprinting && isMoving && !this.isExhausted) {
      speed = 7.5;
      this.stamina -= 25 * delta;
      if (this.stamina <= 0) {
        this.stamina = 0;
        this.isExhausted = true;
      }
    } else {
      this.stamina += 15 * delta;
      if (this.stamina >= this.maxStamina) {
        this.stamina = this.maxStamina;
        this.isExhausted = false;
      }
    }

    // Directional Movement Calculation
    const moveVector = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const side = new THREE.Vector3();

    this.controls.getDirection(forward);
    side.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (this.controls.moveForward) moveVector.add(forward);
    if (this.controls.moveBackward) moveVector.sub(forward);
    if (this.controls.moveRight) moveVector.add(side);
    if (this.controls.moveLeft) moveVector.sub(side);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(speed * delta);
      this.camera.position.add(moveVector);
    }

    // Update Footsteps Audio
    this.audio.updateFootsteps(
      delta,
      isMoving,
      true,
      this.controls.isSprinting && !this.isExhausted,
    );
  }

  handleBoundaryAndHazards(delta) {
    const isOut = this.terrain.isOutOfBounds(this.camera.position);

    this.hud.showToxicGasWarning(isOut);

    if (isOut) {
      // Apply Toxic Gas Damage
      this.health -= 12 * delta;
      if (this.health <= 0) {
        this.health = 0;
        this.isDead = true;
        this.hud.showDeathState();
      }
    }
  }
}
