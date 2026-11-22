// Midnight Vault — wall-mounted security cameras.
// One job: sweep a vision cone back and forth and say when the thief is in it.

import {
  CAMERA_CONE_HALF_ANGLE,
  CAMERA_CONE_RANGE,
} from './config.js';
import { hasLineOfSight } from './guards.js';

export function createCamera(def, index) {
  return {
    kind: 'camera',
    index,
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    speed: def.speed,
    phase: index * 1.7, // cameras start out of phase so cones never sync up
    angle: def.baseAngle,
    disabledTimer: 0,
  };
}

export function updateCamera(camera, time) {
  if (camera.disabledTimer > 0) camera.disabledTimer -= 1 / 60;
  camera.angle = camera.baseAngle + Math.sin(time * camera.speed + camera.phase) * camera.sweep;
}

export function cameraSeesThief(camera, thief, solids) {
  if (camera.disabledTimer > 0) return false;
  const dx = thief.x - camera.x;
  const dy = thief.y - camera.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CAMERA_CONE_RANGE) return false;
  let delta = Math.atan2(dy, dx) - camera.angle;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  if (Math.abs(delta) > CAMERA_CONE_HALF_ANGLE) return false;
  return hasLineOfSight(camera.x, camera.y, thief.x, thief.y, solids);
}

// EMP burst: every camera goes dark for `seconds`.
export function disableAllCameras(cameras, seconds) {
  for (const camera of cameras) camera.disabledTimer = seconds;
}
