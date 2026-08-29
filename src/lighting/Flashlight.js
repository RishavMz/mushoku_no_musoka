import * as THREE from "three";

export class Flashlight {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.isOn = true;

    this.spotLight = new THREE.SpotLight(0xffddaa, 20);
    this.spotLight.angle = Math.PI / 6;
    this.spotLight.penumbra = 0.8;
    this.spotLight.decay = 2;
    this.spotLight.distance = 80;
    this.spotLight.castShadow = true;

    this.camera.add(this.spotLight);
    this.spotLight.position.set(0.2, -0.2, -0.1);
    this.spotLight.target = new THREE.Object3D();
    this.camera.add(this.spotLight.target);
    this.spotLight.target.position.set(0, 0, -5);

    this.scene.add(this.camera);
  }

  toggle() {
    this.isOn = !this.isOn;
    this.spotLight.visible = this.isOn;
    return this.isOn;
  }
}
