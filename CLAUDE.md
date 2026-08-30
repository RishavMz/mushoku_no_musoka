# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A first-person browser game built with Three.js and Vite (WIP / hobby project — see README.md). No UI framework; the HUD is hand-built DOM/CSS.

## Commands

- `npm run dev` — start the Vite dev server (serves under `/mushoku_no_musoka/`, see Deployment below)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally

There is no lint or test tooling configured in this project (no `lint`/`test` scripts in `package.json`, no test files).

## Architecture

### Entry point and orchestration
`src/main.js` constructs a single `Game` (`src/core/Game.js`), which owns the renderer/scene/camera and is the **only** place that wires systems together. Cross-entity behavior (e.g. "the knight's attack damages the player", "a sword swing damages the knight") is expressed as callback properties assigned in `Game._initSystems()` — there is no event bus. When adding a new interaction between two systems, follow this pattern: expose an `onX` callback property on the source object, assign it from `Game.js`.

The render loop (`Game._loop`) drives every system's `update(delta, ...)` once per frame and is also where the single shared `[E]` interact-prompt is resolved by priority (knight > key > loot box) since only one prompt can show at a time.

### Player (`src/player/`)
`Player` is a composition root, not a monolith: `PlayerControls` (pointer-lock + WASD + mouse-look + click/mousedown input), `PlayerMovement` (speed/sprint/stamina), `PlayerHealth`, `Sword` (camera-attached view-model + swing animation), `Flashlight` (`src/lighting/`), `PlayerAudio`, and `HUD` are all constructed and owned by `Player` and driven from its own `update(delta)`. Inventory (`hasKey`, `hasSword`) lives directly on `Player` as plain flags — there's no separate inventory system since there are only two items.

Input callbacks (`onFlashlightToggleCallback`, `onSwingCallback`) are assigned by `Game.js`, not `Player` itself, keeping `PlayerControls` a dumb input source.

### Knight NPC (`src/world/Knight.js`)
A single state machine (`IDLE → INTERACTING → MACARENA → FOLLOWING → ATTACKING`, back to `MACARENA` on taking damage) driving FBX animation playback via a `THREE.AnimationMixer`. State transitions go through the internal `_goTo(state, action)` helper (crossfades actions). Animations load in a nested callback chain (interact → macarena → walk → attack) from `public/animations/*.fbx`; `_onReady()` fires once all four are loaded.

Key exposed hooks: `isNearPlayer` (for the `[E]` prompt), `onAttackHit` (fires per attack-animation loop, deals player damage), `onEnterAttack` (fires once, edge-triggered, on the `FOLLOWING → ATTACKING` transition — this is what spawns the key pickup), `canBeHit(cameraPosition)` / `takeDamage(amount)` (melee combat entry points, only valid while `FOLLOWING` or `ATTACKING`). Health resets to full every time the post-hit `MACARENA` stagger finishes — there is no defeat/win state, combat is an intentionally endless loop.

### World pickups (`src/world/`)
`Key` and `LootBox` are small, independent, self-contained entities (procedural geometry, own `update`/removal methods, own proximity check exposed as `isNearPlayer`) — deliberately not sharing a base "Interactable" class since there are only two of them and they never coexist in practice. `spawnUtils.randomPositionNear(center, terrain, minDist, maxDist)` is the one shared helper (pure geometry, retried against `terrain.isOutOfBounds`) used to place both near the player.

The equip arc is one-shot, gated in `Game.js`: a key only spawns if the player doesn't already have the sword and no key/box is currently active, so re-entering `ATTACKING` after being armed just resumes combat without spawning more loot.

### Assets and the GitHub Pages base path
`vite.config.js` sets `base: '/mushoku_no_musoka/'` for GitHub Pages deployment (repo is a project site at `https://rishavmz.github.io/mushoku_no_musoka/`). Because of this, **any reference to a file in `public/` must be prefixed with `` `${import.meta.env.BASE_URL}` `` rather than a bare root-absolute path** (e.g. `` `${import.meta.env.BASE_URL}textures/ground.jpg` ``, not `"/textures/ground.jpg"`) — a hardcoded `/`-rooted path 404s both in `npm run dev` and in the deployed build, since Vite serves `public/` under the configured base in both modes. All current textures/FBX animations already follow this; keep doing so for new assets.

There are no 3D models other than the knight's FBX animations in `public/animations/`. Every other object (terrain, key, loot box, sword) is procedural `THREE.js` geometry — follow that convention rather than sourcing/loading new model files. Sound is also fully procedural: `src/audio/AudioEngine.js` synthesizes every effect with raw `OscillatorNode`/`GainNode` (no audio files); `src/audio/PlayerAudio.js` is a thin semantic wrapper over it.

### File casing (Windows/Linux mismatch)
This repo is developed on Windows (case-insensitive filesystem) but built on Linux in CI. Git tracks exact casing — a local import like `"../player/Player.js"` will silently work on Windows even if the tracked file is `player.js`, then fail the Linux build with a Rollup "could not resolve" error. If you rename or create a file, make sure the on-disk casing, the git-tracked casing (`git ls-files`), and every import path all agree.

### HUD (`src/hud/HUD.js`)
Plain DOM injected via `innerHTML` + a single `<style>` tag (no framework, no CSS modules), styled as a wrist-"watch" interface. Update methods (`updateVitals`, `showInteractPrompt(visible, label)`, `updateInventory(hasKey, hasSword)`, `updateFlashlightStatus`, `showToxicGasWarning`, `showDeathState`) are called every frame or on state change from `Player`/`Game`; there's no virtual-DOM diffing, each method directly mutates the specific element(s) it owns.

## Deployment

Deploys to GitHub Pages via `.github/workflows/deploy.yml` (build with Vite, publish via `actions/deploy-pages`) on every push to `main`. The GitHub repo's **Settings → Pages → Source must be set to "GitHub Actions"** (one-time manual step, not something the workflow file can set). Live at `https://rishavmz.github.io/mushoku_no_musoka/`.
