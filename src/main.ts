import "./style.css";

interface Vec {
  x: number;
  y: number;
}

const canvas = document.querySelector<HTMLCanvasElement>("#game");
const scoreEl = document.querySelector<HTMLSpanElement>("#score");

if (!canvas || !scoreEl) {
  throw new Error("Aegis of the Shardwell: required DOM nodes are missing.");
}

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Aegis of the Shardwell: 2D canvas context unavailable.");
}

const PLAYER_RADIUS = 14;
const SHARD_RADIUS = 9;
const SPEED = 220; // pixels per second

const player: Vec = { x: canvas.width / 2, y: canvas.height / 2 };
let shard: Vec = spawnShard();
let score = 0;
const pressed = new Set<string>();

function spawnShard(): Vec {
  const pad = SHARD_RADIUS + 6;
  return {
    x: pad + Math.random() * (canvas!.width - pad * 2),
    y: pad + Math.random() * (canvas!.height - pad * 2),
  };
}

function isMoveKey(key: string): boolean {
  return [
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "w",
    "a",
    "s",
    "d",
  ].includes(key);
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (isMoveKey(key)) {
    pressed.add(key);
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  pressed.delete(e.key.toLowerCase());
});

function update(dt: number): void {
  let dx = 0;
  let dy = 0;
  if (pressed.has("arrowleft") || pressed.has("a")) dx -= 1;
  if (pressed.has("arrowright") || pressed.has("d")) dx += 1;
  if (pressed.has("arrowup") || pressed.has("w")) dy -= 1;
  if (pressed.has("arrowdown") || pressed.has("s")) dy += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    player.x += (dx / len) * SPEED * dt;
    player.y += (dy / len) * SPEED * dt;
  }

  player.x = Math.max(PLAYER_RADIUS, Math.min(canvas!.width - PLAYER_RADIUS, player.x));
  player.y = Math.max(PLAYER_RADIUS, Math.min(canvas!.height - PLAYER_RADIUS, player.y));

  if (Math.hypot(player.x - shard.x, player.y - shard.y) < PLAYER_RADIUS + SHARD_RADIUS) {
    score += 1;
    scoreEl!.textContent = String(score);
    shard = spawnShard();
  }
}

function draw(): void {
  ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

  // Shard
  ctx!.save();
  ctx!.translate(shard.x, shard.y);
  ctx!.rotate(Math.PI / 4);
  ctx!.fillStyle = "#b78bff";
  ctx!.fillRect(-SHARD_RADIUS, -SHARD_RADIUS, SHARD_RADIUS * 2, SHARD_RADIUS * 2);
  ctx!.restore();

  // Player
  ctx!.beginPath();
  ctx!.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx!.fillStyle = "#7ea8ff";
  ctx!.fill();
}

let last = performance.now();
function loop(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
