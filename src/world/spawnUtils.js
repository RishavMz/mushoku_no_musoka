import * as THREE from "three";

export function randomPositionNear(center, terrain, minDist, maxDist) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = minDist + Math.random() * (maxDist - minDist);
    const pos = new THREE.Vector3(
      center.x + Math.cos(angle) * dist,
      0,
      center.z + Math.sin(angle) * dist,
    );
    if (!terrain.isOutOfBounds(pos)) return pos;
  }
  return new THREE.Vector3(center.x, 0, center.z);
}
