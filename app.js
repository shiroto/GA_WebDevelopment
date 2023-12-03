import { Background } from './background.js';
import { Player } from './player.js';
import { InputHandler } from './inputHandler.js';
import { BulletFactory } from './bulletFactory.js';
import { CollisionSystem } from './collisionSystem.js';
import { EnemySpawner } from './enemySpawner.js';

const BOUNDS = vec4.fromValues(0, 0, 1280, 800);

async function _loadShipSpriteSheet() {
    await PIXI.Assets.load([
        '/Graphics/ships_data.json',
        '/Graphics/ships_data.png'
    ]);
}

async function _initBackground() {
    const bg = new Background(app.stage);
    await bg.load(PIXI.Assets);
    app.ticker.add((delta) => bg.update(delta));
}

function _initPlayer(input) {
    const bulletFactory = new BulletFactory(app.ticker, collisionSystem, app.stage, "bullet1.png", BOUNDS);
    const startPos = vec2.fromValues(50, app.screen.height / 2);
    const sprite = PIXI.Sprite.from("ship1.png");
    const player = new Player(app.ticker, app.stage, startPos, sprite, input, BOUNDS, bulletFactory);
    collisionSystem.registerToPlayerLayer(player);
}

function _initEnemySpawner() {
    const level1Spawner = new EnemySpawner(app.ticker, app.stage, BOUNDS, collisionSystem, "ENDLESS");
}

const app = new PIXI.Application({
    background: '#1099bb',
    width: BOUNDS[2],
    height: BOUNDS[3]
});
document.body.appendChild(app.view);

const input = new InputHandler(window);
const collisionSystem = new CollisionSystem(app.ticker);
await _loadShipSpriteSheet();
await _initBackground();
_initPlayer(input);
_initEnemySpawner();
