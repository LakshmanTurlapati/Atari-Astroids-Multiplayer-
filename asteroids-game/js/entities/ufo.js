class UFO extends Entity {
    constructor(x, y, type = 'large') {
        super(x, y);
        this.type = type;
        this.setupType();
        this.shootTimer = 0;
        this.shootInterval = this.type === 'large' ? 2000 : 1500;
        this.changeDirectionTimer = 0;
        this.changeDirectionInterval = 3000;
        this.targetShip = null;
    }

    setupType() {
        if (this.type === 'large') {
            this.radius = 20;
            this.points = 200;
            this.speed = 60;
            this.accuracy = 0.3;
        } else {
            this.radius = 15;
            this.points = 1000;
            this.speed = 100;
            this.accuracy = 0.8;
        }
        
        const angle = Physics.randomAngle();
        this.velocity = Vector2.fromAngle(angle, this.speed);
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        super.update(deltaTime, canvasWidth, canvasHeight);
        
        this.shootTimer += deltaTime * 1000;
        this.changeDirectionTimer += deltaTime * 1000;
        
        if (this.changeDirectionTimer >= this.changeDirectionInterval) {
            this.changeDirection();
            this.changeDirectionTimer = 0;
        }
        
        if (this.shootTimer >= this.shootInterval && this.targetShip) {
            const bullet = this.shoot();
            if (bullet) {
                game.ufoBullets.push(bullet);
                game.audioManager.play('ufoShoot');
            }
            this.shootTimer = 0;
        }
    }

    changeDirection() {
        const angle = Physics.randomAngle();
        this.velocity = Vector2.fromAngle(angle, this.speed);
    }

    shoot() {
        if (!this.targetShip || !this.targetShip.alive) return null;
        
        let targetDirection;
        
        if (Math.random() < this.accuracy) {
            const toTarget = this.targetShip.position.subtract(this.position);
            const distance = toTarget.magnitude();
            const timeToTarget = distance / 300;
            const predictedPosition = this.targetShip.position.add(
                this.targetShip.velocity.multiply(timeToTarget)
            );
            targetDirection = predictedPosition.subtract(this.position).normalize();
        } else {
            targetDirection = Vector2.fromAngle(Physics.randomAngle());
        }
        
        const bulletSpeed = 300;
        const bulletVelocity = targetDirection.multiply(bulletSpeed);
        const bulletPosition = this.position.add(targetDirection.multiply(this.radius + 5));
        
        return new UFOBullet(bulletPosition.x, bulletPosition.y, bulletVelocity);
    }

    drawShape(ctx) {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(0, -this.radius * 0.3, this.radius * 0.7, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-this.radius * 1.2, this.radius * 0.6);
        ctx.lineTo(this.radius * 1.2, this.radius * 0.6);
        ctx.stroke();
    }

    static createUFO(canvasWidth, canvasHeight, score) {
        const type = score > 40000 ? 'small' : 'large';
        const side = Math.random() < 0.5 ? 0 : 1;
        
        let x, y;
        if (side === 0) {
            x = -30;
            y = Physics.randomInRange(50, canvasHeight - 50);
        } else {
            x = canvasWidth + 30;
            y = Physics.randomInRange(50, canvasHeight - 50);
        }
        
        return new UFO(x, y, type);
    }
}

class UFOBullet extends Bullet {
    constructor(x, y, velocity) {
        super(x, y, velocity);
        this.color = '#ff0000';
        this.radius = 3;
        this.lifetime = 3;
    }
}