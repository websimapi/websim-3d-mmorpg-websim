import { game } from './game.js';
import { getTerrainHeight } from './world.js';

export function initializeEnemies() {
    const enemyTypes = [
        { name: 'Goblin', color: 0x8B4513, health: 60, damage: 8, xp: 15, level: 1 },
        { name: 'Orc', color: 0x556B2F, health: 100, damage: 15, xp: 25, level: 2 },
        { name: 'Troll', color: 0x2F4F4F, health: 180, damage: 25, xp: 40, level: 3 }
    ];

    for (let i = 0; i < 25; i++) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        createEnemy(type);
    }
}

export function createEnemy(type) {
    const enemyGroup = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.5, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: type.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    enemyGroup.add(body);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.8, 0.4);
    enemyGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.8, 0.4);
    enemyGroup.add(rightEye);

    // Random position (away from player)
    let x, z;
    do {
        x = (Math.random() - 0.5) * 400;
        z = (Math.random() - 0.5) * 400;
    } while (Math.sqrt(x * x + z * z) < 20);

    enemyGroup.position.x = x;
    enemyGroup.position.z = z;
    enemyGroup.position.y = getTerrainHeight(x, z);

    // Enemy data
    enemyGroup.userData = {
        type: 'enemy',
        enemyType: type.name,
        health: type.health,
        maxHealth: type.health,
        damage: type.damage,
        xpReward: type.xp,
        level: type.level,
        state: 'idle',
        spawnPosition: { x, y: enemyGroup.position.y, z },
        lastAttack: 0,
        target: null,
        moveDirection: new THREE.Vector3(),
        wanderTarget: new THREE.Vector3(x, 0, z),
        aggroRange: 15,
        returnRange: 25
    };

    game.world.enemies.push(enemyGroup);
    game.scene.add(enemyGroup);
}

export function updateEnemies() {
    const deltaTime = game.time.deltaTime;
    const currentTime = Date.now();

    game.world.enemies.forEach(enemy => {
        if (enemy.userData.health <= 0) return;

        const playerDistance = enemy.position.distanceTo(game.player.position);

        switch (enemy.userData.state) {
            case 'idle':
                // Wander around spawn point
                const spawnDistance = enemy.position.distanceTo(new THREE.Vector3(
                    enemy.userData.spawnPosition.x,
                    enemy.userData.spawnPosition.y,
                    enemy.userData.spawnPosition.z
                ));

                if (spawnDistance > 5) {
                    enemy.userData.state = 'returning';
                } else {
                    if (Math.random() < 0.01) {
                        const angle = Math.random() * Math.PI * 2;
                        enemy.userData.wanderTarget.set(
                            enemy.position.x + Math.cos(angle) * 3,
                            0,
                            enemy.position.z + Math.sin(angle) * 3
                        );
                    }

                    const direction = new THREE.Vector3()
                        .subVectors(enemy.userData.wanderTarget, enemy.position)
                        .normalize();
                    enemy.position.add(direction.multiplyScalar(1 * deltaTime));
                }

                if (playerDistance <= enemy.userData.aggroRange) {
                    enemy.userData.state = 'chase';
                    enemy.userData.target = game.player;
                }
                break;

            case 'chase':
                if (playerDistance <= 2) {
                    enemy.userData.state = 'attack';
                } else if (playerDistance > enemy.userData.returnRange) {
                    enemy.userData.state = 'returning';
                } else {
                    const direction = new THREE.Vector3()
                        .subVectors(game.player.position, enemy.position)
                        .normalize();
                    enemy.position.add(direction.multiplyScalar(3 * deltaTime));
                    enemy.lookAt(game.player.position);
                }
                break;

            case 'attack':
                if (playerDistance > 3) {
                    enemy.userData.state = 'chase';
                } else if (currentTime - enemy.userData.lastAttack > 2000) {
                    import('./combat.js').then(module => module.attackPlayer(enemy));
                    enemy.userData.lastAttack = currentTime;
                }
                break;

            case 'returning':
                const spawnPos = new THREE.Vector3(
                    enemy.userData.spawnPosition.x,
                    enemy.userData.spawnPosition.y,
                    enemy.userData.spawnPosition.z
                );

                const returnDistance = enemy.position.distanceTo(spawnPos);
                if (returnDistance < 1) {
                    enemy.userData.state = 'idle';
                    enemy.userData.health = Math.min(
                        enemy.userData.maxHealth,
                        enemy.userData.health + 5 * deltaTime
                    );
                } else {
                    const direction = new THREE.Vector3()
                        .subVectors(spawnPos, enemy.position)
                        .normalize();
                    enemy.position.add(direction.multiplyScalar(4 * deltaTime));
                }
                break;
        }

        enemy.position.y = getTerrainHeight(enemy.position.x, enemy.position.z);
    });
}