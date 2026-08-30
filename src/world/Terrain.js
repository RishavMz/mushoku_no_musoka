import * as THREE from "three";

export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.size = 120; // Bound radius of normal playable terrain
    this.initTerrain();
  }

  initTerrain() {
    // 1. Initialize Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // 2. Base Texture Settings
    const groundTexture = textureLoader.load(
      `${import.meta.env.BASE_URL}textures/ground.jpg`,
    );
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(100, 100);
    groundTexture.anisotropy = 16; // Keeps texture sharp at camera angles

    // 3. Ground Plane with Random Vertex Displacement
    const geometry = new THREE.PlaneGeometry(300, 300, 64, 64);
    geometry.rotateX(-Math.PI / 2);

    // 4. Base Ground Material
    const material = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.85,
      metalness: 0.2,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    // 5. Overlaid Blended Patch Layer (Breaks repeating grid pattern)
    const patchTexture = groundTexture.clone();
    patchTexture.repeat.set(7, 7);
    patchTexture.rotation = Math.PI / 3;

    const patchMaterial = new THREE.MeshStandardMaterial({
      map: patchTexture,
      transparent: true,
      opacity: 0.4,
      roughness: 1.0,
      color: 0x889977, // Slight color tint variance
    });

    const patchMesh = new THREE.Mesh(geometry.clone(), patchMaterial);
    patchMesh.position.y = 0.02;
    this.scene.add(patchMesh);

    // Decorative Boundary Indicators
    const ringGeo = new THREE.RingGeometry(this.size - 1, this.size, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff3300,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.08;
    this.scene.add(ringMesh);
  }

  isOutOfBounds(position) {
    const distanceFromCenter = Math.sqrt(position.x ** 2 + position.z ** 2);
    return distanceFromCenter > this.size;
  }
}
