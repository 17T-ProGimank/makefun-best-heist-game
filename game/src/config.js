// Midnight Vault — shared tuning numbers, colours and tool definitions.
// One job: every magic number the rest of the game agrees on lives here.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;
export const HUD_H = 84;
export const WORLD_W = 1280;
export const WORLD_H = CANVAS_H - HUD_H;

export const THIEF_RADIUS = 14;
export const THIEF_SPEED = 235;
export const GUARD_RADIUS = 15;
export const GUARD_SPEED = 95;
export const GUARD_CHASE_SPEED = 165;
export const GUARD_CONE_RANGE = 185;
export const GUARD_CONE_HALF_ANGLE = 0.56; // radians, ~32 degrees
export const CAMERA_CONE_RANGE = 215;
export const CAMERA_CONE_HALF_ANGLE = 0.44; // ~25 degrees

export const ALARM_MAX = 100;
export const ALARM_GUARD_RATE = 34; // per second while a guard sees the thief
export const ALARM_CAMERA_RATE = 20; // per second while a camera sees the thief
export const ALARM_DECAY_RATE = 7; // per second while nobody sees the thief
export const ALARM_GRAB_HIT = 38; // alarm jump when a guard grabs the thief
export const VAULT_CRACK_SECONDS = 2.5;

export const TOOLS = {
  noise: { key: 'q', label: 'Noise-maker', uses: 3, color: '#ffd166' },
  emp: { key: 'e', label: 'EMP burst', uses: 2, color: '#7dd3fc' },
  smoke: { key: 'r', label: 'Smoke pellet', uses: 2, color: '#c4b5fd' },
};

export const COLORS = {
  floor: '#1b2233',
  floorAlt: '#202839',
  carpet: '#232c42',
  wall: '#0d1220',
  wallEdge: '#c9a227',
  cover: '#3a2f22',
  coverEdge: '#8a6d3b',
  plant: '#1f4d2e',
  thief: '#2dd4bf',
  thiefEdge: '#0f766e',
  guard: '#e11d48',
  guardEdge: '#7f1d2d',
  coneGuard: 'rgba(225, 29, 72, 0.20)',
  coneCamera: 'rgba(250, 204, 21, 0.16)',
  camera: '#facc15',
  loot: '#fbbf24',
  lootEdge: '#92400e',
  vault: '#f59e0b',
  exit: '#22c55e',
  exitEdge: '#14532d',
  alarmLow: '#22c55e',
  alarmMid: '#f59e0b',
  alarmHigh: '#ef4444',
  hudBg: '#0b0f1c',
  hudText: '#e2e8f0',
  hudDim: '#94a3b8',
};

export function alarmColor(value) {
  if (value < 40) return COLORS.alarmLow;
  if (value < 70) return COLORS.alarmMid;
  return COLORS.alarmHigh;
}

// Deterministic RNG so screenshot staging and patrols are reproducible.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
