import * as THREE from "three";

const PICKUP_RANGE = 2.5;
const SPAWN_HEIGHT = 1.0;

export class Key {
  constructor(scene, position) {
    this.scene = scene;
    this.isNearPlayer = false;
    this.age = 0;

    this.group = new THREE.Group();
    this.group.position.set(position.x, SPAWN_HEIGHT, position.z);

    const material = new THREE.MeshStandardMaterial({
      color: 0xffcc33,
      emissive: 0xaa7700,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.3,
    });

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.05, 12, 24),
      material,
    );
    ring.rotation.x = Math.PI / 2;
    this.group.add(ring);

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
      material,
    );
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.35;
    this.group.add(shaft);

    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.08), material);
    tooth.position.z = 0.52;
    this.group.add(tooth);

    this.light = new THREE.PointLight(0xffcc33, 3, 4);
    this.group.add(this.light);

    this.scene.add(this.group);
  }

  update(delta, cameraPosition) {
    this.age += delta;
    this.group.position.y = SPAWN_HEIGHT + Math.sin(this.age * 2) * 0.15;
    this.group.rotation.y += delta * 1.5;

    const dx = cameraPosition.x - this.group.position.x;
    const dz = cameraPosition.z - this.group.position.z;
    this.isNearPlayer = dx * dx + dz * dz < PICKUP_RANGE * PICKUP_RANGE;
  }

  pickup() {
    this.scene.remove(this.group);
    this.group.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
  }
}
