const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

// キャラクター
const charImg = new Image();
charImg.src = 'images/fairy.png';
const char = {
  width: 70,
  height: 90,
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  speed: 10
};

// スイーツ
const sweetTypes = [
  {src: 'images/cake.png', points: 10},
  {src: 'images/macaron.png', points: 5},
  {src: 'images/cookie.png', points: 2}
];
const sweets = [];

// スコア・時間
let score = 0;
let timeLeft = 30; // 秒
let gameOver = false;

// スイーツ追加
function addSweet() {
  if (gameOver) return;
  const type = sweetTypes[Math.floor(Math.random() * sweetTypes.length)];
  const img = new Image();
  img.src = type.src;

  sweets.push({
    img: img,
    x: Math.random() * (canvas.width - 50),
    y: -50,
    width: 50,
    height: 50,
    speed: 2 + Math.random() * 3,
    points: type.points
  });
}

// ゲームループ
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // キャラクター描画
  ctx.drawImage(charImg, char.x, char.y, char.width, char.height);

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

// キャラクター操作
window.addEventListener('keydown', (e) => {
  if (gameOver) return;
  if (e.key === 'ArrowLeft') char.x -= char.speed;
  if (e.key === 'ArrowRight') char.x += char.speed;

  if (char.x < 0) char.x = 0;
  if (char.x + char.width > canvas.width) char.x = canvas.width - char.width;
});

// 初期化
draw();
startTimer();
addSweet();
setInterval(addSweet, 1500); // 1.5秒ごとに新しいスイーツ追加