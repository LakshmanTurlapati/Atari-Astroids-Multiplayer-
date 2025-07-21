class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2(0, 0);
        return new Vector2(this.x / mag, this.y / mag);
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    distance(vector) {
        return this.subtract(vector).magnitude();
    }

    static fromAngle(angle, magnitude = 1) {
        return new Vector2(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }
}

class Physics {
    static wrapPosition(position, canvasWidth, canvasHeight) {
        let x = position.x;
        let y = position.y;

        if (x < 0) x = canvasWidth;
        if (x > canvasWidth) x = 0;
        if (y < 0) y = canvasHeight;
        if (y > canvasHeight) y = 0;

        return new Vector2(x, y);
    }

    static checkCircleCollision(pos1, radius1, pos2, radius2) {
        const distance = pos1.distance(pos2);
        return distance < (radius1 + radius2);
    }

    static applyFriction(velocity, friction = 0.99) {
        return velocity.multiply(friction);
    }

    static limitVelocity(velocity, maxSpeed) {
        if (velocity.magnitude() > maxSpeed) {
            return velocity.normalize().multiply(maxSpeed);
        }
        return velocity;
    }

    static randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomAngle() {
        return Math.random() * Math.PI * 2;
    }

    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }
}