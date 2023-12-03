import { Entity } from "./entity.js";

const SPEED = 10;

export class Bullet extends Entity {
    constructor(ticker, parent, position, sprite, bounds) {
        super(ticker, parent, position, sprite);
        this.bounds = bounds;
    }

    _update(delta) {
        this.sprite.x += SPEED * delta;
        this._checkBounds();
    }

    onCollision(other) {
        this.destroy();
    }

    _checkBounds() {
        if (this.sprite.x > this.bounds[2]) {
            this.destroy();
        }
    }
}