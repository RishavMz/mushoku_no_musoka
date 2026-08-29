import * as THREE from "three";

export class PlayerMovement {
  constructor(controls, camera) {
    this.controls = controls;
    this.camera = camera;
    this.maxStamina = 100;
    this.stamina = 100;
    this.isExhausted = false;
  }

  get isMoving() {
    const c = this.controls;
    return c.moveForward || c.moveBackward || c.moveLeft || c.moveRight;
  }

  get isSprinting() {
    return this.controls.isSprinting && !this.isExhausted;
  }

  update(delta) {
    this._updateStamina(delta);

    const speed = this.isSprinting ? 7.5 : 4.0;
    const moveVector = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const side = new THREE.Vector3();

    this.controls.getDirection(forward);
    side.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (this.controls.moveForward)  moveVector.add(forward);
    if (this.controls.moveBackward) moveVector.sub(forward);
    if (this.controls.moveRight)    moveVector.add(side);
    if (this.controls.moveLeft)     moveVector.sub(side);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(speed * delta);
      this.camera.position.add(moveVector);
    }
  }

  _updateStamina(delta) {
    if (this.controls.isSprinting && this.isMoving && !this.isExhausted) {
      this.stamina = Math.max(0, this.stamina - 25 * delta);
      if (this.stamina === 0) this.isExhausted = true;
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + 15 * delta);
      if (this.stamina >= this.maxStamina) this.isExhausted = false;
    }
  }
}
