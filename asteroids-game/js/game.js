class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audioManager = new AudioManager();
        this.particleSystem = new ParticleSystem();
        
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.extraLifeThreshold = 10000;
        this.nextExtraLifeScore = this.extraLifeThreshold;
        
        this.ship = null;
        this.asteroids = [];
        this.bullets = [];
        this.ufos = [];
        this.ufoBullets = [];
        
        this.ufoSpawnTimer = 0;
        this.ufoSpawnInterval = 30000;
        
        this.input = {
            keys: {},
            lastShoot: 0,
            lastHyperspace: 0,
            shootCooldown: 200,
            hyperspaceCooldown: 1000
        };
        
        this.lastTime = 0;
        this.setupInput();
        this.showInstructions();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.input.keys[e.code] = true;
            
            if (e.code === 'Enter') {
                if (this.gameState === 'menu' || this.gameState === 'gameOver') {
                    this.startGame();
                }
            }
            
            if (this.gameState === 'playing') {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.tryShoot();
                }
                
                if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                    e.preventDefault();
                    this.tryHyperspace();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.input.keys[e.code] = false;
        });

        document.addEventListener('click', () => {
            if (!this.audioManager.initialized) {
                this.audioManager.initialize();
            }
        });
    }

    showInstructions() {
        this.gameState = 'menu';
        this.updateUI();
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.nextExtraLifeScore = this.extraLifeThreshold;
        
        this.ship = new Ship(this.canvas.width / 2, this.canvas.height / 2);
        this.asteroids = [];
        this.bullets = [];
        this.ufos = [];
        this.ufoBullets = [];
        this.particleSystem.clear();
        
        this.spawnAsteroids();
        this.updateUI();
        this.hideGameOverScreen();
        
        if (!this.audioManager.initialized) {
            this.audioManager.initialize();
        }
    }

    spawnAsteroids() {
        const numAsteroids = Math.min(4 + this.wave, 12);
        
        for (let i = 0; i < numAsteroids; i++) {
            this.asteroids.push(
                Asteroid.createRandomAsteroid(this.canvas.width, this.canvas.height, true)
            );
        }
    }

    tryShoot() {
        const now = Date.now();
        if (now - this.input.lastShoot > this.input.shootCooldown && this.ship && this.ship.alive) {
            const bullet = this.ship.shoot();
            this.bullets.push(bullet);
            this.audioManager.play('shoot');
            this.input.lastShoot = now;
        }
    }

    tryHyperspace() {
        const now = Date.now();
        if (now - this.input.lastHyperspace > this.input.hyperspaceCooldown && this.ship && this.ship.alive) {
            const destroyed = this.ship.hyperspace();
            if (destroyed) {
                this.shipDestroyed();
            }
            this.input.lastHyperspace = now;
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        if (this.ship && this.ship.alive) {
            this.ship.update(deltaTime, this.canvas.width, this.canvas.height);
        }
        
        this.updateBullets(deltaTime);
        this.updateAsteroids(deltaTime);
        this.updateUFOs(deltaTime);
        this.updateUFOBullets(deltaTime);
        this.particleSystem.update(deltaTime, this.canvas.width, this.canvas.height);
        
        this.checkCollisions();
        this.checkWaveComplete();
        this.updateUFOSpawning(deltaTime);
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(deltaTime, this.canvas.width, this.canvas.height);
            if (!this.bullets[i].alive) {
                this.bullets.splice(i, 1);
            }
        }
    }

    updateAsteroids(deltaTime) {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            this.asteroids[i].update(deltaTime, this.canvas.width, this.canvas.height);
            if (!this.asteroids[i].alive) {
                this.asteroids.splice(i, 1);
            }
        }
    }

    updateUFOs(deltaTime) {
        for (let i = this.ufos.length - 1; i >= 0; i--) {
            this.ufos[i].targetShip = this.ship;
            this.ufos[i].update(deltaTime, this.canvas.width, this.canvas.height);
            
            if (!this.ufos[i].alive || this.ufos[i].isOffScreen(this.canvas.width, this.canvas.height)) {
                this.ufos.splice(i, 1);
            }
        }
    }

    updateUFOBullets(deltaTime) {
        for (let i = this.ufoBullets.length - 1; i >= 0; i--) {
            this.ufoBullets[i].update(deltaTime, this.canvas.width, this.canvas.height);
            if (!this.ufoBullets[i].alive) {
                this.ufoBullets.splice(i, 1);
            }
        }
    }

    updateUFOSpawning(deltaTime) {
        this.ufoSpawnTimer += deltaTime * 1000;
        
        if (this.ufoSpawnTimer >= this.ufoSpawnInterval && this.ufos.length === 0) {
            const ufo = UFO.createUFO(this.canvas.width, this.canvas.height, this.score);
            this.ufos.push(ufo);
            this.ufoSpawnTimer = 0;
        }
    }

    checkCollisions() {
        this.checkBulletAsteroidCollisions();
        this.checkBulletUFOCollisions();
        this.checkShipAsteroidCollisions();
        this.checkShipUFOCollisions();
        this.checkShipUFOBulletCollisions();
    }

    checkBulletAsteroidCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.bullets[i].checkCollision(this.asteroids[j])) {
                    const asteroid = this.asteroids[j];
                    const fragments = asteroid.split();
                    
                    this.addScore(asteroid.points);
                    this.particleSystem.createExplosion(asteroid.position.x, asteroid.position.y, '#00ff00', 8);
                    this.particleSystem.createDebris(asteroid.position.x, asteroid.position.y, 3);
                    this.audioManager.play('explosion');
                    
                    this.asteroids.splice(j, 1);
                    this.bullets.splice(i, 1);
                    this.asteroids.push(...fragments);
                    break;
                }
            }
        }
    }

    checkBulletUFOCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.ufos.length - 1; j >= 0; j--) {
                if (this.bullets[i].checkCollision(this.ufos[j])) {
                    const ufo = this.ufos[j];
                    
                    this.addScore(ufo.points);
                    this.particleSystem.createExplosion(ufo.position.x, ufo.position.y, '#ff0000', 12);
                    this.audioManager.play('explosion');
                    
                    this.ufos.splice(j, 1);
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
    }

    checkShipAsteroidCollisions() {
        if (!this.ship || !this.ship.alive || this.ship.invulnerable) return;
        
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            if (this.ship.checkCollision(this.asteroids[i])) {
                this.shipDestroyed();
                break;
            }
        }
    }

    checkShipUFOCollisions() {
        if (!this.ship || !this.ship.alive || this.ship.invulnerable) return;
        
        for (let i = this.ufos.length - 1; i >= 0; i--) {
            if (this.ship.checkCollision(this.ufos[i])) {
                this.shipDestroyed();
                break;
            }
        }
    }

    checkShipUFOBulletCollisions() {
        if (!this.ship || !this.ship.alive || this.ship.invulnerable) return;
        
        for (let i = this.ufoBullets.length - 1; i >= 0; i--) {
            if (this.ship.checkCollision(this.ufoBullets[i])) {
                this.shipDestroyed();
                this.ufoBullets.splice(i, 1);
                break;
            }
        }
    }

    shipDestroyed() {
        if (!this.ship) return;
        
        this.particleSystem.createExplosion(this.ship.position.x, this.ship.position.y, '#ffffff', 15);
        this.audioManager.play('explosion');
        this.ship.destroy();
        this.lives--;
        
        setTimeout(() => {
            if (this.lives > 0 && this.gameState === 'playing') {
                this.ship = new Ship(this.canvas.width / 2, this.canvas.height / 2);
            } else if (this.lives <= 0) {
                this.gameOver();
            }
            this.updateUI();
        }, 2000);
    }

    addScore(points) {
        this.score += points;
        
        if (this.score >= this.nextExtraLifeScore) {
            this.lives++;
            this.nextExtraLifeScore += this.extraLifeThreshold;
            this.audioManager.play('extraLife');
        }
        
        this.updateUI();
    }

    checkWaveComplete() {
        if (this.asteroids.length === 0 && this.gameState === 'playing') {
            this.wave++;
            setTimeout(() => {
                this.spawnAsteroids();
                this.updateUI();
            }, 2000);
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.showGameOverScreen();
    }

    showGameOverScreen() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        const finalScore = document.getElementById('finalScore');
        finalScore.textContent = this.score;
        gameOverScreen.classList.remove('hidden');
    }

    hideGameOverScreen() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        gameOverScreen.classList.add('hidden');
    }

    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
        document.getElementById('level').textContent = `Wave: ${this.wave}`;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.ship && this.ship.alive) {
            this.ship.draw(this.ctx);
        }
        
        this.asteroids.forEach(asteroid => asteroid.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.ufos.forEach(ufo => ufo.draw(this.ctx));
        this.ufoBullets.forEach(bullet => bullet.draw(this.ctx));
        this.particleSystem.draw(this.ctx);
        
        if (this.gameState === 'menu') {
            this.drawMenu();
        }
    }

    drawMenu() {
        this.ctx.save();
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ff00';
        
        this.ctx.fillText('ASTEROIDS', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        this.ctx.font = '24px Courier New';
        this.ctx.fillText('Press ENTER to Start', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        this.ctx.restore();
    }

    gameLoop(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
}

const game = new Game();
game.start();