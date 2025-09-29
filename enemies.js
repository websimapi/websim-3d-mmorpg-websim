import { game } from './game.js';
import { getTerrainHeight } from './world.js';
import { showFloatingText, updateQuestProgress, checkLevelUp } from './ui.js';
import { addChatMessage } from './chat.js';

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

function createEnemy(type) {
    const enemyGroup = new THREE.Group();

    // Body (different shape for different enemies)
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
    } while (Math.sqrt(x * x + z * z) < 20); // At least 20 units from center

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
                    // Return to spawn
                    enemy.userData.state = 'returning';
                } else {
                    // Random wandering
                    if (Math.random() < 0.01) { // 1% chance per frame to change direction
                        const angle = Math.random() * Math.PI * 2;
                        enemy.userData.wanderTarget.set(
                            enemy.position.x + Math.cos(angle) * 3,
                            0,
                            enemy.position.z + Math.sin(angle) * 3
                        );
                    }

                    // Move toward wander target
                    const direction = new THREE.Vector3()
                        .subVectors(enemy.userData.wanderTarget, enemy.position)
                        .normalize();
                    enemy.position.add(direction.multiplyScalar(1 * deltaTime));
                }

                // Check for player in aggro range
                if (playerDistance <= enemy.userData.aggroRange) {
                    enemy.userData.state = 'chase';
                    enemy.userData.target = game.player;
                }
                break;

            case 'chase':
                // Move toward player
                if (playerDistance <= 2) {
                    enemy.userData.state = 'attack';
                } else if (playerDistance > enemy.userData.returnRange) {
                    enemy.userData.state = 'returning';
                } else {
                    const direction = new THREE.Vector3()
                        .subVectors(game.player.position, enemy.position)
                        .normalize();
                    enemy.position.add(direction.multiplyScalar(3 * deltaTime));

                    // Look at player
                    enemy.lookAt(game.player.position);
                }
                break;

            case 'attack':
                // Attack player if in range
                if (playerDistance > 3) {
                    enemy.userData.state = 'chase';
                } else if (currentTime - enemy.userData.lastAttack > 2000) { // Attack every 2 seconds
                    attackPlayer(enemy);
                    enemy.userData.lastAttack = currentTime;
                }
                break;

            case 'returning':
                // Return to spawn point
                const spawnPos = new THREE.Vector3(
                    enemy.userData.spawnPosition.x,
                    enemy.userData.spawnPosition.y,
                    enemy.userData.spawnPosition.z
                );

                const returnDistance = enemy.position.distanceTo(spawnPos);
                if (returnDistance < 1) {
                    enemy.userData.state = 'idle';
                    // Slowly regenerate health
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

        // Keep enemy on terrain
        enemy.position.y = getTerrainHeight(enemy.position.x, enemy.position.z);
    });
}

function attackPlayer(enemy) {
    const damage = Math.floor(enemy.userData.damage * (0.8 + Math.random() * 0.4)); // ±20% variance
    const actualDamage = Math.max(1, damage - game.playerData.stats.defense * 0.3);

    game.playerData.stats.health -= actualDamage;
    game.playerData.inCombat = true;

    // Show damage
    showFloatingText(game.player.position, `-${actualDamage}`, '#ff0000');

    // Screen shake
    if (document.getElementById('cameraShake').checked) {
        game.cameraData.shake.intensity = 0.5;
        game.cameraData.shake.duration = 200;
    }

    addChatMessage('System', `${enemy.userData.enemyType} attacks you for ${actualDamage} damage!`, '#ff4444');

    // Clear combat state after 5 seconds
    setTimeout(() => {
        game.playerData.inCombat = false;
    }, 5000);

    // Check for death
    if (game.playerData.stats.health <= 0) {
        playerDeath();
    }
}

function playerDeath() {
    addChatMessage('System', 'You have died! Respawning...', '#ff0000');

    // Respawn after 5 seconds
    setTimeout(() => {
        game.player.position.set(0, 0, 0);
        game.player.position.y = getTerrainHeight(0, 0);

        game.playerData.stats.health = Math.floor(game.playerData.stats.maxHealth * 0.5);
        game.playerData.stats.xp = Math.floor(game.playerData.stats.xp * 0.9); // Lose 10% XP
        game.playerData.stats.gold = Math.floor(game.playerData.stats.gold * 0.9); // Lose 10% gold

        addChatMessage('System', 'You have respawned at the starting location.', '#ffff00');
    }, 5000);
}