class Asteroid extends Entity {
    constructor(x, y, size = 'large') {
        super(x, y);
        this.size = size;
        this.setupSize();
        this.setupMovement();
        this.setupAppearance();
        this.rotationSpeed = Physics.randomInRange(-2, 2);
    }

    setupSize() {
        switch (this.size) {
            case 'large':
                this.radius = 40;
                this.points = 20;
                break;
            case 'medium':
                this.radius = 25;
                this.points = 50;
                break;
            case 'small':
                this.radius = 15;
                this.points = 100;
                break;
        }
    }

    setupMovement() {
        const speed = this.size === 'large' ? 
            Physics.randomInRange(20, 50) :
            this.size === 'medium' ?
            Physics.randomInRange(50, 80) :
            Physics.randomInRange(80, 120);
            
        const angle = Physics.randomAngle();
        this.velocity = Vector2.fromAngle(angle, speed);
    }

    setupAppearance() {
        this.vertices = [];
        const numVertices = this.size === 'large' ? 12 : this.size === 'medium' ? 10 : 8;
        
        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            const radiusVariation = Physics.randomInRange(0.7, 1.3);
            const distance = this.radius * radiusVariation;
            
            this.vertices.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        super.update(deltaTime, canvasWidth, canvasHeight);
        this.rotation += this.rotationSpeed * deltaTime;
    }

    drawShape(ctx) {
        if (this.vertices.length === 0) return;
        
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        
        ctx.closePath();
        ctx.stroke();
    }

    split() {
        if (this.size === 'small') {
            return [];
        }

        const newSize = this.size === 'large' ? 'medium' : 'small';
        const fragments = [];
        
        for (let i = 0; i < 2; i++) {
            const fragment = new Asteroid(this.position.x, this.position.y, newSize);
            
            const angle = Physics.randomAngle();
            const speed = fragment.velocity.magnitude() * Physics.randomInRange(1.2, 1.8);
            fragment.velocity = Vector2.fromAngle(angle, speed);
            
            const offset = Vector2.fromAngle(angle, this.radius * 0.5);
            fragment.position = this.position.add(offset);
            
            fragments.push(fragment);
        }
        
        return fragments;
    }

    static createRandomAsteroid(canvasWidth, canvasHeight, excludeCenter = true) {
        let x, y;
        
        if (excludeCenter) {
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const safeDistance = 150;
            
            do {
                x = Physics.randomInRange(0, canvasWidth);
                y = Physics.randomInRange(0, canvasHeight);
            } while (
                Math.abs(x - centerX) < safeDistance && 
                Math.abs(y - centerY) < safeDistance
            );
        } else {
            x = Physics.randomInRange(0, canvasWidth);
            y = Physics.randomInRange(0, canvasHeight);
        }
        
        return new Asteroid(x, y, 'large');
    }

    static createFromEdge(canvasWidth, canvasHeight) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (side) {
            case 0: // Top
                x = Physics.randomInRange(0, canvasWidth);
                y = -50;
                break;
            case 1: // Right
                x = canvasWidth + 50;
                y = Physics.randomInRange(0, canvasHeight);
                break;
            case 2: // Bottom
                x = Physics.randomInRange(0, canvasWidth);
                y = canvasHeight + 50;
                break;
            case 3: // Left
                x = -50;
                y = Physics.randomInRange(0, canvasHeight);
                break;
        }
        
        return new Asteroid(x, y, 'large');
    }
}