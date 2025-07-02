const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const colorPicker = document.getElementById("colorPicker");
const scoreDisplay = document.getElementById("scoreDisplay");

let snake = [];
let direction = "RIGHT";
let food = {};
let box = 20;
let score = 0;
let snakeColor = "#6C63FF";
let gameInterval;

function setCanvasSize() {
  const maxCanvasSize = 480; // tamanho máximo menor para visual mais leve
  const size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.7, maxCanvasSize);
  const adjustedSize = Math.floor(size / box) * box;
  canvas.width = adjustedSize;
  canvas.height = adjustedSize;
}

function createSnake() {
  snake = [];
  for (let i = 5; i > 0; i--) {
    snake.push({ x: i * box, y: 0 });
  }
}

function drawSnake() {
  for (let segment of snake) {
    ctx.fillStyle = snakeColor;
    ctx.fillRect(segment.x, segment.y, box, box);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(segment.x, segment.y, box, box);
  }
}

function createFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

function drawFood() {
  ctx.fillStyle = "#FF4757";
  ctx.fillRect(food.x, food.y, box, box);
}

function moveSnake() {
  const head = { ...snake[0] };

  switch (direction) {
    case "RIGHT": head.x += box; break;
    case "LEFT": head.x -= box; break;
    case "UP": head.y -= box; break;
    case "DOWN": head.y += box; break;
  }

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    collision(head, snake)
  ) {
    clearInterval(gameInterval);
    alert(`Fim de jogo! Pontuação: ${score}`);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScore();
    createFood();
  } else {
    snake.pop();
  }
}

function collision(head, body) {
  return body.some(segment => head.x === segment.x && head.y === segment.y);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();
  moveSnake();
}

function setDirection(newDir) {
  const opposites = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
  if (newDir !== opposites[direction]) {
    direction = newDir;
  }
}

function updateScore() {
  scoreDisplay.textContent = `Pontuação: ${score}`;
}

function startGame() {
  setCanvasSize();
  direction = "RIGHT";
  score = 0;
  updateScore();
  snakeColor = colorPicker.value;
  createSnake();
  createFood();
  clearInterval(gameInterval);
  gameInterval = setInterval(draw, 100);
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp": setDirection("UP"); break;
    case "ArrowDown": setDirection("DOWN"); break;
    case "ArrowLeft": setDirection("LEFT"); break;
    case "ArrowRight": setDirection("RIGHT"); break;
  }
});

colorPicker.addEventListener("input", () => {
  snakeColor = colorPicker.value;
});

startBtn.addEventListener("click", startGame);
window.addEventListener("resize", setCanvasSize);
