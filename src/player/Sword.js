import * as THREE from "three";

const SWING_DURATION = 0.25;
const REST_ROTATION = new THREE.Euler(0.3, 0.5, -0.4);
const REST_POSITION = new THREE.Vector3(0.35, -0.3, -0.6);

export class Sword {
  constructor(camera) {
    this.group = new THREE.Group();
    this.group.visible = false;
    this.group.position.copy(REST_POSITION);
    this.group.rotation.copy(REST_ROTATION);

    const metal = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.25,
    });
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x442211,
      roughness: 0.8,
    });

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.02), metal);
    blade.position.y = 0.35;
    this.group.add(blade);

    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.03), metal);
    this.group.add(guard);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8),
      handleMaterial,
    );
    handle.position.y = -0.12;
    this.group.add(handle);

    camera.add(this.group);

    this.isSwinging = false;
    this.swingElapsed = 0;
  }

  show() {
    this.group.visible = true;
  }

  swing() {
    if (this.isSwinging) return;
    this.isSwinging = true;
    this.swingElapsed = 0;
  }

  update(delta) {
    if (!this.isSwinging) return;

    this.swingElapsed += delta;
    const t = Math.min(1, this.swingElapsed / SWING_DURATION);
    const arc = Math.sin(t * Math.PI);

    this.group.rotation.x = REST_ROTATION.x - arc * 1.2;
    this.group.rotation.z = REST_ROTATION.z - arc * 0.6;

    if (t >= 1) {
      this.isSwinging = false;
      this.group.rotation.copy(REST_ROTATION);
    }
  }
}
