import { Bullet } from "./bullet.js";

export class BulletFactory {
    constructor(ticker, collisionSystem, parent, texturePath, bounds) {
        this.ticker = ticker;
        this.collisionSystem = collisionSystem;
        this.parent = parent;
        this.texturePath = texturePath;
        this.bounds = bounds;
    }

    createBullet(position) {
        const bullet = new Bullet(this.ticker, this.parent, position, PIXI.Sprite.from(this.texturePath), this.bounds);
        this.collisionSystem.registerToPlayerLayer(bullet);
        return bullet;
    }
}