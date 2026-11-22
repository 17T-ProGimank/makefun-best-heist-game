// Midnight Vault — guard patrols, vision cones and the fair caught moment.
// One job: everything a guard does — walk waypoints, look, chase, grab.

import {
  GUARD_CHASE_SPEED,
  GUARD_CONE_HALF_ANGLE,
  GUARD_CONE_RANGE,
  GUARD_RADIUS,
} from './config.js';

export function createGuard(def, index) {
  const first = def.waypoints[0];
  return {
    kind: 'guard',
    index,
    x: first.x,
    y: first.y,
    waypoints: def.waypoints,
    waypointIndex: 1 % def.waypoints.length,
    speed: def.speed,
    angle: Math.atan2(
      def.waypoints[1 % def.waypoints.length].y - first.y,
      def.waypoints[1 % def.waypoints.length].x - first.x,
    ),
    state: 'patrol', // patrol | investigate | chase | stunned
    stateTimer: 0,
    investigateTarget: null,
    alerted: false,
  };
}

// Is the point inside any wall/cover rectangle? Used for line-of-sight sampling.
export function pointBlocked(x, y, solids) {
  for (const s of solids) {
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return true;
  }
  return false;
}

// Straight-line sight between two points, blocked by walls and cover.
export function hasLineOfSight(ax, ay, bx, by, solids) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 12));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (pointBlocked(ax + dx * t, ay + dy * t, solids)) return false;
  }
  return true;
}

// Is the thief inside this guard's vision cone with a clear line of sight?
export function guardSeesThief(guard, thief, solids) {
  const dx = thief.x - guard.x;
  const dy = thief.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > GUARD_CONE_RANGE) return false;
  let delta = Math.atan2(dy, dx) - guard.angle;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  if (Math.abs(delta) > GUARD_CONE_HALF_ANGLE) return false;
  return hasLineOfSight(guard.x, guard.y, thief.x, thief.y, solids);
}

function moveTowards(guard, tx, ty, speed, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const step = Math.min(dist, speed * dt);
  guard.x += (dx / dist) * step;
  guard.y += (dy / dist) * step;
  guard.angle = Math.atan2(dy, dx);
  return dist - step < 2;
}

// Advance one guard a frame. Returns 'grab' when it catches the thief.
export function updateGuard(guard, dt, solids, thief, noise) {
  if (guard.stateTimer > 0) guard.stateTimer -= dt;

  if (guard.state === 'stunned') {
    if (guard.stateTimer <= 0) guard.state = 'patrol';
    return null;
  }

  // A noise-maker pulls every guard that hears it.
  if (noise && guard.state !== 'chase') {
    const d = Math.hypot(noise.x - guard.x, noise.y - guard.y);
    if (d < 280) {
      guard.state = 'investigate';
      guard.investigateTarget = { x: noise.x, y: noise.y };
      guard.stateTimer = 4;
    }
  }

  if (guard.state === 'chase') {
    moveTowards(guard, thief.x, thief.y, GUARD_CHASE_SPEED, dt);
    if (Math.hypot(thief.x - guard.x, thief.y - guard.y) < GUARD_RADIUS + 14) return 'grab';
    if (guard.stateTimer <= 0) guard.state = 'patrol';
    return null;
  }

  if (guard.state === 'investigate' && guard.investigateTarget) {
    const arrived = moveTowards(
      guard,
      guard.investigateTarget.x,
      guard.investigateTarget.y,
      guard.speed * 1.25,
      dt,
    );
    if (arrived || guard.stateTimer <= 0) {
      guard.state = 'patrol';
      guard.investigateTarget = null;
    }
    return null;
  }

  // Patrol: walk the waypoint loop, pausing briefly at each corner to look around.
  const target = guard.waypoints[guard.waypointIndex];
  const arrived = moveTowards(guard, target.x, target.y, guard.speed, dt);
  if (arrived) {
    guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    guard.stateTimer = 0.6; // look-around pause at the corner
  }
  return null;
}

// A guard that spots the thief switches to chase for a few seconds.
export function alertGuard(guard, seconds) {
  guard.state = 'chase';
  guard.stateTimer = seconds;
  guard.alerted = true;
}
