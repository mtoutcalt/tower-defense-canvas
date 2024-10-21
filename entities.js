// import crypto from 'crypto';

import { gridSize } from './utils.js';
import { enemyReachedEnd, enemyKilled } from './game.js'


export class Enemy {
    constructor(baseHealth, baseSpeed, path) {
        this.x = path[0].x * gridSize + gridSize / 2;
        this.y = path[0].y * gridSize + gridSize / 2;
        this.speed = baseSpeed;
        this.health = baseHealth;
        this.maxHealth = this.health;
        this.pathIndex = 0;
        this.uuid = generateUUID()
    }

    update(path) {
        // Move enemy along path
        var targetX = path[this.pathIndex + 1].x * gridSize + gridSize / 2;
        var targetY = path[this.pathIndex + 1].y * gridSize + gridSize / 2;
        var dx = targetX - this.x;
        var dy = targetY - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.speed) {
            this.x = targetX;
            this.y = targetY;
            this.pathIndex++;
            if (this.pathIndex >= path.length - 1) {
                enemyReachedEnd(this.uuid)
            }
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx) {
        // Draw enemy on the canvas
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.fillText('E', this.x - 10, this.y + 10);

        // Draw health bar
        var healthBarWidth = 20;
        var healthBarHeight = 4;
        var healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - 10, this.y - 15, healthBarWidth * healthPercent, healthBarHeight);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x - 10, this.y - 15, healthBarWidth, healthBarHeight);
    }
}

export class Tower {
    constructor(gridX, gridY, type) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.x = gridX * gridSize + gridSize / 2;
        this.y = gridY * gridSize + gridSize / 2;
        this.type = type;
        if (type === 'basic') {
            this.range = 100;
            this.fireRate = 1000; // Fires every second
            this.damage = 5;
        } else if (type === 'advanced') {
            this.range = 120;
            this.fireRate = 800; // Fires every 0.8 seconds
            this.damage = 10;
        }
        this.lastShotTime = 0;
        this.uuid = generateUUID()
    }

    update(now, enemies, bullets) {
        if (now - this.lastShotTime > this.fireRate) {
            // Find the closest enemy in range
            var target = null;
            var minDistance = Infinity;
            for (var j = 0; j < enemies.length; j++) {
                var enemy = enemies[j];
                var dx = enemy.x - this.x;
                var dy = enemy.y - this.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.range && distance < minDistance) {
                    minDistance = distance;
                    target = enemy;
                }
            }
            if (target) {
                // Store the tower type in the bullet
                bullets.push(new Bullet(this.x, this.y, target, this.damage, this.type));
                this.lastShotTime = now;
            }
        }
    }

    draw(ctx) {
        ctx.font = '20px Arial';
        if (this.type === 'basic') {
            ctx.fillStyle = 'blue';
            ctx.fillText('T', this.x - 10, this.y + 10);
        } else if (this.type === 'advanced') {
            ctx.fillStyle = 'green';
            ctx.fillText('A', this.x - 10, this.y + 10);
        }
    }
}

export class Bullet {
    constructor(x, y, target, damage, type) {
        this.x = x
        this.y = y
        this.target = target
        this.damage = damage
        this.type = type
        this.uuid = generateUUID()
    }

    update() {
        var dx = this.target.x - this.x;
        var dy = this.target.y - this.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var bulletSpeed = 4;
        if (distance < bulletSpeed || this.target.health <= 0) {
            this.target.health -= this.damage;
            if (this.target.health <= 0) {
                enemyKilled(this)
            }
        } else {
            this.x += (dx / distance) * bulletSpeed;
            this.y += (dy / distance) * bulletSpeed;
        }
    }

    draw(ctx) {
        if (this.type === 'basic') {
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.fillText('.', this.x, this.y);
        } else if (this.type === 'advanced') {
            ctx.fillStyle = 'black';
            // Draw a larger circle for advanced bullets
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

export function generateUUID() {
    const min = 0
    const max = 10000000
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  

