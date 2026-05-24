import * as THREE from "three";

const ARENA = 28;
const WALL_H = 5;
const PLAYER_SPEED = 9;
const TURN_SPEED = 2.2;
const BULLET_SPEED = 42;
const FIRE_COOLDOWN = 0.28;
const ENEMY_SPEED = 7;
const MAX_HP = 100;
const DAMAGE = 18;

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };
const canvas = document.getElementById("game");
const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const gameover = document.getElementById("gameover");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const playerHpEl = document.getElementById("player-hp");
const enemyHpEl = document.getElementById("enemy-hp");
const scoreEl = document.getElementById("score");
const messageEl = document.getElementById("message");
const resultTitle = document.getElementById("result-title");
const resultDetail = document.getElementById("result-detail");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1118);
scene.fog = new THREE.Fog(0x0d1118, 18, 55);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 1.65, ARENA * 0.35);

let playing = false;
let playerHp = MAX_HP;
let enemyHp = MAX_HP;
let score = 0;
let fireTimer = 0;
let enemyFireTimer = 1.2;
let gameEnded = false;
let gunRecoil = 0;
let gunBobPhase = 0;
let playerGun;
const gunRest = { x: 0.38, y: -0.32, z: -0.52 };

const player = { yaw: Math.PI, x: 0, z: ARENA * 0.35 };
const enemy = { x: 0, z: -ARENA * 0.35, yaw: 0, patrolT: 0, state: "patrol" };

const bullets = [];
const enemyBullets = [];
const colliders = [];

const crosshair = document.createElement("div");
crosshair.id = "crosshair";
crosshair.className = "hidden";
document.getElementById("overlay").appendChild(crosshair);

function buildPlayerGun() {
  const group = new THREE.Group();

  const metal = new THREE.MeshStandardMaterial({
    color: 0x3d4a5c,
    metalness: 0.85,
    roughness: 0.35,
    fog: false,
  });
  const metalDark = new THREE.MeshStandardMaterial({
    color: 0x252d38,
    metalness: 0.9,
    roughness: 0.4,
    fog: false,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.35,
    metalness: 0.6,
    roughness: 0.3,
    fog: false,
  });
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x1a1410,
    roughness: 0.9,
    metalness: 0.05,
    fog: false,
  });
  const handMat = new THREE.MeshStandardMaterial({
    color: 0xc68642,
    roughness: 0.85,
    metalness: 0.02,
    fog: false,
  });

  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.16), handMat);
  hand.position.set(0, -0.06, 0.06);
  group.add(hand);

  const glove = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.1), gripMat);
  glove.position.set(0, 0.02, 0.1);
  group.add(glove);

  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.1), gripMat);
  grip.position.set(0, -0.02, 0.02);
  grip.rotation.x = 0.2;
  group.add(grip);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.38), metal);
  body.position.set(0, 0.04, -0.08);
  group.add(body);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.42, 10), metalDark);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.05, -0.34);
  group.add(barrel);

  const shroud = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.22), metalDark);
  shroud.position.set(0, 0.05, -0.26);
  group.add(shroud);

  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.08), metalDark);
  mag.position.set(0, -0.08, -0.02);
  mag.rotation.x = 0.15;
  group.add(mag);

  const sight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.06), accent);
  sight.position.set(0, 0.12, -0.1);
  group.add(sight);

  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.04, 10), accent);
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.set(0, 0.05, -0.56);
  group.add(muzzle);

  group.position.set(gunRest.x, gunRest.y, gunRest.z);
  group.rotation.order = "YXZ";
  group.rotation.y = -0.06;
  group.rotation.x = 0.04;
  group.visible = false;

  const gunLight = new THREE.PointLight(0x7dd3fc, 0.4, 2);
  gunLight.position.set(0, 0.05, -0.5);
  group.add(gunLight);

  camera.add(group);
  playerGun = group;
  scene.add(camera);
}

function triggerGunRecoil() {
  gunRecoil = 1;
}

