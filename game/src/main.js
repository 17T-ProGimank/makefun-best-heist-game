// Midnight Vault — the game itself: state, loop, rules and the win/lose.
// One job: own the state machine and call the other modules. Bootstraps on import.

import {
  ALARM_CAMERA_RATE,
  ALARM_DECAY_RATE,
  ALARM_GRAB_HIT,
  ALARM_GUARD_RATE,
  ALARM_MAX,
  CANVAS_H,
  CANVAS_W,
  GUARD_RADIUS,
  HUD_H,
  THIEF_RADIUS,
  THIEF_SPEED,
  TOOLS,
  VAULT_CRACK_SECONDS,
  mulberry32,
} from './config.js';
import { FLOORS } from './levels.js';
import {
  alertGuard,
  createGuard,
  guardSeesThief,
  updateGuard,
} from './guards.js';
import { cameraSeesThief, createCamera, disableAllCameras, updateCamera } from './cameras.js';
import { AudioEngine } from './audio.js';
import { createInput, endFrame, moveVector, wasPressed } from './input.js';
import {
  drawBusted,
  drawFloorClear,
  drawHUD,
  drawTitle,
  drawWin,
  drawWorld,
} from './render.js';
import { applyShot } from './shots.js';

class MidnightVault {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    this.input = createInput(canvas);
    this.audio = new AudioEngine();
    this.rng = mulberry32(20261122);
    this.state = 'title'; // title | play | floorclear | win | busted
    this.time = 0;
    this.elapsed = 0;
    this.floorIndex = 0;
    this.alarm = 0;
    this.lootTotal = 0;
    this.tools = { noise: TOOLS.noise.uses, emp: TOOLS.emp.uses, smoke: TOOLS.smoke.uses };
    this.noise = null;
    this.noiseTimer = 0;
    this.vaultProgress = 0;
    this.vaultTaken = false;
    this.stunTimer = 0;
    this.loadFloor(0);
    this.thief = {
      x: this.floor.start.x,
      y: this.floor.start.y,
      angle: -Math.PI / 2,
      smokeTimer: 0,
    };
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  loadFloor(index) {
    this.floorIndex = index;
    this.floor = FLOORS[index];
    this.guards = this.floor.guards.map((def, i) => createGuard(def, i));
    this.cameras = this.floor.cameras.map((def, i) => createCamera(def, i));
    this.loot = this.floor.loot.map((item) => ({ ...item, taken: false, bobPhase: this.rng() * Math.PI * 2 }));
    this.vaultProgress = 0;
    this.vaultTaken = false;
    this.noise = null;
    this.thief = {
      x: this.floor.start.x,
      y: this.floor.start.y,
      angle: -Math.PI / 2,
      smokeTimer: 0,
    };
  }

  solids() {
    return [...this.floor.walls, ...this.floor.cover];
  }

