// Midnight Vault — all canvas drawing: the room, the cones, the HUD, the screens.
// One job: take the game state and paint it. No game logic lives here.

import {
  ALARM_MAX,
  CAMERA_CONE_HALF_ANGLE,
  CAMERA_CONE_RANGE,
  COLORS,
  GUARD_CONE_HALF_ANGLE,
  GUARD_CONE_RANGE,
  HUD_H,
  TOOLS,
  WORLD_H,
  WORLD_W,
  alarmColor,
} from './config.js';

function drawCone(ctx, x, y, angle, range, halfAngle, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawLabel(ctx, text, x, y, size, color, align = 'center') {
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawRoom(ctx, floor) {
  // Floor tiles.
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.fillStyle = COLORS.floorAlt;
  const tile = 64;
  for (let y = 0; y < WORLD_H; y += tile) {
    for (let x = 0; x < WORLD_W; x += tile) {
      if (((x / tile) + (y / tile)) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
  // Carpet runner down the middle of each floor.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(0, WORLD_H / 2 - 90, WORLD_W, 180);

  // Walls with a gold edge so the room reads at a glance.
  for (const w of floor.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = COLORS.wallEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
  }

  // Cover: desks, crates and plants the thief hides behind.
  for (const c of floor.cover) {
    if (c.kind === 'plant') {
      ctx.fillStyle = COLORS.plant;
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = COLORS.cover;
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = COLORS.coverEdge;
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
      if (c.kind === 'crates') {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + c.w, c.y + c.h);
        ctx.moveTo(c.x + c.w, c.y);
        ctx.lineTo(c.x, c.y + c.h);
        ctx.stroke();
      } else {
        drawLabel(ctx, 'DESK', c.x + c.w / 2, c.y + c.h / 2, 11, '#d6c08a');
      }
    }
  }

  // Exit zone.
  const e = floor.exit;
  ctx.fillStyle = COLORS.exit;
  ctx.globalAlpha = 0.28;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = COLORS.exit;
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  drawLabel(ctx, e.label, e.x + e.w / 2, e.y + e.h / 2, 13, '#bbf7d0');

  // The vault (floor 3): a big gold door behind the antechamber wall.
  if (floor.vault) {
    const v = floor.vault;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(v.x - 70, 18, 140, 110);
    ctx.fillStyle = COLORS.vault;
    ctx.fillRect(v.x - 58, 30, 116, 86);
    ctx.strokeStyle = '#fff7cc';
    ctx.lineWidth = 3;
    ctx.strokeRect(v.x - 58, 30, 116, 86);
    ctx.beginPath();
    ctx.arc(v.x, 73, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#92400e';
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawLabel(ctx, 'VAULT', v.x, 132, 13, '#fde68a');
    drawLabel(ctx, v.label, v.x, 152, 10, '#fcd34d');
  }
}

function drawLoot(ctx, loot) {
  for (const item of loot) {
    if (item.taken) continue;
    const bob = Math.sin(item.bobPhase) * 2;
    ctx.save();
    ctx.translate(item.x, item.y + bob);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = COLORS.loot;
    ctx.fillRect(-9, -9, 18, 18);
    ctx.strokeStyle = COLORS.lootEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(-9, -9, 18, 18);
    ctx.restore();
    drawLabel(ctx, `$${item.value.toLocaleString('en-US')}`, item.x, item.y + 24, 11, '#fde68a');
  }
}

function drawCameras(ctx, cameras, time) {
  for (const cam of cameras) {
    const disabled = cam.disabledTimer > 0;
    if (!disabled) {
      drawCone(ctx, cam.x, cam.y, cam.angle, CAMERA_CONE_RANGE, CAMERA_CONE_HALF_ANGLE, COLORS.coneCamera);
    }
    ctx.fillStyle = disabled ? '#475569' : COLORS.camera;
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Lens direction tick.
    ctx.strokeStyle = disabled ? '#64748b' : '#fef08a';
    ctx.beginPath();
    ctx.moveTo(cam.x, cam.y);
    ctx.lineTo(cam.x + Math.cos(cam.angle) * 16, cam.y + Math.sin(cam.angle) * 16);
    ctx.stroke();
    if (disabled) drawLabel(ctx, 'OFF', cam.x, cam.y - 20, 10, '#94a3b8');
  }
}

function drawGuards(ctx, guards, time) {
  for (const guard of guards) {
    const chasing = guard.state === 'chase';
    drawCone(
      ctx, guard.x, guard.y, guard.angle, GUARD_CONE_RANGE, GUARD_CONE_HALF_ANGLE,
      chasing ? 'rgba(225, 29, 72, 0.34)' : COLORS.coneGuard,
    );
    // Body: dark uniform, red cap, facing tick.
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.guard;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fecdd3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.angle) * 20, guard.y + Math.sin(guard.angle) * 20);
    ctx.stroke();
    if (guard.state === 'investigate') drawLabel(ctx, '?', guard.x, guard.y - 26, 16, '#fde68a');
    if (chasing) drawLabel(ctx, '!', guard.x, guard.y - 26, 18, '#fca5a5');
    if (guard.state === 'stunned') drawLabel(ctx, 'z z', guard.x, guard.y - 26, 12, '#94a3b8');
  }
}

function drawThief(ctx, thief, time) {
  // Smoke cloud hides the thief while the pellet lasts.
  if (thief.smokeTimer > 0) {
    ctx.fillStyle = 'rgba(196, 181, 253, 0.35)';
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.thiefEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  // Facing tick + a little mask line so the thief reads as a person.
  ctx.strokeStyle = '#ccfbf1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(thief.x, thief.y);
  ctx.lineTo(thief.x + Math.cos(thief.angle) * 19, thief.y + Math.sin(thief.angle) * 19);
  ctx.stroke();
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(thief.x - 8, thief.y - 3, 16, 6);
  drawLabel(ctx, 'YOU', thief.x, thief.y - 26, 11, '#99f6e4');
}

function drawNoise(ctx, noise) {
  if (!noise) return;
  ctx.strokeStyle = TOOLS.noise.color;
  ctx.lineWidth = 2;
  for (const r of [10, 18, 26]) {
    ctx.beginPath();
    ctx.arc(noise.x, noise.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawLabel(ctx, '♪', noise.x, noise.y - 30, 16, TOOLS.noise.color);
}

export function drawWorld(ctx, game) {
  ctx.save();
  ctx.translate(0, HUD_H);
  drawRoom(ctx, game.floor);
  drawLoot(ctx, game.loot);
  drawCameras(ctx, game.cameras, game.time);
  drawGuards(ctx, game.guards, game.time);
  drawNoise(ctx, game.noise);
  drawThief(ctx, game.thief, game.time);
  // Vault crack progress ring.
  if (game.vaultProgress > 0 && game.vaultProgress < 1) {
    const v = game.floor.vault;
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(v.x, 73, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * game.vaultProgress);
    ctx.stroke();
    drawLabel(ctx, 'CRACKING…', v.x, 185, 12, '#fde68a');
  }
  // Floor banner + objective, inside the world so screenshots carry it.
  ctx.fillStyle = 'rgba(11, 15, 28, 0.82)';
  ctx.fillRect(18, 8, 560, 30);
  drawLabel(ctx, game.floor.name, 30, 23, 15, '#fde68a', 'left');
  ctx.fillStyle = 'rgba(11, 15, 28, 0.72)';
  ctx.fillRect(18, 42, 660, 24);
  drawLabel(ctx, game.floor.objective, 30, 54, 12, COLORS.hudText, 'left');
  ctx.restore();
}

export function drawHUD(ctx, game) {
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, 1280, HUD_H);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H);
  ctx.lineTo(1280, HUD_H);
  ctx.stroke();

  drawLabel(ctx, 'MIDNIGHT VAULT', 20, 26, 22, '#fbbf24', 'left');
  drawLabel(ctx, 'WASD move · Q/E/R tools · click: throw noise', 20, 52, 12, COLORS.hudDim, 'left');

  // Alarm meter.
  const ax = 430;
  const ay = 22;
  const aw = 300;
  const ah = 22;
  drawLabel(ctx, 'ALARM', ax, ay - 8, 11, COLORS.hudDim, 'left');
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(ax, ay, aw, ah);
  ctx.fillStyle = alarmColor(game.alarm);
  ctx.fillRect(ax, ay, (aw * game.alarm) / ALARM_MAX, ah);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.strokeRect(ax, ay, aw, ah);
  drawLabel(ctx, `${Math.round(game.alarm)}%`, ax + aw + 12, ay + ah / 2, 14, alarmColor(game.alarm), 'left');
  const alarmWord = game.alarm < 40 ? 'QUIET' : game.alarm < 70 ? 'SUSPICIOUS' : 'HUNTED';
  drawLabel(ctx, alarmWord, ax, ay + ah + 16, 11, alarmColor(game.alarm), 'left');

  // Loot.
  drawLabel(ctx, 'LOOT', 830, 14, 11, COLORS.hudDim, 'left');
  drawLabel(ctx, `$${game.lootTotal.toLocaleString('en-US')}`, 830, 40, 24, '#fbbf24', 'left');
  drawLabel(ctx, `floor ${game.floorIndex + 1} / 3`, 830, 64, 12, COLORS.hudDim, 'left');

  // Tools, one row each.
  const toolRows = Object.entries(TOOLS);
  toolRows.forEach(([id, tool], i) => {
    const y = 16 + i * 24;
    const left = game.tools[id];
    ctx.fillStyle = left > 0 ? tool.color : '#334155';
    ctx.fillRect(1010, y, 22, 20);
    drawLabel(ctx, tool.key.toUpperCase(), 1021, y + 10, 12, '#0b0f1c');
    drawLabel(ctx, `${tool.label} ×${left}`, 1038, y + 10, 12, left > 0 ? COLORS.hudText : '#475569', 'left');
  });

  // Timer.
  const mins = Math.floor(game.elapsed / 60);
  const secs = Math.floor(game.elapsed % 60).toString().padStart(2, '0');
  drawLabel(ctx, `${mins}:${secs}`, 1250, 26, 16, COLORS.hudText, 'right');
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5, 8, 16, 0.78)';
  ctx.fillRect(0, 0, 1280, 800);
  drawLabel(ctx, title, 640, 300, 44, accent);
  lines.forEach((line, i) => {
    drawLabel(ctx, line, 640, 360 + i * 30, 17, COLORS.hudText);
  });
}

export function drawTitle(ctx) {
  drawOverlay(ctx, 'MIDNIGHT VAULT', [
    'Three floors. One diamond. No alarms if you play it right.',
    '',
    'WASD / arrows — move      Mouse click — throw a noise-maker',
    'Q — noise-maker (lures guards)    E — EMP (kills cameras 8s)',
    'R — smoke pellet (unseen 5s)      Grab the loot, crack the vault,',
    'reach the getaway door on floor 3.',
    '',
    'Press ENTER or click to start the heist.',
  ], '#fbbf24');
}

export function drawFloorClear(ctx, game) {
  drawOverlay(ctx, `FLOOR ${game.floorIndex + 1} CLEAR`, [
    `Loot so far: $${game.lootTotal.toLocaleString('en-US')}`,
    'The stairs are open. Press ENTER for the next floor.',
  ], '#22c55e');
}

export function drawWin(ctx, game) {
  drawOverlay(ctx, 'GETAWAY CLEAN', [
    `You cracked the vault and vanished into the night.`,
    `Total loot: $${game.lootTotal.toLocaleString('en-US')}   Time: ${Math.floor(game.elapsed / 60)}:${Math.floor(game.elapsed % 60).toString().padStart(2, '0')}`,
    '',
    'Press ENTER to run it again.',
  ], '#22c55e');
}

export function drawBusted(ctx, game) {
  drawOverlay(ctx, 'BUSTED', [
    'The alarm hit 100%. Meridian security has the building surrounded.',
    `Loot kept: $${game.lootTotal.toLocaleString('en-US')}`,
    '',
    'Press ENTER to try the job again.',
  ], '#ef4444');
}
