import { BasicEnemy } from './basicEnemy.js';

class SpawnInfo {
    constructor(time, enemy, position) {
        this.time = time;
        this.enemy = enemy;
        this.position = position;
    }
}

class EnemyFactory {
    constructor(ticker, parent, texPath, bounds, collisionSystem) {
        this.ticker = ticker;
        this.parent = parent;
        this.texPath = texPath;
        this.bounds = bounds;
        this.collisionSystem = collisionSystem;
    }

    spawn(spawnInfo) {
        const x = (this.bounds[2] - this.bounds[0]) * spawnInfo.position[0];
        const y = (this.bounds[3] - this.bounds[1]) * spawnInfo.position[1];
        const position = vec2.fromValues(x, y);
        const enemy = new BasicEnemy(this.ticker, this.parent, position, PIXI.Sprite.from(this.texPath), this.bounds);
        this.collisionSystem.registerToEnemyLayer(enemy);
    }
}

const SPAWN_X = 1.1;

export class EnemySpawner {
    constructor(ticker, parent, bounds, collisionSystem, level) {
        ticker.add((delta) => this._update(delta));
        this.BasicEnemy = new EnemyFactory(ticker, parent, "enemy1.png", bounds, collisionSystem);
        this.currentIndex = 0;
        this.level = Levels[level];
        this.time = 0;
    }

    _update(delta) {
        this.time += delta;
        const nextSpawn = this.level.get(this.currentIndex);
        if (nextSpawn != undefined && this.time >= nextSpawn.time) {
            console.log(`Spawn ${this.currentIndex}`);
            this[nextSpawn.enemy].spawn(nextSpawn);
            this.currentIndex++;
        }
    }
}

class Levels {
    static ENDLESS = {
        frequency: 100,
        yMin: 0.1,
        yRange: 0.8,
        get(index) {            
            const y = this.yMin + Math.random() * this.yRange;
            return new SpawnInfo(this.frequency * index, "BasicEnemy", vec2.fromValues(SPAWN_X, y));
        }
    }

    static LEVEL_1 = {
        enemies: [
            new SpawnInfo(200, "BasicEnemy", vec2.fromValues(SPAWN_X, 0.5)),
            new SpawnInfo(300, "BasicEnemy", vec2.fromValues(SPAWN_X, 0.25)),
            new SpawnInfo(400, "BasicEnemy", vec2.fromValues(SPAWN_X, 0.75)),
        ],
        get(index) {
            return this.enemies[index];
        }
    }
}