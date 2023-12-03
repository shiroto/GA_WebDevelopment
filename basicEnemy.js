import { Entity } from "./entity.js";

const SPEED = 2;

export class BasicEnemy extends Entity {
    constructor(ticker, parent, position, sprite, bounds) {
        super(ticker, parent, position, sprite);
        this.bounds = bounds;
    }

    onCollision(other) {
        this.destroy();
    }

    _update(delta) {
        this.sprite.x -= SPEED * delta;
        this._checkBounds();
    }

    _checkBounds() {
        const pos = this.getPosition();
        if (pos[0] + this.radius < this.bounds[0]) {
            this.destroy();
        }
    }
}