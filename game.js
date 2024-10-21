import { Enemy, Tower } from './entities.js';
import { gridSize, gridWidth, gridHeight } from './utils.js';

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

// Initialize grid
var grid = [];
for (var x = 0; x < gridWidth; x++) {
    grid[x] = [];
    for (var y = 0; y < gridHeight; y++) {
        grid[x][y] = null; // Empty cell
    }
}

// Game state variables
var towers = [];
var enemies = [];
var bullets = [];

var lives = 10;
var money = 150;

var enemySpawnInterval = 2000; // Spawn an enemy every 2 seconds
var lastEnemySpawnTime = Date.now();

// Timer variables
var startTime = Date.now();
var elapsedTime = 0;

// Enemy strength increase interval
var difficultyIncreaseInterval = 30000; // Every 30 seconds
var lastDifficultyIncreaseTime = Date.now();

// Enemy stats
var enemyBaseHealth = 10;
var enemyBaseSpeed = 1;

// Define the path as grid coordinates
var path = [
    { x: 0, y: 6 },
    { x: 15, y: 6 }
];

// Tower selection
var selectedTowerType = 'basic'; // 'basic' or 'advanced'

canvas.addEventListener('click', onCanvasClick);
document.addEventListener('keydown', onKeyDown);

function onCanvasClick(e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    // Convert pixel coordinates to grid coordinates
    var gridX = Math.floor(x / gridSize);
    var gridY = Math.floor(y / gridSize);

    // Check if the grid cell is empty and not part of the path
    var cellOccupied = grid[gridX][gridY];
    var isOnPath = false;
    for (var i = 0; i < path.length; i++) {
        if (path[i].x === gridX && path[i].y === gridY) {
            isOnPath = true;
            break;
        }
    }

    if (!cellOccupied && !isOnPath) {
        var towerCost = selectedTowerType === 'basic' ? 50 : 100;
        if (money >= towerCost) {
            var tower = new Tower(gridX, gridY, selectedTowerType);
            towers.push(tower);
            grid[gridX][gridY] = tower;
            money -= towerCost;
        } else {
            alert('Not enough money!');
        }
    } else {
        alert('Cannot place a tower here!');
    }
}

function onKeyDown(e) {
    if (e.key === '1') {
        selectedTowerType = 'basic';
    } else if (e.key === '2') {
        selectedTowerType = 'advanced';
    }
}

function update(now) {
    // Update elapsed time
    elapsedTime = Math.floor((now - startTime) / 1000);

    // Increase difficulty every 30 seconds
    if (now - lastDifficultyIncreaseTime > difficultyIncreaseInterval) {
        enemyBaseHealth += 5; // Increase enemy health
        enemyBaseSpeed += 0.2; // Increase enemy speed
        lastDifficultyIncreaseTime = now;
    }

    // Spawn enemies
    if (now - lastEnemySpawnTime > enemySpawnInterval) {
        enemies.push(new Enemy(enemyBaseHealth, enemyBaseSpeed, path));
        lastEnemySpawnTime = now;
    }

    // Update enemies
    enemies.forEach(enemy => enemy.update(path));

    // Update towers
    towers.forEach(tower => tower.update(now, enemies, bullets));

    // Update bullets
    bullets.forEach(bullet => bullet.update());
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (var x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (var y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }


    // Draw path
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(path[0].x * gridSize + gridSize / 2, path[0].y * gridSize + gridSize / 2);
    for (var i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x * gridSize + gridSize / 2, path[i].y * gridSize + gridSize / 2);
    }
    ctx.stroke();

    // Draw towers
    towers.forEach(tower => tower.draw(ctx));

    // Draw enemies
    enemies.forEach(enemy => enemy.draw(ctx));

    // Draw bullets
    bullets.forEach(bullet => bullet.draw(ctx));

    // Draw HUD
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Lives: ' + lives, 10, 20);
    ctx.fillText('Money: ' + money, 10, 40);
    ctx.fillText('Time: ' + elapsedTime + ' s', 10, 60);
    ctx.fillText('Press 1: Basic Tower (50) | Press 2: Advanced Tower (100)', 10, 80);
    ctx.fillText('Selected Tower: ' + (selectedTowerType === 'basic' ? 'Basic Tower' : 'Advanced Tower'), 10, 100);
}

function gameLoop() {
    var now = Date.now();
    update(now);
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

export function enemyReachedEnd(uuidToDelete) {
    // Enemy reached the end
    const indexToRemove = enemies.findIndex(enemy => enemy.uuid === uuidToDelete)
    if (indexToRemove != -1) {
        enemies.splice(indexToRemove, 1);
    } else {
        console.error("COULD NOT FIND ENEMY ERROR TO REMOVE!")
    }

    lives--;
    if (lives <= 0) {
        alert("Game Over! You survived for " + elapsedTime + " seconds.");
        document.location.reload();
    }
}

export function enemyKilled(bulletToDelete) {
    var index = enemies.indexOf(bulletToDelete.target);
    if (index > -1) {
        enemies.splice(index, 1);
        money += 10;
    }
    const indexToRemove = bullets.findIndex(b => b.uuid === bulletToDelete.uuid)
    if (indexToRemove != -1) {
        bullets.splice(indexToRemove, 1);
    } else {
        console.error("COULD NOT FIND BULLET ERROR TO REMOVE!")
    }
}