function updatePlayerGun(dt, moving) {
  if (!playerGun) return;

  gunRecoil = Math.max(0, gunRecoil - dt * 5.5);
  const recoilKick = gunRecoil * gunRecoil;

  if (moving) gunBobPhase += dt * 14;
  else gunBobPhase *= 0.85;

  const bobY = moving ? Math.sin(gunBobPhase) * 0.018 : 0;
  const bobX = moving ? Math.cos(gunBobPhase * 0.5) * 0.01 : 0;

  playerGun.position.set(
    gunRest.x + bobX,
    gunRest.y + bobY - recoilKick * 0.04,
    gunRest.z + recoilKick * 0.12
  );
  playerGun.rotation.x = 0.04 + recoilKick * 0.14;
  playerGun.rotation.z = -0.02 - recoilKick * 0.03;
}

function buildArena() {
  const floorGeo = new THREE.PlaneGeometry(ARENA, ARENA);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1a2230,
    roughness: 0.85,
    metalness: 0.15,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(ARENA, 14, 0x2a4a6a, 0x1e3048);
  grid.position.y = 0.02;
  scene.add(grid);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x2d3a4f,
    roughness: 0.7,
    metalness: 0.2,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });

  const half = ARENA / 2;
  const walls = [
    { pos: [0, WALL_H / 2, -half], size: [ARENA, WALL_H, 0.6] },
    { pos: [0, WALL_H / 2, half], size: [ARENA, WALL_H, 0.6] },
    { pos: [-half, WALL_H / 2, 0], size: [0.6, WALL_H, ARENA] },
    { pos: [half, WALL_H / 2, 0], size: [0.6, WALL_H, ARENA] },
  ];

  walls.forEach((w) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...w.size), wallMat);
    mesh.position.set(...w.pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    colliders.push({ minX: w.pos[0] - w.size[0] / 2, maxX: w.pos[0] + w.size[0] / 2, minZ: w.pos[2] - w.size[2] / 2, maxZ: w.pos[2] + w.size[2] / 2 });
  });

  const pillarPositions = [
    [-8, -8], [8, -8], [-8, 8], [8, 8], [0, 0],
  ];
  pillarPositions.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 3.2, 8), accentMat);
    pillar.position.set(px, 1.6, pz);
    pillar.castShadow = true;
    scene.add(pillar);
    colliders.push({ minX: px - 1.05, maxX: px + 1.05, minZ: pz - 1.05, maxZ: pz + 1.05 });
  });

  const amb = new THREE.AmbientLight(0x404870, 0.45);
  scene.add(amb);

  const sun = new THREE.DirectionalLight(0xfff0dd, 1.1);
  sun.position.set(12, 22, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -25;
  sun.shadow.camera.right = 25;
  sun.shadow.camera.top = 25;
  sun.shadow.camera.bottom = -25;
  scene.add(sun);

  const rim = new THREE.PointLight(0x60a5fa, 0.6, 40);
  rim.position.set(0, 8, 0);
  scene.add(rim);
}

let enemyMesh;
let enemyGun;

function buildEnemy() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.45, 1.2, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5, metalness: 0.3 })
  );
  body.position.y = 1.1;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 })
  );
  head.position.y = 2.05;
  head.castShadow = true;
  group.add(head);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.12, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 0.8 })
  );
  visor.position.set(0, 2.05, 0.28);
  group.add(visor);

  enemyGun = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x334155 })
  );
  enemyGun.position.set(0.35, 1.35, 0.45);
  group.add(enemyGun);

  group.position.set(enemy.x, 0, enemy.z);
  scene.add(group);
  enemyMesh = group;
}

function clampInArena(x, z, margin = 1.2) {
  const lim = ARENA / 2 - margin;
  return {
    x: THREE.MathUtils.clamp(x, -lim, lim),
    z: THREE.MathUtils.clamp(z, -lim, lim),
  };
}

function hitsWall(x, z, radius = 0.5) {
  for (const c of colliders) {
    if (x + radius > c.minX && x - radius < c.maxX && z + radius > c.minZ && z - radius < c.maxZ) {
      return true;
    }
  }
  return false;
}

function tryMove(x, z, nx, nz, radius = 0.5) {
  const clamped = clampInArena(nx, nz);
  if (!hitsWall(clamped.x, clamped.z, radius)) {
    return clamped;
  }
  const slideX = clampInArena(nx, z);
  if (!hitsWall(slideX.x, slideX.z, radius)) {
    return slideX;
  }
  const slideZ = clampInArena(x, nz);
  if (!hitsWall(slideZ.x, slideZ.z, radius)) {
    return slideZ;
  }
  return { x, z };
}

