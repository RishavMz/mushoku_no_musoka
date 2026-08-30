import * as THREE from "three";

export class PlayerControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.isLocked = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;

    this.euler = new THREE.Euler(0, 0, 0, "YXZ");
    this.onFlashlightToggleCallback = null;
    this.onSwingCallback = null;

    this.initEvents();
  }

  initEvents() {
    this.domElement.addEventListener("click", () => {
      if (!this.isLocked) {
        this.domElement.requestPointerLock();
      }
    });

    document.addEventListener("pointerlockchange", () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener("mousemove", (event) => {
      if (!this.isLocked) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      this.euler.setFromQuaternion(this.camera.quaternion);

      this.euler.y -= movementX * 0.002;
      this.euler.x -= movementY * 0.002;
      this.euler.x = Math.max(
        -Math.PI / 2 + 0.01,
        Math.min(Math.PI / 2 - 0.01, this.euler.x),
      );

      this.camera.quaternion.setFromEuler(this.euler);
    });

    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));

    document.addEventListener("mousedown", (event) => {
      if (!this.isLocked) return;
      if (event.button === 0 && this.onSwingCallback) this.onSwingCallback();
    });
  }

  onKeyDown(event) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = true;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = true;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = true;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.isSprinting = true;
        break;
      case "KeyF":
        if (this.onFlashlightToggleCallback) this.onFlashlightToggleCallback();
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = false;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = false;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.isSprinting = false;
        break;
    }
  }

  getDirection(vector) {
    this.camera.getWorldDirection(vector);
    vector.y = 0;
    vector.normalize();
    return vector;
  }
}
