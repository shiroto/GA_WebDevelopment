const DEFAULT_RADIUS = 10;

// Base class for all game objects. Has a sprite, position, radius, can be updated, destroyed and react to collisions.
export class Entity extends PIXI.utils.EventEmitter {
    constructor(ticker, parent, position, sprite) {
        super();
        console.log(`Creating ${this.constructor.name}`);
        this.ticker = ticker;
        this.updateEvent = this._update.bind(this);
        this.ticker.add(this.updateEvent);
        this.parent = parent;
        this.sprite = sprite;        
        this.positionOffset = vec2.fromValues(sprite.width / 2, sprite.height / 2); // Center of the sprite.
        this._setPosition(position);
        this.parent.addChild(this.sprite);
        this.radius = DEFAULT_RADIUS;
    }

    getPosition() {
        const pos = vec2.fromValues(this.sprite.x + this.positionOffset[0], this.sprite.y + this.positionOffset[1]);
        return pos;
    }

    _setPosition(vec2) {
        this.sprite.x = vec2[0] - this.positionOffset[0];
        this.sprite.y = vec2[1] - this.positionOffset[1];
    }

    destroy() {
        console.log(`Destroying ${this.constructor.name}`);
        this.ticker.remove(this.updateEvent);
        this.parent.removeChild(this.sprite);
        this.sprite.destroy();
        this.emit('onDestroyed', this);
    }

    onCollision(other) {
    }

    _update() {
    }
}