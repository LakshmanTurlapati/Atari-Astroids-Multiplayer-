class Ship extends Entity {
    constructor(x, y) {
        super(x, y);
        this.radius = 8;
        this.thrustPower = 300;
        this.rotationSpeed = 5;
        this.maxSpeed = 400;
        this.thrusting = false;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 3000;
        this.thrustParticles = [];
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        this.handleInput(deltaTime);
        
        this.velocity = Physics.applyFriction(this.velocity, 0.99);
        this.velocity = Physics.limitVelocity(this.velocity, this.maxSpeed);
        
        super.update(deltaTime, canvasWidth, canvasHeight);
        
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime * 1000;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }

        this.updateThrustParticles(deltaTime);
    }

    handleInput(deltaTime) {
        const keys = game.input.keys;
        
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.rotation -= this.rotationSpeed * deltaTime;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.rotation += this.rotationSpeed * deltaTime;
        }
        
        this.thrusting = keys['ArrowUp'] || keys['KeyW'];
        if (this.thrusting) {
            const thrust = Vector2.fromAngle(this.rotation, this.thrustPower * deltaTime);
            this.velocity = this.velocity.add(thrust);
            this.createThrustParticle();
            
            if (Math.random() < 0.1) {
                game.audioManager.play('thrust');
            }
        }
    }

    createThrustParticle() {
        const thrustDirection = Vector2.fromAngle(this.rotation + Math.PI, 1);
        const particlePos = this.position.add(thrustDirection.multiply(this.radius));
        
        this.thrustParticles.push({
            position: particlePos.add(new Vector2(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5
            )),
            velocity: thrustDirection.multiply(Physics.randomInRange(50, 100)),
            life: 0.3,
            maxLife: 0.3
        });

        if (this.thrustParticles.length > 20) {
            this.thrustParticles.shift();
        }
    }

    updateThrustParticles(deltaTime) {
        for (let i = this.thrustParticles.length - 1; i >= 0; i--) {
            const particle = this.thrustParticles[i];
            particle.position = particle.position.add(particle.velocity.multiply(deltaTime));
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.thrustParticles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.drawThrustParticles(ctx);
        
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
            return;
        }
        
        super.draw(ctx);
    }

    drawThrustParticles(ctx) {
        this.thrustParticles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ff4400';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#ff4400';
            ctx.beginPath();
            ctx.arc(particle.position.x, particle.position.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    drawShape(ctx) {
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -8);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 8);
        ctx.closePath();
        ctx.stroke();
    }

    shoot() {
        const bulletSpeed = 500;
        const bulletDirection = Vector2.fromAngle(this.rotation, bulletSpeed);
        const bulletPosition = this.position.add(Vector2.fromAngle(this.rotation, this.radius + 5));
        
        return new Bullet(
            bulletPosition.x,
            bulletPosition.y,
            this.velocity.add(bulletDirection)
        );
    }

    hyperspace() {
        const margin = 50;
        this.position = new Vector2(
            Physics.randomInRange(margin, game.canvas.width - margin),
            Physics.randomInRange(margin, game.canvas.height - margin)
        );
        this.velocity = new Vector2(0, 0);
        
        if (Math.random() < 0.1) {
            this.destroy();
            return true;
        }
        
        this.makeInvulnerable();
        return false;
    }

    makeInvulnerable() {
        this.invulnerable = true;
        this.invulnerabilityTime = this.invulnerabilityDuration;
    }

    reset(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.rotation = 0;
        this.alive = true;
        this.thrusting = false;
        this.thrustParticles = [];
        this.makeInvulnerable();
    }
}