const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

// キャラクター
const charImg = new Image();
charImg.src = 'images/fairy.png';
// 向きを管理するフラグ
let facingRight = true;

const groundY = canvas.height - 90; // ← ここで地面の高さを決める

const char = {
  width: 100,
  height: 140,
  x: canvas.width / 2 - 50,
  y: groundY,   // 初期位置を地面に合わせる
  speed: 12,
  vy: 0,        // 縦方向速度
  onGround: true
};

// スイーツ（通常アイテム）
const sweetTypes = [
  {src: 'images/cake.png', points: 10},
  {src: 'images/macaron.png', points: 5},
  {src: 'images/cookie.png', points: 2}
];

// マイナスアイテム
const badTypes = [
  {src: 'images/poisonapple.png', points: -10}, // 毒リンゴ
  {src: 'images/banana.png', points: -3}        // バナナの皮
];

const sweets = [];

// スコア・時間
let score = 0;
let timeLeft = 30; // 秒
let gameOver = false;

// スイーツ追加
function addSweet() {
  if (gameOver) return;

   let type;
  if (Math.random() < 0.3) {  
    // 30%の確率でマイナスアイテム
    type = badTypes[Math.floor(Math.random() * badTypes.length)];
  } else {
    // 70%は普通のスイーツ
    type = sweetTypes[Math.floor(Math.random() * sweetTypes.length)];
  }
  const img = new Image();
  img.src = type.src;

  sweets.push({
    img: img,
    x: Math.random() * (canvas.width - 70),
    y: -70,
    width: 70,
    height: 70,
    speed: 2 + Math.random() * 3,
    points: type.points
  });
}

// ゲームループ
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- キャラを描画 ---
  ctx.save();
  if (facingRight) {
    ctx.drawImage(charImg, char.x, char.y, char.width, char.height);
  } else {
    ctx.translate(char.x + char.width, char.y); // 左右反転の基準点
    ctx.scale(-1, 1); // 左右反転
    ctx.drawImage(charImg, 0, 0, char.width, char.height);
  }
  ctx.restore();

   // キャラ縦移動（ジャンプ・重力）
  char.y += char.vy;
  char.vy += 0.3; // 重力

  // 地面判定
  if (char.y + char.height >= groundY) {
  char.y = groundY - char.height;
  char.vy = 0;
  char.onGround = true;
}

  // スイーツ描画
  for (let i = sweets.length - 1; i >= 0; i--) {
    const s = sweets[i];
    ctx.drawImage(s.img, s.x, s.y, s.width, s.height);
    s.y += s.speed;

    // キャッチ判定
    if (
      s.x < char.x + char.width &&
      s.x + s.width > char.x &&
      s.y < char.y + char.height &&
      s.y + s.height > char.y
    ) {
      score += s.points;
      scoreDisplay.textContent = "Score: " + score;
      sweets.splice(i, 1); // 取ったスイーツは削除
    }

    // 画面外のスイーツは削除
    if (s.y > canvas.height) sweets.splice(i, 1);
  }

  if (!gameOver) requestAnimationFrame(draw);
  else alert("Game Over! Score: " + score);
}

// タイマー
function startTimer() {
  const timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = "Time: " + timeLeft;
    if (timeLeft <= 0) {
      gameOver = true;
      clearInterval(timer);
    }
  }, 1000);
}

// キャラクター操作（キーボード）
let keyMoveInterval = null;
function startKeyMove(direction) {
  if (keyMoveInterval) return;
  keyMoveInterval = setInterval(() => {
    if (direction === "left") moveLeft();
    if (direction === "right") moveRight();
  }, 50);
}
function stopKeyMove() {
  clearInterval(keyMoveInterval);
  keyMoveInterval = null;
}

window.addEventListener('keydown', (e) => {
  if (gameOver) return;

  if (e.key === 'ArrowRight') {
    facingRight = true;
    startKeyMove("right");
  } else if (e.key === 'ArrowLeft') {
    facingRight = false;
    startKeyMove("left");
  }

  // ジャンプ
  if (e.key === ' ' && char.onGround) {
    char.vy = -8;
    char.onGround = false;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    stopKeyMove();
  }
});

// 初期化
draw();
startTimer();
addSweet();
setInterval(addSweet, 1000); // 1.0秒ごとに新しいスイーツ追加

// 操作用ボタン（スマホ＆PC対応、長押し対応）
let btnMoveInterval = null;

function startBtnMove(direction) {
  if (btnMoveInterval) return;
  btnMoveInterval = setInterval(() => {
    if (direction === "left") moveLeft();
    if (direction === "right") moveRight();
  }, 50);
}

function stopBtnMove() {
  clearInterval(btnMoveInterval);
  btnMoveInterval = null;
}

// 左ボタン
document.getElementById("btn-left").addEventListener("touchstart", () => startBtnMove("left"));
document.getElementById("btn-left").addEventListener("mousedown", () => startBtnMove("left"));
document.getElementById("btn-left").addEventListener("touchend", stopBtnMove);
document.getElementById("btn-left").addEventListener("mouseup", stopBtnMove);

// 右ボタン
document.getElementById("btn-right").addEventListener("touchstart", () => startBtnMove("right"));
document.getElementById("btn-right").addEventListener("mousedown", () => startBtnMove("right"));
document.getElementById("btn-right").addEventListener("touchend", stopBtnMove);
document.getElementById("btn-right").addEventListener("mouseup", stopBtnMove);

// ジャンプ（単発）
document.getElementById("btn-up").addEventListener("touchstart", jump);
document.getElementById("btn-up").addEventListener("mousedown", jump);

// --- 移動関数 ---
function moveLeft() {
  if (gameOver) return;
  facingRight = false;
  char.x -= char.speed;
  if (char.x < 0) char.x = 0;
}

function moveRight() {
  if (gameOver) return;
  facingRight = true;
  char.x += char.speed;
  if (char.x + char.width > canvas.width) char.x = canvas.width - char.width;
}

function jump() {
  if (gameOver) return;
  if (char.onGround) {
    char.vy = -8;
    char.onGround = false;
  }
}