function aimDirection(yaw) {
  return new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
}

function spawnBullet(fromPlayer, origin, dir) {
  const color = fromPlayer ? 0x7dd3fc : 0xffa040;
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(fromPlayer ? 0.18 : 0.2, 12, 12),
    new THREE.MeshBasicMaterial({ color, fog: false })
  );
  group.add(core);

  const trail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.1, 1.4, 8),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75, fog: false })
  );
  trail.rotation.x = Math.PI / 2;
  trail.position.z = -0.65;
  group.add(trail);

  const glow = new THREE.PointLight(color, 1.8, 4);
  group.add(glow);

  group.position.copy(origin);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir.clone().normalize());
  scene.add(group);

  const list = fromPlayer ? bullets : enemyBullets;
  list.push({
    mesh: group,
    vel: dir.clone().multiplyScalar(BULLET_SPEED),
    fromPlayer,
    life: 2,
  });
}

function shoot(fromPlayer) {
  if (fromPlayer) {
    triggerGunRecoil();
    const dir = aimDirection(player.yaw);
    const origin = new THREE.Vector3(player.x, 1.5, player.z).addScaledVector(dir, 0.7);
    spawnBullet(true, origin, dir);
  } else {
    const dir = aimDirection(enemy.yaw);
    const origin = new THREE.Vector3(enemy.x, 1.4, enemy.z).addScaledVector(dir, 0.75);
    spawnBullet(false, origin, dir);
  }
}

function distXZ(ax, az, bx, bz) {
  const dx = ax - bx;
  const dz = az - bz;
  return Math.sqrt(dx * dx + dz * dz);
}

function updateEnemyAI(dt) {
  if (!enemyMesh) return;

  const d = distXZ(player.x, player.z, enemy.x, enemy.z);
  let moveX = 0;
  let moveZ = 0;

  if (playing && !gameEnded) {
    enemy.state = "chase";
    const dx = player.x - enemy.x;
    const dz = player.z - enemy.z;
    enemy.yaw = Math.atan2(dx, dz);
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    if (d > 4) {
      moveX = (dx / len) * ENEMY_SPEED * dt;
      moveZ = (dz / len) * ENEMY_SPEED * dt;
    }
    enemyFireTimer -= dt;
    if (enemyFireTimer <= 0 && d < 26) {
      shoot(false);
      enemyFireTimer = 0.85 + Math.random() * 0.5;
    }
  } else {
    enemy.state = "patrol";
    enemy.patrolT += dt;
    const tx = Math.sin(enemy.patrolT * 0.7) * 9;
    const tz = Math.cos(enemy.patrolT * 0.5) * 9 - 4;
    const dx = tx - enemy.x;
    const dz = tz - enemy.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    moveX = (dx / len) * ENEMY_SPEED * 0.75 * dt;
    moveZ = (dz / len) * ENEMY_SPEED * 0.75 * dt;
    enemy.yaw = Math.atan2(dx, dz);
  }

  const next = tryMove(enemy.x, enemy.z, enemy.x + moveX, enemy.z + moveZ, 0.5);
  enemy.x = next.x;
  enemy.z = next.z;

  enemyMesh.position.set(enemy.x, 0, enemy.z);
  enemyMesh.rotation.y = enemy.yaw;
}

function updateBullets(dt) {
  const updateList = (list, hitPlayer) => {
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.life -= dt;
      b.mesh.position.addScaledVector(b.vel, dt);

      if (b.life <= 0 || hitsWall(b.mesh.position.x, b.mesh.position.z, 0.1)) {
        scene.remove(b.mesh);
        list.splice(i, 1);
        continue;
      }

      if (b.fromPlayer) {
        const d = distXZ(b.mesh.position.x, b.mesh.position.z, enemy.x, enemy.z);
        if (d < 0.9) {
          enemyHp = Math.max(0, enemyHp - DAMAGE);
          score += 10;
          updateHud();
          scene.remove(b.mesh);
          list.splice(i, 1);
          flashHit(enemy.x, 1.5, enemy.z, 0xf97316);
          if (enemyHp <= 0) endGame(true);
        }
      } else if (hitPlayer) {
        const d = distXZ(b.mesh.position.x, b.mesh.position.z, player.x, player.z);
        if (d < 0.8) {
          playerHp = Math.max(0, playerHp - DAMAGE * 0.85);
          updateHud();
          scene.remove(b.mesh);
          list.splice(i, 1);
          flashHit(player.x, 1.5, player.z, 0xef4444);
          showToast("Hit!");
          if (playerHp <= 0) endGame(false);
        }
      }
    }
  };
  updateList(bullets, false);
  updateList(enemyBullets, true);
}

