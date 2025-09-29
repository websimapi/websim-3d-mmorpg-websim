import * as THREE from 'three';
import { game } from './game.js';
import { getTerrainHeight } from './world.js';
import { updateQuestProgress, checkLevelUp } from './quests.js';
import { showFloatingText, addChatMessage, createSparkleEffect } from './ui.js';
import { playerDeath } from './player.js';

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

    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.5, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: type.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    enemyGroup.add(body);

    const eyeGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.8, 0.4);
    enemyGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.8, 0.4);
    enemyGroup.add(rightEye);

    let x, z;
    do {
        x = (Math.random() - 0.5) * 400;
        z = (Math.random() - 0.5) * 400;
    } while (Math.sqrt(x * x + z * z) < 20);

    enemyGroup.position.x = x;
    enemyGroup.position.z = z;
    enemyGroup.position.y = getTerrainHeight(x, z);

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
                    attackPlayer(enemy);
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

export function attackEnemy(enemy) {
    const currentTime = Date.now();
    if (currentTime - (game.playerData.lastAttack || 0) < 1500) return;

    const distance = game.player.position.distanceTo(enemy.position);
    if (distance > 5) {
        addChatMessage('System', 'Target too far away!', '#ff0000');
        return;
    }

    game.playerData.lastAttack = currentTime;
    game.ui.selectedTarget = enemy;

    const baseDamage = game.playerData.stats.strength * 2;
    const variance = (Math.random() - 0.5) * 20;
    const isCritical = Math.random() < 0.1;
    let damage = Math.floor(baseDamage + variance - (enemy.userData.defense || 0) * 0.5);

    if (isCritical) {
        damage *= 2;
    }

    damage = Math.max(1, damage);

    enemy.userData.health -= damage;

    showFloatingText(enemy.position, damage.toString(), isCritical ? '#ff8800' : '#ff4444');

    addChatMessage('System', '⚔️ sword swing', '#666666');

    if (enemy.userData.health <= 0) {
        killEnemy(enemy);
    } else {
        enemy.userData.state = 'chase';
        enemy.userData.target = game.player;
    }
}

export function killEnemy(enemy) {
    game.playerData.stats.xp += enemy.userData.xpReward;

    updateQuestProgress('kill', enemy.userData.enemyType);
    updateQuestProgress('kill', 'any');

    if (Math.random() < 0.4) {
        dropLoot(enemy.position);
    }

    const goldGain = Math.floor(Math.random() * 20) + 5;
    game.playerData.stats.gold += goldGain;

    showFloatingText(enemy.position, `+${enemy.userData.xpReward} XP`, '#ffff00');
    addChatMessage('System', `Defeated ${enemy.userData.enemyType}! Gained ${enemy.userData.xpReward} XP and ${goldGain} gold!`, '#00ff00');

    game.scene.remove(enemy);
    const index = game.world.enemies.indexOf(enemy);
    if (index > -1) {
        game.world.enemies.splice(index, 1);
    }

    if (game.ui.selectedTarget === enemy) {
        game.ui.selectedTarget = null;
        document.getElementById('targetFrame').style.display = 'none';
    }

    checkLevelUp();

    setTimeout(() => {
        const enemyTypes = [
            { name: 'Goblin', color: 0x8B4513, health: 60, damage: 8, xp: 15, level: 1 },
            { name: 'Orc', color: 0x556B2F, health: 100, damage: 15, xp: 25, level: 2 },
            { name: 'Troll', color: 0x2F4F4F, health: 180, damage: 25, xp: 40, level: 3 }
        ];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        createEnemy(type);
    }, 30000);
}

function attackPlayer(enemy) {
    const damage = Math.floor(enemy.userData.damage * (0.8 + Math.random() * 0.4));
    const actualDamage = Math.max(1, damage - game.playerData.stats.defense * 0.3);

    game.playerData.stats.health -= actualDamage;
    game.playerData.inCombat = true;

    showFloatingText(game.player.position, `-${actualDamage}`, '#ff0000');

    if (document.getElementById('cameraShake').checked) {
        game.cameraData.shake.intensity = 0.5;
        game.cameraData.shake.duration = 200;
    }

    addChatMessage('System', `${enemy.userData.enemyType} attacks you for ${actualDamage} damage!`, '#ff4444');

    setTimeout(() => {
        game.playerData.inCombat = false;
    }, 5000);

    if (game.playerData.stats.health <= 0) {
        playerDeath();
    }
}

function dropLoot(position) {
    const lootTypes = [
        { type: 'potion', name: 'Health Potion', effect: 'heal', value: 50, icon: '🧪', rarity: 'common', chance: 0.3 },
        { type: 'potion', name: 'Mana Potion', effect: 'mana', value: 30, icon: '🔮', rarity: 'common', chance: 0.2 },
        { type: 'weapon', name: 'Iron Sword', damage: 10, icon: '⚔️', rarity: 'uncommon', chance: 0.15 },
        { type: 'armor', name: 'Leather Vest', defense: 5, icon: '🛡️', rarity: 'common', chance: 0.15 },
        { type: 'accessory', name: 'Power Ring', strength: 3, icon: '💍', rarity: 'rare', chance: 0.05 }
    ];

    const availableItems = lootTypes.filter(item => Math.random() < item.chance);
    if (availableItems.length === 0) return;

    const item = availableItems[Math.floor(Math.random() * availableItems.length)];

    const lootGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const lootMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const lootBag = new THREE.Mesh(lootGeometry, lootMaterial);

    lootBag.position.copy(position);
    lootBag.position.y += 0.5;
    lootBag.userData = { type: 'loot', item: item };

    game.scene.add(lootBag);
    game.world.objects.push(lootBag);

    createSparkleEffect(position);
}