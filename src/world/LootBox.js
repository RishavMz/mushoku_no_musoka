import * as THREE from "three";

const UNLOCK_RANGE = 2.5;
const SPAWN_HEIGHT = 0.4;

export class LootBox {
  constructor(scene, position) {
    this.scene = scene;
    this.isNearPlayer = false;
    this.age = 0;

    this.group = new THREE.Group();
    this.group.position.set(position.x, SPAWN_HEIGHT, position.z);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.9,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.6), bodyMaterial);
    this.group.add(body);

    const latchMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc33,
      emissive: 0xaa7700,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3,
    });
    this.latch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), latchMaterial);
    this.latch.position.set(0, 0, 0.34);
    this.group.add(this.latch);

    this.scene.add(this.group);
  }

  update(delta, cameraPosition) {
    this.age += delta;
    const pulse = 0.5 + Math.sin(this.age * 3) * 0.5;
    this.latch.material.emissiveIntensity = 0.3 + pulse * 0.6;

    const dx = cameraPosition.x - this.group.position.x;
    const dz = cameraPosition.z - this.group.position.z;
    this.isNearPlayer = dx * dx + dz * dz < UNLOCK_RANGE * UNLOCK_RANGE;
  }

  unlock() {
    this.scene.remove(this.group);
    this.group.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
  }
}
