import * as THREE from "three";
import { Terrain } from "../world/Terrain.js";
import { Player } from "../player/Player.js";
import { Knight } from "../world/Knight.js";

export class Game {
  constructor() {
    this._initRenderer();
    this._initScene();
    this._initSystems();
    this._initEvents();
    this._loop();
  }

  _initRenderer() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("game-container").appendChild(this.renderer.domElement);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0806, 0.1);

    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 20, 10);
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0x1a120b, 0.4));
  }

  _initSystems() {
    this.clock = new THREE.Clock();
    this.terrain = new Terrain(this.scene);
    this.player = new Player(this.camera, this.scene, this.terrain);
    this.knight = new Knight(this.scene);

    // Knight deals damage through the player's health system
    this.knight.onAttackHit = () => this.player.health.takeDamage(10);
  }

  _initEvents() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyE" && this.knight.isNearPlayer) this.knight.interact();
    });
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    const delta = this.clock.getDelta();

    this.player.update(delta);
    this.knight.update(delta, this.camera.position);
    this.player.setInteractPrompt(this.knight.isNearPlayer);

    this.renderer.render(this.scene, this.camera);
  }
}