  // Circle vs rectangle push-out so the thief slides along walls.
  collideCircle(pos, radius) {
    for (const s of this.solids()) {
      const cx = Math.max(s.x, Math.min(pos.x, s.x + s.w));
      const cy = Math.max(s.y, Math.min(pos.y, s.y + s.h));
      const dx = pos.x - cx;
      const dy = pos.y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < radius * radius) {
        if (d2 === 0) {
          pos.y = s.y - radius;
        } else {
          const d = Math.sqrt(d2);
          pos.x = cx + (dx / d) * radius;
          pos.y = cy + (dy / d) * radius;
        }
      }
    }
    pos.x = Math.max(THIEF_RADIUS, Math.min(1280 - THIEF_RADIUS, pos.x));
    pos.y = Math.max(THIEF_RADIUS, Math.min(716 - THIEF_RADIUS, pos.y));
  }

  throwNoise(worldX, worldY) {
    if (this.tools.noise <= 0) return;
    this.tools.noise -= 1;
    this.noise = { x: worldX, y: worldY };
    this.noiseTimer = 2.5;
    this.audio.tool();
  }

  useEmp() {
    if (this.tools.emp <= 0) return;
    this.tools.emp -= 1;
    disableAllCameras(this.cameras, 8);
    this.audio.tool();
  }

  useSmoke() {
    if (this.tools.smoke <= 0) return;
    this.tools.smoke -= 1;
    this.thief.smokeTimer = 5;
    this.audio.tool();
  }

  update(dt) {
    this.time += dt;
    this.elapsed += dt;
    if (this.stunTimer > 0) this.stunTimer -= dt;
    if (this.thief.smokeTimer > 0) this.thief.smokeTimer -= dt;
    if (this.noiseTimer > 0) {
      this.noiseTimer -= dt;
      if (this.noiseTimer <= 0) this.noise = null;
    }

    // Movement.
    const input = this.input;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = rect.width / CANVAS_W;
    const scaleY = rect.height / CANVAS_H;
    input.mouseWorldX = input.mouseX / scaleX;
    input.mouseWorldY = input.mouseY / scaleY - HUD_H;
    if (this.stunTimer <= 0) {
      const mv = moveVector(input);
      if (mv.x !== 0 || mv.y !== 0) {
        this.thief.angle = Math.atan2(mv.y, mv.x);
        this.thief.x += mv.x * THIEF_SPEED * dt;
        this.thief.y += mv.y * THIEF_SPEED * dt;
        this.collideCircle(this.thief, THIEF_RADIUS);
      }
    }

    // Tools.
    if (wasPressed(input, 'q') || input.clicked) {
      this.throwNoise(input.mouseWorldX, input.mouseWorldY);
    }
    if (wasPressed(input, 'e')) this.useEmp();
    if (wasPressed(input, 'r')) this.useSmoke();

    // Cameras sweep.
    for (const cam of this.cameras) updateCamera(cam, this.time);

    // Detection: guards and cameras raise the alarm; unseen, it decays.
    const solids = this.solids();
    const hidden = this.thief.smokeTimer > 0;
    let seenByGuard = false;
    let seenByCamera = false;
    if (!hidden) {
      for (const guard of this.guards) {
        if (guardSeesThief(guard, this.thief, solids)) {
          seenByGuard = true;
          alertGuard(guard, 3);
        }
      }
      for (const cam of this.cameras) {
        if (cameraSeesThief(cam, this.thief, solids)) seenByCamera = true;
      }
    }
    if (seenByGuard) this.alarm += ALARM_GUARD_RATE * dt;
    else if (seenByCamera) this.alarm += ALARM_CAMERA_RATE * dt;
    else this.alarm -= ALARM_DECAY_RATE * dt;
    this.alarm = Math.max(0, Math.min(ALARM_MAX, this.alarm));
    if (seenByGuard && this.alarm > 55 && this.alarm < 58) this.audio.alarmSting();

    // Guards patrol, investigate noise, chase, and grab.
    for (const guard of this.guards) {
      const result = updateGuard(guard, dt, solids, this.thief, this.noise);
      if (result === 'grab') {
        this.alarm = Math.min(ALARM_MAX, this.alarm + ALARM_GRAB_HIT);
        this.stunTimer = 0.9;
        // Knocked back toward the floor start: a fair caught moment, not instant death.
        this.thief.x = this.floor.start.x;
        this.thief.y = this.floor.start.y;
        this.audio.grab();
      }
    }

    // Loot pickup on touch.
    for (const item of this.loot) {
      if (item.taken) continue;
      item.bobPhase += dt * 3;
      if (Math.hypot(item.x - this.thief.x, item.y - this.thief.y) < THIEF_RADIUS + 16) {
        item.taken = true;
        this.lootTotal += item.value;
        this.audio.pickup();
      }
    }

    // Vault: stand close and it cracks after VAULT_CRACK_SECONDS.
    const vault = this.floor.vault;
    if (vault && !this.vaultTaken) {
      const near = Math.hypot(vault.x - this.thief.x, vault.y - this.thief.y) < 120;
      if (near) {
        this.vaultProgress += dt / VAULT_CRACK_SECONDS;
        if (this.vaultProgress >= 1) {
          this.vaultTaken = true;
          this.lootTotal += vault.value;
          this.audio.vaultCrack();
        }
      } else {
        this.vaultProgress = Math.max(0, this.vaultProgress - dt / VAULT_CRACK_SECONDS);
      }
    }

    // Exit: floors 1-2 open the stairs; floor 3 needs the vault first.
    const e = this.floor.exit;
    const inExit =
      this.thief.x >= e.x && this.thief.x <= e.x + e.w &&
      this.thief.y >= e.y && this.thief.y <= e.y + e.h;
    if (inExit) {
      if (this.floorIndex < 2) {
        this.state = 'floorclear';
        this.audio.floorClear();
      } else if (this.vaultTaken) {
        this.state = 'win';
        this.audio.winJingle();
      }
    }

    if (this.alarm >= ALARM_MAX) {
      this.state = 'busted';
      this.audio.alarmSting();
    }
  }

  frame(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const input = this.input;

    if (this.state === 'title') {
      if (wasPressed(input, 'enter') || input.clicked) {
        this.audio.ensure();
        this.state = 'play';
      }
      drawWorld(this.ctx, this);
      drawHUD(this.ctx, this);
      drawTitle(this.ctx);
    } else if (this.state === 'play') {
      this.audio.ensure();
      if (!this.frozen) this.update(dt);
      drawWorld(this.ctx, this);
      drawHUD(this.ctx, this);
    } else if (this.state === 'floorclear') {
      if (wasPressed(input, 'enter')) {
        this.loadFloor(this.floorIndex + 1);
        this.state = 'play';
      }
      drawWorld(this.ctx, this);
      drawHUD(this.ctx, this);
      drawFloorClear(this.ctx, this);
    } else if (this.state === 'win') {
      if (wasPressed(input, 'enter')) this.restart();
      drawWorld(this.ctx, this);
      drawHUD(this.ctx, this);
      drawWin(this.ctx, this);
    } else if (this.state === 'busted') {
      if (wasPressed(input, 'enter')) this.restart();
      drawWorld(this.ctx, this);
      drawHUD(this.ctx, this);
      drawBusted(this.ctx, this);
    }

    endFrame(input);
    requestAnimationFrame((t) => this.frame(t));
  }

  restart() {
    this.alarm = 0;
    this.lootTotal = 0;
    this.elapsed = 0;
    this.tools = { noise: TOOLS.noise.uses, emp: TOOLS.emp.uses, smoke: TOOLS.smoke.uses };
    this.loadFloor(0);
    this.state = 'play';
  }
}

export function bootGame() {
  const canvas = document.getElementById('game');
  const game = new MidnightVault(canvas);
  // Debug handle for automated play-testing; harmless in normal play.
  window.__midnightVault = game;
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    applyShot(game, shot);
    game.frozen = true; // staged shot: render the fixed frame, never simulate
  }
  return game;
}

bootGame();
