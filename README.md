[![make.fun bounty](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/17T-ProGimank/makefun-best-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/17T-ProGimank/makefun-best-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

# Midnight Vault — a three-floor heist

A top-down 2D stealth heist game for the [make.fun best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559). You are the thief breaking into the Meridian Bank after midnight: cross the lobby, lift the gallery pieces, crack the vault for the Meridian Diamond, and reach the getaway door — while guards sweep their vision cones, cameras pan the halls, and the alarm meter climbs every second you are seen.

## How to play

Serve the game and open it in a desktop browser:

```
node serve.ts
```

Then open http://localhost:8080. No build step, no network requests — every file the game loads lives under `game/`.

- **WASD / arrow keys** — move the thief
- **Mouse click** — throw a noise-maker at that spot (lures nearby guards)
- **Q** — noise-maker (3 uses)
- **E** — EMP burst, kills all cameras for 8 seconds (2 uses)
- **R** — smoke pellet, unseen for 5 seconds (2 uses)
- **Enter** — start / continue

Grab loot by walking over it. Stand by the vault on floor 3 to crack it (2.5 s), then reach the green getaway door. If the alarm hits 100%, you are busted. A guard that grabs you knocks you back to the floor entrance and spikes the alarm — a fair caught moment, not an instant loss.

## The job

- **Floor 1 — The Lobby:** cross the reception hall, two patrolling guards, two cameras, three routes around the central block.
- **Floor 2 — The Gallery:** three parallel halls, three guards, three cameras, six pieces to lift.
- **Floor 3 — The Vault:** the diamond sits behind an antechamber wall with two doors, three guards and four cameras. Crack it and run.

## Structure

- `game/index.html` — the page, one canvas
- `game/src/config.js` — tuning numbers, colours, tools
- `game/src/levels.js` — the three floor layouts
- `game/src/guards.js` — patrols, vision cones, line of sight, chase and grab
- `game/src/cameras.js` — sweeping cameras and the EMP
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — WebAudio bleeps, no audio files
- `game/src/render.js` — all canvas drawing: room, cones, HUD, screens
- `game/src/shots.js` — deterministic `?shot=` staging for screenshots
- `game/src/main.js` — state machine, rules, win/lose
- `main.ts` — the make.fun hand-in program (Node 22, stdlib only)

## Screenshots

`?shot=cover`, `?shot=patrol`, `?shot=alert` and `?shot=getaway` put the game into fixed, good-looking states; the four JPEGs in `screenshots/` are real renders of the game's own code.

## Referral

Built for make.fun — sign up through my referral link: https://make.fun/r/m4psg5rh (code `m4psg5rh`).
