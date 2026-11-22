// Midnight Vault — the three floors of the Meridian Bank job.
// One job: pure data. Each floor lists walls, cover, guards, cameras, loot,
// the vault (floor 3 only), the exit and where the thief starts.
// Coordinates are in world space: x 0..1280, y 0..716 (below the HUD).

export const FLOORS = [
  {
    name: 'FLOOR 1 — THE LOBBY',
    objective: 'Cross the lobby. Grab cash on the way, then reach the stairs.',
    start: { x: 90, y: 620 },
    exit: { x: 1150, y: 60, w: 90, h: 70, label: 'STAIRS ↑' },
    walls: [
      { x: 0, y: 0, w: 1280, h: 18 },
      { x: 0, y: 698, w: 1280, h: 18 },
      { x: 0, y: 0, w: 18, h: 716 },
      { x: 1262, y: 0, w: 18, h: 716 },
      // Central reception block with two gaps (left and right routes).
      { x: 480, y: 300, w: 320, h: 26 },
      { x: 480, y: 300, w: 26, h: 150 },
      { x: 774, y: 300, w: 26, h: 150 },
      // Side pillars that break sight lines.
      { x: 250, y: 120, w: 30, h: 130 },
      { x: 1000, y: 420, w: 30, h: 130 },
      { x: 250, y: 470, w: 30, h: 130 },
    ],
    cover: [
      { x: 180, y: 180, w: 120, h: 60, kind: 'desk' },
      { x: 560, y: 480, w: 160, h: 56, kind: 'desk' },
      { x: 880, y: 160, w: 110, h: 70, kind: 'crates' },
      { x: 340, y: 560, w: 90, h: 60, kind: 'plant' },
      { x: 950, y: 540, w: 90, h: 60, kind: 'plant' },
    ],
    guards: [
      { waypoints: [{ x: 350, y: 250 }, { x: 930, y: 250 }, { x: 930, y: 380 }, { x: 350, y: 380 }], speed: 95 },
      { waypoints: [{ x: 700, y: 560 }, { x: 1100, y: 560 }, { x: 1100, y: 120 }, { x: 700, y: 120 }], speed: 88 },
    ],
    cameras: [
      { x: 640, y: 18, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.55 },
      { x: 1262, y: 380, baseAngle: Math.PI, sweep: 0.8, speed: 0.7 },
    ],
    loot: [
      { x: 240, y: 240, value: 400, kind: 'cash' },
      { x: 640, y: 200, value: 600, kind: 'cash' },
      { x: 1030, y: 240, value: 400, kind: 'cash' },
      { x: 640, y: 600, value: 800, kind: 'cash' },
    ],
    vault: null,
  },
  {
    name: 'FLOOR 2 — THE GALLERY',
    objective: 'Lift the gallery pieces. Three routes through the hall — mind the cameras.',
    start: { x: 90, y: 90 },
    exit: { x: 1150, y: 620, w: 90, h: 70, label: 'STAIRS ↑' },
    walls: [
      { x: 0, y: 0, w: 1280, h: 18 },
      { x: 0, y: 698, w: 1280, h: 18 },
      { x: 0, y: 0, w: 18, h: 716 },
      { x: 1262, y: 0, w: 18, h: 716 },
      // Gallery spine: three parallel halls, gaps at both ends and middle.
      { x: 420, y: 0, w: 26, h: 240 },
      { x: 420, y: 330, w: 26, h: 386 },
      { x: 834, y: 0, w: 26, h: 240 },
      { x: 834, y: 330, w: 26, h: 386 },
      { x: 620, y: 330, w: 40, h: 90 },
    ],
    cover: [
      { x: 150, y: 300, w: 140, h: 56, kind: 'desk' },
      { x: 560, y: 120, w: 150, h: 56, kind: 'desk' },
      { x: 980, y: 300, w: 140, h: 56, kind: 'desk' },
      { x: 560, y: 560, w: 150, h: 56, kind: 'crates' },
      { x: 180, y: 560, w: 90, h: 60, kind: 'plant' },
      { x: 1010, y: 560, w: 90, h: 60, kind: 'plant' },
    ],
    guards: [
      { waypoints: [{ x: 220, y: 150 }, { x: 220, y: 560 }, { x: 380, y: 560 }, { x: 380, y: 150 }], speed: 100 },
      { waypoints: [{ x: 640, y: 90 }, { x: 640, y: 640 }, { x: 800, y: 640 }, { x: 800, y: 90 }], speed: 92 },
      { waypoints: [{ x: 1060, y: 150 }, { x: 1060, y: 560 }, { x: 900, y: 560 }, { x: 900, y: 150 }], speed: 100 },
    ],
    cameras: [
      { x: 18, y: 358, baseAngle: 0, sweep: 0.85, speed: 0.6 },
      { x: 640, y: 18, baseAngle: Math.PI / 2, sweep: 1.0, speed: 0.5 },
      { x: 1262, y: 358, baseAngle: Math.PI, sweep: 0.85, speed: 0.65 },
    ],
    loot: [
      { x: 220, y: 240, value: 1200, kind: 'painting' },
      { x: 640, y: 240, value: 1500, kind: 'gem' },
      { x: 1060, y: 240, value: 1200, kind: 'painting' },
      { x: 220, y: 480, value: 900, kind: 'gem' },
      { x: 640, y: 480, value: 900, kind: 'cash' },
      { x: 1060, y: 480, value: 1500, kind: 'painting' },
    ],
    vault: null,
  },
  {
    name: 'FLOOR 3 — THE VAULT',
    objective: 'Crack the vault, grab the Meridian Diamond, and reach the getaway door.',
    start: { x: 640, y: 620 },
    exit: { x: 590, y: 646, w: 100, h: 52, label: 'GETAWAY ↓' },
    walls: [
      { x: 0, y: 0, w: 1280, h: 18 },
      { x: 0, y: 698, w: 1280, h: 18 },
      { x: 0, y: 0, w: 18, h: 716 },
      { x: 1262, y: 0, w: 18, h: 716 },
      // Vault antechamber: the vault sits behind a wall with two doors.
      { x: 380, y: 130, w: 520, h: 26 },
      { x: 380, y: 130, w: 26, h: 220 },
      { x: 874, y: 130, w: 26, h: 220 },
      // Flanking pillars.
      { x: 200, y: 420, w: 30, h: 130 },
      { x: 1050, y: 420, w: 30, h: 130 },
    ],
    cover: [
      { x: 150, y: 180, w: 120, h: 60, kind: 'desk' },
      { x: 1010, y: 180, w: 120, h: 60, kind: 'desk' },
      { x: 480, y: 460, w: 140, h: 56, kind: 'crates' },
      { x: 700, y: 460, w: 140, h: 56, kind: 'crates' },
      { x: 120, y: 520, w: 90, h: 60, kind: 'plant' },
      { x: 1070, y: 520, w: 90, h: 60, kind: 'plant' },
    ],
    guards: [
      { waypoints: [{ x: 300, y: 400 }, { x: 980, y: 400 }, { x: 980, y: 560 }, { x: 300, y: 560 }], speed: 105 },
      { waypoints: [{ x: 640, y: 380 }, { x: 250, y: 380 }, { x: 250, y: 620 }, { x: 640, y: 620 }], speed: 98 },
      { waypoints: [{ x: 1100, y: 300 }, { x: 1100, y: 620 }, { x: 900, y: 620 }, { x: 900, y: 300 }], speed: 102 },
    ],
    cameras: [
      { x: 380, y: 156, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.6 },
      { x: 900, y: 156, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.6 },
      { x: 18, y: 380, baseAngle: 0, sweep: 0.8, speed: 0.7 },
      { x: 1262, y: 380, baseAngle: Math.PI, sweep: 0.8, speed: 0.7 },
    ],
    loot: [
      { x: 200, y: 300, value: 2000, kind: 'gem' },
      { x: 1080, y: 300, value: 2000, kind: 'gem' },
      { x: 320, y: 620, value: 1500, kind: 'cash' },
      { x: 960, y: 620, value: 1500, kind: 'cash' },
    ],
    vault: { x: 640, y: 80, value: 50000, label: 'MERIDIAN DIAMOND' },
  },
];
