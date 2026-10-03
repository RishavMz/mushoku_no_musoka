import * as THREE from "three";
import { Terrain } from "../world/Terrain.js";
import { Player } from "../player/Player.js";
import { Knight } from "../world/Knight.js";
import { Key } from "../world/Key.js";
import { LootBox } from "../world/LootBox.js";
import { randomPositionNear } from "../world/spawnUtils.js";

const SWORD_DAMAGE = 25;

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
    document
      .getElementById("game-container")
      .appendChild(this.renderer.domElement);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0806, 0.1);

    const sun = new THREE.DirectionalLight(0xffffff, 0.5);
    sun.position.set(10, 20, 10);
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0x1a120b, 0.4));
  }

  _initSystems() {
    this.clock = new THREE.Clock();
    this.terrain = new Terrain(this.scene);
    this.player = new Player(this.camera, this.scene, this.terrain);
    this.knight = new Knight(this.scene);
    this.key = new Key(this.scene);
    this.lootBox = new LootBox(this.scene);
    this._warmShaders();

    // Knight deals damage through the player's health system
    this.knight.onAttackHit = () => this.player.health.takeDamage(10);

    // Key/box arc only runs once — no point spawning another key once armed
    this.knight.onEnterAttack = () => {
      if (this.player.hasSword || this.key.isActive || this.lootBox.isActive)
        return;
      this.key.spawn(
        randomPositionNear(this.camera.position, this.terrain, 2, 4),
      );
    };

    this.player.controls.onSwingCallback = () => {
      if (!this.player.swingSword()) return;
      if (this.knight.canBeHit(this.camera.position)) {
        this.knight.takeDamage(SWORD_DAMAGE);
        this.player.audio.playSwordHit();
        this.player.consumeSword();
        if (!this.key.isActive && !this.lootBox.isActive) {
          this.key.spawn(
            randomPositionNear(this.camera.position, this.terrain, 2, 4),
          );
        }
      }
    };
  }

  // Forces WebGL to compile shaders for later-appearing objects up front,
  // so their first real spawn mid-gameplay doesn't stutter.
  _warmShaders() {
    this.key.group.visible = true;
    this.lootBox.group.visible = true;
    this.player.sword.group.visible = true;
    this.renderer.compile(this.scene, this.camera);
    this.key.group.visible = false;
    this.lootBox.group.visible = false;
    this.player.sword.group.visible = false;
  }

  _initEvents() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener("keydown", (e) => {
      if (e.code !== "KeyE") return;
      if (this.knight.isNearPlayer) this.knight.interact();
      else if (this.key.isNearPlayer) this._collectKey();
      else if (this.lootBox.isNearPlayer) this._unlockBox();
    });
  }

  _collectKey() {
    this.key.pickup();
    this.player.pickupKey();
    this.lootBox.spawn(
      randomPositionNear(this.camera.position, this.terrain, 2, 4),
    );
  }

  _unlockBox() {
    this.lootBox.unlock();
    this.player.unlockBox();
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    const delta = this.clock.getDelta();

    this.player.update(delta);
    this.knight.update(delta, this.camera.position);
    this.key.update(delta, this.camera.position);
    this.lootBox.update(delta, this.camera.position);

    if (this.knight.isNearPlayer) {
      this.player.setInteractPrompt(true, "INTERACT");
    } else if (this.key.isNearPlayer) {
      this.player.setInteractPrompt(true, "PICK UP KEY");
    } else if (this.lootBox.isNearPlayer) {
      this.player.setInteractPrompt(true, "UNLOCK BOX");
    } else {
      this.player.setInteractPrompt(false);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
