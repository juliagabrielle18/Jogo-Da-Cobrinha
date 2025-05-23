const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 25;

let gridSizeX, gridSizeY;

let snake = [];
let direction = null;
let food = {};
let score = 0;
let level = 1;
let speed = 200;
let gameInterval = null;
let snakeColor = '#6C63FF';


function setCanvasSize() {
  const maxWidth = window.innerWidth * 0.95;  
  const maxHeight = window.innerHeight * 0.6; 

  canvas.width = Math.floor(maxWidth / box) * box;
  canvas.height = Math.floor(maxHeight / box) * box;

  gridSizeX = canvas.width / box;
  gridSizeY = canvas.height / box;
}

// Função para clarear a cor (para o corpo da cobra)
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

function isOnSnake(pos) {
  return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
}

function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSizeX) * box,
      y: Math.floor(Math.random() * gridSizeY) * box,
    };
  } while (isOnSnake(newFood));
  food = newFood;
  console.log('Nova comida em:', food);
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? snakeColor : lightenColor(snakeColor, 40);
    ctx.beginPath();
    ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (i === 0) {
      ctx.fillStyle = '#fff';
      const eyeRadius = 3;
      let eyeXOffset = box / 4;
      let eyeYOffset = box / 4;
      ctx.beginPath();
      if (direction === 'LEFT') {
        ctx.arc(snake[i].x + eyeRadius, snake[i].y + eyeYOffset, eyeRadius, 0, Math.PI * 2);
        ctx.arc(snake[i].x + eyeRadius, snake[i].y + box - eyeYOffset, eyeRadius, 0, Math.PI * 2);
      } else if (direction === 'RIGHT') {
        ctx.arc(snake[i].x + box - eyeRadius, snake[i].y + eyeYOffset, eyeRadius, 0, Math.PI * 2);
        ctx.arc(snake[i].x + box - eyeRadius, snake[i].y + box - eyeYOffset, eyeRadius, 0, Math.PI * 2);
      } else if (direction === 'UP') {
        ctx.arc(snake[i].x + eyeXOffset, snake[i].y + eyeRadius, eyeRadius, 0, Math.PI * 2);
        ctx.arc(snake[i].x + box - eyeXOffset, snake[i].y + eyeRadius, eyeRadius, 0, Math.PI * 2);
      } else if (direction === 'DOWN') {
        ctx.arc(snake[i].x + eyeXOffset, snake[i].y + box - eyeRadius, eyeRadius, 0, Math.PI * 2);
        ctx.arc(snake[i].x + box - eyeXOffset, snake[i].y + box - eyeRadius, eyeRadius, 0, Math.PI * 2);
      } else {
        ctx.arc(snake[i].x + box - eyeRadius, snake[i].y + eyeYOffset, eyeRadius, 0, Math.PI * 2);
        ctx.arc(snake[i].x + box - eyeRadius, snake[i].y + box - eyeYOffset, eyeRadius, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }
}

function drawFood() {
  ctx.fillStyle = '#FF3C00';
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2 - 3, 0, Math.PI * 2);
  ctx.fill();

  // Brilho simples
  ctx.strokeStyle = 'rgba(255, 60, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2 - 6, 0, Math.PI * 2);
  ctx.stroke();
}

function drawScore() {
  ctx.fillStyle = '#ccc';
  ctx.font = '18px Arial';
  ctx.fillText(`Pontos: ${score}`, box, box * 1.5);
  ctx.fillText(`Nível: ${level}`, box, box * 3);
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    return true;
  }
  return false;
}

function draw() {
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSnake();
  drawFood();
  drawScore();

  if (direction) {
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === 'LEFT') snakeX -= box;
    if (direction === 'UP') snakeY -= box;
    if (direction === 'RIGHT') snakeX += box;
    if (direction === 'DOWN') snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
      score++;
      if (score % 5 === 0) {
        level++;
        speed = Math.max(50, speed - 20);
        clearInterval(gameInterval);
        gameInterval = setInterval(draw, speed);
      }
      generateFood();
    } else {
      snake.pop();
    }

    const newHead = { x: snakeX, y: snakeY };

    if (collision(newHead, snake)) {
      clearInterval(gameInterval);
      alert(`Game Over! Pontos: ${score}. Clique em Start para jogar novamente.`);
      resetGame();
      return;
    }

    snake.unshift(newHead);
  }
}

function resetGame() {
  snake = [{ x: 10 * box, y: 10 * box }];
  direction = null;
  score = 0;
  level = 1;
  speed = 200;
  generateFood();
  clearInterval(gameInterval);
 
}

document.addEventListener('keydown', event => {
  if (!direction) return;
  if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  else if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  else if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  else if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});


const startBtn = document.getElementById('startBtn');
const colorPicker = document.getElementById('colorPicker');

startBtn.addEventListener('click', () => {
  if (gameInterval) clearInterval(gameInterval);
  snakeColor = colorPicker.value;
  resetGame();
  gameInterval = setInterval(draw, speed);
});


function setDirection(newDir) {
  if (
    (newDir === 'LEFT' && direction !== 'RIGHT') ||
    (newDir === 'RIGHT' && direction !== 'LEFT') ||
    (newDir === 'UP' && direction !== 'DOWN') ||
    (newDir === 'DOWN' && direction !== 'UP') ||
    direction === null 
  ) {
    direction = newDir;
  }
}

// Botões para mobile 
document.getElementById('upBtn')?.addEventListener('click', () => setDirection('UP'));
document.getElementById('downBtn')?.addEventListener('click', () => setDirection('DOWN'));
document.getElementById('leftBtn')?.addEventListener('click', () => setDirection('LEFT'));
document.getElementById('rightBtn')?.addEventListener('click', () => setDirection('RIGHT'));


window.addEventListener('resize', () => {
  setCanvasSize();
  resetGame();
});

setCanvasSize();
resetGame();
