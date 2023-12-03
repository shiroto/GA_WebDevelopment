// Simple implementation of physics objects. All entities are considered to be circular.
export class CollisionSystem {
    constructor(ticker) {
        ticker.add((delta) => this._update(delta));
        this.layerEntities = [];
        this.layerEntities[0] = [];
        this.layerEntities[1] = [];
    }

    registerToPlayerLayer(entity) {
        this._registerToLayer(entity, 0);
    }

    registerToEnemyLayer(entity) {
        this._registerToLayer(entity, 1);
    }

    _update(delta) {
        const collisionPairs = [];
        this.layerEntities[0].forEach(e1 => {
            this.layerEntities[1].forEach(e2 => {
                const p1 = e1.getPosition();
                const p2 = e2.getPosition();
                const diff = vec2.create();
                vec2.sub(diff, p1, p2);
                if (vec2.len(diff) <= e1.radius + e2.radius) {
                    collisionPairs.push({ e1, e2 });
                }
            })
        });
        collisionPairs.forEach(pair => {
            pair.e1.onCollision(pair.e2);
            pair.e2.onCollision(pair.e1);
        });
    }

    _registerToLayer(entity, layer) {
        this.layerEntities[layer].push(entity);
        entity.on('onDestroyed', (entity) => {
            this._removeEntity(entity, layer);
        });
    }

    _removeEntity(entity, layer) {
        const layerArray = this.layerEntities[layer];
        const index = layerArray.indexOf(entity);
        if (index !== -1) {
            layerArray.splice(index, 1);
        }
    }
}