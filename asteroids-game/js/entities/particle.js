class Particle extends Entity {
    constructor(x, y, velocity, color = '#ffffff', lifetime = 1) {
        super(x, y);
        this.velocity = velocity;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
        this.radius = Physics.randomInRange(1, 3);
        this.initialRadius = this.radius;
        this.gravity = new Vector2(0, 0);
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        this.velocity = this.velocity.add(this.gravity.multiply(deltaTime));
        super.update(deltaTime, canvasWidth, canvasHeight);
        
        this.age += deltaTime;
        const lifePercent = this.age / this.lifetime;
        this.radius = this.initialRadius * (1 - lifePercent);
        
        if (this.age >= this.lifetime || this.radius <= 0) {
            this.destroy();
        }
    }

    draw(ctx) {
        const alpha = Math.max(0, 1 - (this.age / this.lifetime));
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.position.x, this.position.y);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime, canvasWidth, canvasHeight);
            if (!this.particles[i].alive) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    createExplosion(x, y, color = '#ffffff', count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Physics.randomAngle();
            const speed = Physics.randomInRange(50, 200);
            const velocity = Vector2.fromAngle(angle, speed);
            const lifetime = Physics.randomInRange(0.5, 1.5);
            
            this.particles.push(new Particle(x, y, velocity, color, lifetime));
        }
    }

    createDebris(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const angle = Physics.randomAngle();
            const speed = Physics.randomInRange(30, 100);
            const velocity = Vector2.fromAngle(angle, speed);
            const lifetime = Physics.randomInRange(1, 2);
            const colors = ['#888888', '#aaaaaa', '#666666'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const particle = new Particle(x, y, velocity, color, lifetime);
            particle.gravity = new Vector2(0, 50);
            this.particles.push(particle);
        }
    }

    clear() {
        this.particles = [];
    }
}