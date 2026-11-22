// Midnight Vault — deterministic screenshot staging.
// One job: ?shot=cover|patrol|alert|getaway puts the game into a fixed,
// good-looking state so the screenshots are real renders of the game code.

export function applyShot(game, shot) {
  // Every shot starts from a fresh floor load, then overrides positions.
  if (shot === 'cover') {
    game.loadFloor(0);
    game.state = 'play';
    game.thief.x = 600;
    game.thief.y = 440;
    game.thief.angle = -Math.PI / 2;
    game.alarm = 12;
    game.lootTotal = 1200;
    game.loot[0].taken = true;
    game.loot[3].taken = true;
    // Guards mid-patrol, cones sweeping across the room.
    game.guards[0].x = 700;
    game.guards[0].y = 300;
    game.guards[0].angle = Math.PI / 2;
    game.guards[1].x = 950;
    game.guards[1].y = 520;
    game.guards[1].angle = Math.PI;
    game.cameras[0].angle = Math.PI / 2 + 0.5;
    game.cameras[1].angle = Math.PI - 0.4;
    game.elapsed = 47;
  } else if (shot === 'patrol') {
    game.loadFloor(1);
    game.state = 'play';
    game.thief.x = 300;
    game.thief.y = 480;
    game.thief.angle = 0;
    game.alarm = 28;
    game.lootTotal = 3400;
    game.loot[0].taken = true;
    game.loot[3].taken = true;
    game.guards[0].x = 300;
    game.guards[0].y = 300;
    game.guards[0].angle = Math.PI / 2;
    game.guards[1].x = 640;
    game.guards[1].y = 420;
    game.guards[1].angle = -Math.PI / 2;
    game.guards[2].x = 1000;
    game.guards[2].y = 300;
    game.guards[2].angle = Math.PI / 2;
    game.cameras[0].angle = 0.4;
    game.cameras[1].angle = Math.PI / 2 - 0.6;
    game.cameras[2].angle = Math.PI + 0.3;
    game.elapsed = 132;
  } else if (shot === 'alert') {
    game.loadFloor(2);
    game.state = 'play';
    game.thief.x = 640;
    game.thief.y = 420;
    game.thief.angle = -Math.PI / 2;
    game.alarm = 72;
    game.lootTotal = 12400;
    game.loot[0].taken = true;
    game.loot[1].taken = true;
    game.vaultProgress = 0.6;
    // A guard is closing in and the cameras are all on the thief.
    game.guards[0].x = 700;
    game.guards[0].y = 480;
    game.guards[0].angle = Math.atan2(420 - 480, 640 - 700);
    game.guards[0].state = 'chase';
    game.guards[0].stateTimer = 3;
    game.guards[1].x = 420;
    game.guards[1].y = 420;
    game.guards[1].angle = 0;
    game.guards[2].x = 1000;
    game.guards[2].y = 560;
    game.guards[2].angle = -Math.PI / 2;
    for (const cam of game.cameras) cam.angle = Math.atan2(420 - cam.y, 640 - cam.x);
    game.elapsed = 268;
  } else if (shot === 'getaway') {
    game.loadFloor(2);
    game.state = 'play';
    game.thief.x = 640;
    game.thief.y = 600;
    game.thief.angle = Math.PI / 2;
    game.alarm = 45;
    game.lootTotal = 58400;
    for (const item of game.loot) item.taken = true;
    game.vaultTaken = true;
    game.vaultProgress = 1;
    game.tools.noise = 1;
    game.tools.emp = 0;
    game.tools.smoke = 1;
    game.guards[0].x = 340;
    game.guards[0].y = 480;
    game.guards[0].angle = Math.PI / 2;
    game.guards[1].x = 940;
    game.guards[1].y = 480;
    game.guards[1].angle = Math.PI / 2;
    game.guards[2].x = 1100;
    game.guards[2].y = 380;
    game.guards[2].angle = Math.PI;
    game.cameras[0].angle = Math.PI / 2 + 0.4;
    game.cameras[1].angle = Math.PI / 2 - 0.4;
    game.elapsed = 341;
  }
}
