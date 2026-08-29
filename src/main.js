import * as THREE from "three";
import { Terrain } from "./environment/Terrain.js";
import { Player } from "./player/player.js";
import { Knight } from "./world/knight.js";

class Game {
  constructor() {
    this.container = document.getElementById("game-container");

    // Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0806, 0.1);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(10, 20, 10);
    this.scene.add(sunLight);

    // Camera Setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    // Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Ambient/Environment Lighting
    const ambientLight = new THREE.AmbientLight(0x1a120b, 0.4);
    this.scene.add(ambientLight);

    // Initialize Components
    this.terrain = new Terrain(this.scene);
    this.player = new Player(this.camera, this.scene, this.terrain);
    this.knight = new Knight(this.scene);

    this.clock = new THREE.Clock();

    // Event Listeners
    window.addEventListener("resize", () => this.onWindowResize());
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyE" && this.knight.isNearPlayer) {
        this.knight.interact();
      }
    });

    // Start Game Loop
    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    this.player.update(delta);
    this.knight.update(delta, this.camera.position);

    if (this.knight.attackHit && !this.player.isDead) {
      this.knight.attackHit = false;
      this.player.health = Math.max(0, this.player.health - 10);
      if (this.player.health <= 0) {
        this.player.health = 0;
        this.player.isDead = true;
        this.player.hud.showDeathState();
      }
    }

    this.player.hud.showInteractPrompt(
      this.knight.isNearPlayer && !this.knight.isAnimating,
    );

    this.renderer.render(this.scene, this.camera);
  }
}

new Game();
