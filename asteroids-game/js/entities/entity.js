class Entity {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.rotation = 0;
        this.radius = 10;
        this.alive = true;
        this.color = '#00ff00';
        this.lineWidth = 2;
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        this.position = Physics.wrapPosition(this.position, canvasWidth, canvasHeight);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        this.drawShape(ctx);
        ctx.restore();
    }

    drawShape(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    checkCollision(other) {
        return Physics.checkCircleCollision(
            this.position, this.radius,
            other.position, other.radius
        );
    }

    destroy() {
        this.alive = false;
    }

    isOffScreen(canvasWidth, canvasHeight, margin = 50) {
        return this.position.x < -margin || 
               this.position.x > canvasWidth + margin ||
               this.position.y < -margin || 
               this.position.y > canvasHeight + margin;
    }
}