function flashHit(x, y, z, color) {
  const light = new THREE.PointLight(color, 3, 8);
  light.position.set(x, y, z);
  scene.add(light);
  setTimeout(() => scene.remove(light), 120);
}

function updatePlayer(dt) {
  if (keys.ArrowLeft) player.yaw += TURN_SPEED * dt;
  if (keys.ArrowRight) player.yaw -= TURN_SPEED * dt;

  const forward = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
  let move = 0;
  if (keys.ArrowUp) move += 1;
  if (keys.ArrowDown) move -= 1;

  if (move !== 0) {
    const nx = player.x + forward.x * PLAYER_SPEED * move * dt;
    const nz = player.z + forward.z * PLAYER_SPEED * move * dt;
    const moved = tryMove(player.x, player.z, nx, nz);
    player.x = moved.x;
    player.z = moved.z;
  }

  camera.position.set(player.x, 1.65, player.z);
  camera.rotation.order = "YXZ";
  camera.rotation.y = player.yaw + Math.PI;
  camera.rotation.x = 0;

  fireTimer -= dt;
  if (keys.Space && fireTimer <= 0) {
    shoot(true);
    fireTimer = FIRE_COOLDOWN;
  }

  updatePlayerGun(dt, move !== 0);
}

function updateHud() {
  playerHpEl.style.width = `${(playerHp / MAX_HP) * 100}%`;
  enemyHpEl.style.width = `${(enemyHp / MAX_HP) * 100}%`;
  scoreEl.textContent = String(score);
}

function showToast(text) {
  messageEl.textContent = text;
  messageEl.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => messageEl.classList.add("hidden"), 900);
}

function endGame(won) {
  if (gameEnded) return;
  gameEnded = true;
  playing = false;
  crosshair.classList.add("hidden");
  if (playerGun) playerGun.visible = false;
  hud.classList.add("hidden");
  gameover.classList.remove("hidden");
  resultTitle.textContent = won ? "Victory" : "Defeated";
  resultDetail.textContent = won
    ? `You eliminated the bot. Score: ${score}`
    : `The bot won this round. Score: ${score}`;
}

function resetGame() {
  playerHp = MAX_HP;
  enemyHp = MAX_HP;
  score = 0;
  fireTimer = 0;
  enemyFireTimer = 1.5;
  gameEnded = false;
  player.yaw = Math.PI;
  player.x = 0;
  player.z = ARENA * 0.35;
  enemy.x = 0;
  enemy.z = -ARENA * 0.35;
  enemy.yaw = 0;
  enemy.state = "patrol";
  enemy.patrolT = 0;

  bullets.forEach((b) => scene.remove(b.mesh));
  enemyBullets.forEach((b) => scene.remove(b.mesh));
  bullets.length = 0;
  enemyBullets.length = 0;

  enemyMesh.position.set(enemy.x, 0, enemy.z);
  updateHud();
}

function startGame() {
  resetGame();
  menu.classList.add("hidden");
  gameover.classList.add("hidden");
  hud.classList.remove("hidden");
  crosshair.classList.remove("hidden");
  if (playerGun) playerGun.visible = true;
  playing = true;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (!gameEnded) {
    updateEnemyAI(dt);
    if (playing) {
      updatePlayer(dt);
      updateBullets(dt);
    } else if (playerGun) {
      updatePlayerGun(dt, false);
    }
  }

  renderer.render(scene, camera);
}

window.addEventListener("keydown", (e) => {
  if (e.code in keys || e.code === "Space") {
    e.preventDefault();
    if (e.code === "Space") keys.Space = true;
    else keys[e.code] = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code in keys || e.code === "Space") {
    if (e.code === "Space") keys.Space = false;
    else keys[e.code] = false;
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

buildArena();
buildEnemy();
buildPlayerGun();
updateHud();
animate();
