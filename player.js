import { Entity } from "./entity.js";

const MAX_SPEED = 8;
const ACCELERATION = 0.45;
const FIRE_COOLDOWN = 500;
const RADIUS = 20;
const BUTTONS = {
    UP: 'KeyW',
    DOWN: 'KeyS',
    LEFT: 'KeyA',
    RIGHT: 'KeyD',
    FIRE: 'Space'
};

export class Player extends Entity {
    constructor(ticker, parent, position, sprite, input, bounds, bulletFactory) {
        super(ticker, parent, position, sprite);
        this.input = input;
        this.bounds = bounds;
        this.bulletFactory = bulletFactory;
        this.velocity = vec2.create();
        this.lastFire = 0;
        this.radius = RADIUS
    }

    _update(delta) {
        this._processMovement(delta);
        const time = performance.now();
        if (this.input[BUTTONS.FIRE] === true && time - this.lastFire > FIRE_COOLDOWN) {
            this.lastFire = time;
            const pos = this.getPosition();
            this.bulletFactory.createBullet(pos);
        }
    }

    _processMovement(delta) {
        const inputVector = this._getInputVector();
        const accel = vec2.create();
        vec2.normalize(inputVector, inputVector);
        vec2.scale(accel, inputVector, MAX_SPEED);
        this._moveTowards(this.velocity, accel, ACCELERATION * delta);
        this._checkBounds();
        this.sprite.x += this.velocity[0];
        this.sprite.y += this.velocity[1];
    }

    _getInputVector() {
        return vec2.fromValues(this._getXInput(), this._getYInput());
    }

    _getXInput() {
        if (this.input[BUTTONS.LEFT] === true) {
            return -1;
        } else if (this.input[BUTTONS.RIGHT] === true) {
            return 1;
        } else {
            return 0;
        }
    }

    _getYInput() {
        if (this.input[BUTTONS.UP] === true) {
            return -1;
        } else if (this.input[BUTTONS.DOWN] === true) {
            return 1;
        } else {
            return 0;
        }
    }

    _moveTowards(current, target, maxChange) {
        const direction = vec2.subtract(vec2.create(), target, current);
        const distance = vec2.length(direction);
        if (distance > maxChange) {
            vec2.normalize(direction, direction);
            vec2.scale(direction, direction, maxChange);
            vec2.add(current, current, direction);
        } else {
            vec2.copy(current, target);
        }
    }

    _checkBounds() {
        const pos = this.getPosition();
        if (pos[0] - this.radius < this.bounds[0] && this.velocity[0] < 0) {
            this.velocity[0] = 0;
        } else if (pos[0] + this.radius > this.bounds[2] && this.velocity[0] > 0) {
            this.velocity[0] = 0;
        }
        if (pos[1] - this.radius < this.bounds[1] && this.velocity[1] < 0) {
            this.velocity[1] = 0;
        } else if (pos[1] + this.radius > this.bounds[3] && this.velocity[1] > 0) {
            this.velocity[1] = 0;
        }
    }
}