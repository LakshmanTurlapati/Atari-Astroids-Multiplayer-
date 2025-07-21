class Bullet extends Entity {
    constructor(x, y, velocity) {
        super(x, y);
        this.velocity = velocity;
        this.radius = 2;
        this.lifetime = 1.5;
        this.age = 0;
        this.color = '#ffffff';
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        super.update(deltaTime, canvasWidth, canvasHeight);
        
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            this.destroy();
        }
    }

    drawShape(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        this.drawShape(ctx);
        ctx.restore();
    }
}