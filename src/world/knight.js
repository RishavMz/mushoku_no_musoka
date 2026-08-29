import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const INTERACT_RANGE = 3; // units — show [E] prompt
const STOP_RANGE = 2; // units — switch to attack
const WALK_SPEED = 1.0; // units/sec

const State = {
  IDLE: "idle",
  INTERACTING: "interacting",
  MACARENA: "macarena",
  FOLLOWING: "following",
  ATTACKING: "attacking",
};

export class Knight {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.mixer = null;
    this.currentAction = null;
    this.interactAction = null;
    this.macarenaAction = null;
    this.walkAction = null;
    this.attackAction = null;
    this.state = State.IDLE;
    this.isNearPlayer = false;
    this.isAttacking = false;
    this.attackHit = false;
    this.isReady = false;

    const angle = Math.random() * Math.PI * 2;
    const dist = 6 + Math.random() * 6;
    this.spawnPosition = new THREE.Vector3(
      Math.cos(angle) * dist,
      0,
      Math.sin(angle) * dist,
    );

    this._load();
  }

  _load() {
    const loader = new FBXLoader();

    loader.load(
      "/animations/knight.fbx",
      (fbx) => {
        this.mesh = fbx;
        fbx.scale.setScalar(0.01);
        fbx.position.copy(this.spawnPosition);
        fbx.lookAt(0, 0, 0);
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.scene.add(fbx);

        this.mixer = new THREE.AnimationMixer(fbx);
        this.mixer.addEventListener("finished", () => this._onAnimFinished());
        this.mixer.addEventListener("loop", (e) => {
          if (e.action === this.attackAction) this.attackHit = true;
        });

        if (fbx.animations.length > 0) {
          this.interactAction = this.mixer.clipAction(fbx.animations[0]);
          this.interactAction.setLoop(THREE.LoopOnce);
          this.interactAction.clampWhenFinished = true;
        }

        loader.load(
          "/animations/Macarena.fbx",
          (macarenaFbx) => {
            if (macarenaFbx.animations.length > 0) {
              this.macarenaAction = this.mixer.clipAction(
                macarenaFbx.animations[0],
              );
              this.macarenaAction.setLoop(THREE.LoopOnce);
              this.macarenaAction.clampWhenFinished = true;
            }

            loader.load(
              "/animations/Walking.fbx",
              (walkFbx) => {
                if (walkFbx.animations.length > 0) {
                  this.walkAction = this.mixer.clipAction(
                    walkFbx.animations[0],
                  );
                  this.walkAction.setLoop(THREE.LoopRepeat);
                }

                loader.load(
                  "/animations/Attack.fbx",
                  (attackFbx) => {
                    if (attackFbx.animations.length > 0) {
                      this.attackAction = this.mixer.clipAction(
                        attackFbx.animations[0],
                      );
                      this.attackAction.setLoop(THREE.LoopRepeat);
                    }
                    this._onReady();
                  },
                  undefined,
                  (err) => {
                    console.error("Attack FBX error:", err);
                    this._onReady();
                  },
                );
              },
              undefined,
              (err) => {
                console.error("Walking FBX error:", err);
                this._onReady();
              },
            );
          },
          undefined,
          (err) => {
            console.error("Macarena FBX error:", err);
            this._onReady();
          },
        );
      },
      undefined,
      (err) => console.error("Knight FBX error:", err),
    );
  }

  _onReady() {
    this.isReady = true;
    if (!this.interactAction) return;
    // Freeze on animation frame 0 so character isn't in T-pose
    this.interactAction.reset().play();
    this.mixer.update(0);
    this.interactAction.paused = true;
    this.currentAction = this.interactAction;
  }

  _onAnimFinished() {
    if (this.state === State.INTERACTING) {
      this._goTo(State.MACARENA, this.macarenaAction);
    } else if (this.state === State.MACARENA) {
      this._goTo(State.FOLLOWING, this.walkAction);
    }
  }

  _goTo(newState, nextAction) {
    if (!nextAction) return;
    this.state = newState;
    if (this.currentAction) this.currentAction.fadeOut(0.3);
    nextAction.reset().fadeIn(0.3).play();
    this.currentAction = nextAction;
  }

  interact() {
    if (!this.isReady || this.state !== State.IDLE) return;
    this.state = State.INTERACTING;
    this.interactAction.paused = false;
    this.interactAction.reset().play();
    this.currentAction = this.interactAction;
  }

  update(delta, cameraPosition) {
    if (this.mixer) this.mixer.update(delta);
    if (!this.mesh) {
      this.isNearPlayer = false;
      return;
    }

    const dx = cameraPosition.x - this.mesh.position.x;
    const dz = cameraPosition.z - this.mesh.position.z;
    const distSq = dx * dx + dz * dz;
    const inRange = distSq <= STOP_RANGE * STOP_RANGE;

    // [E] prompt only visible before the one-time interaction
    this.isNearPlayer =
      this.state === State.IDLE && distSq < INTERACT_RANGE * INTERACT_RANGE;

    if (this.state === State.FOLLOWING) {
      if (inRange) {
        // Enter attack state
        this._goTo(State.ATTACKING, this.attackAction);
      } else {
        // Move and face player
        const dist = Math.sqrt(distSq);
        this.mesh.position.x += (dx / dist) * WALK_SPEED * delta;
        this.mesh.position.z += (dz / dist) * WALK_SPEED * delta;
        this.mesh.lookAt(
          new THREE.Vector3(
            cameraPosition.x,
            this.mesh.position.y,
            cameraPosition.z,
          ),
        );
      }
    } else if (this.state === State.ATTACKING) {
      if (!inRange) {
        // Player escaped — resume following
        this._goTo(State.FOLLOWING, this.walkAction);
      }
    }

    this.isAttacking = this.state === State.ATTACKING;
  }
}
