import { game } from '../core/gameState.js';

export function initializeEnemies() {
    for (let i = 0; i < 20; i++) {
        createEnemy();
    }
}

function createEnemy() {
    const group = new THREE.Group();

    // Body (using CylinderGeometry instead of CapsuleGeometry)
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 0.8, 3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.8, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3.5;
    head.castShadow = true;
    group.add(head);

    // Random position
    group.position.x = (Math.random() - 0.5) * 300;
    group.position.z = (Math.random() - 0.5) * 300;
    group.position.y = 1.5;

    // Enemy properties
    group.userData = {
        type: 'enemy',
        health: 50 + Math.random() * 50,
        maxHealth: 50 + Math.random() * 50,
        damage: 5 + Math.random() * 10,
        xpReward: 10 + Math.random() * 20,
        state: 'idle',
        spawnPosition: group.position.clone(),
        lastAttack: 0,
        aggroRange: 15,
        attackRange: 2,
        speed: 3
    };

    game.scene.add(group);
    game.world.enemies.push(group);
}

export function updateEnemies(deltaTime) {
    game.world.enemies.forEach(enemy => {
        if (!enemy.userData) return;

        const distanceToPlayer = enemy.position.distanceTo(game.player.position);
        const distanceToSpawn = enemy.position.distanceTo(enemy.userData.spawnPosition);

        switch (enemy.userData.state) {
            case 'idle':
                if (distanceToPlayer <= enemy.userData.aggroRange) {
                    enemy.userData.state = 'chase';
                } else {
                    // Wander randomly
                    if (Math.random() < 0.01 && distanceToSpawn < 5) {
                        const direction = new THREE.Vector3(
                            (Math.random() - 0.5) * 2,
                            0,
                            (Math.random() - 0.5) * 2
                        ).normalize();
                        enemy.position.add(direction.multiplyScalar(deltaTime));
                    }
                }
                break;

            case 'chase':
                if (distanceToPlayer > enemy.userData.aggroRange + 5) {
                    enemy.userData.state = 'return';
                } else if (distanceToPlayer <= enemy.userData.attackRange) {
                    enemy.userData.state = 'attack';
                } else {
                    // Move toward player
                    const direction = new THREE.Vector3()
                        .subVectors(game.player.position, enemy.position)
                        .normalize();
                    enemy.position.add(direction.multiplyScalar(enemy.userData.speed * deltaTime));
                    enemy.lookAt(game.player.position);
                }
                break;

            case 'attack':
                if (distanceToPlayer > enemy.userData.attackRange) {
                    enemy.userData.state = 'chase';
                } else {
                    const now = Date.now();
                    if (now - enemy.userData.lastAttack > 2000) {
                        attackPlayer(enemy);
                        enemy.userData.lastAttack = now;
                    }
                }
                break;

            case 'return':
                if (distanceToSpawn < 1) {
                    enemy.userData.state = 'idle';
                    // Restore health gradually
                    enemy.userData.health = Math.min(
                        enemy.userData.maxHealth,
                        enemy.userData.health + 5 * deltaTime
                    );
                } else {
                    const direction = new THREE.Vector3()
                        .subVectors(enemy.userData.spawnPosition, enemy.position)
                        .normalize();
                    enemy.position.add(direction.multiplyScalar(enemy.userData.speed * deltaTime));
                }
                break;
        }
    });
}

function attackPlayer(enemy) {
    const damage = enemy.userData.damage;
    game.playerData.stats.health = Math.max(0, game.playerData.stats.health - damage);

    // Screen shake
    game.cameraData.shake.intensity = 2;
    game.cameraData.shake.duration = 0.2;

    showDamageNumber(damage, game.player.position, 'damage-normal');
}

function showDamageNumber(damage, position, className) {
    const damageElement = document.createElement('div');
    damageElement.className = `damage-number ${className}`;
    damageElement.textContent = Math.floor(damage);

    // Position on screen
    const vector = position.clone().project(game.camera);
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

    damageElement.style.left = x + 'px';
    damageElement.style.top = y + 'px';

    document.body.appendChild(damageElement);

    // Animate upward and fade out
    let offsetY = 0;
    let opacity = 1;
    const animateInterval = setInterval(() => {
        offsetY -= 2;
        opacity -= 0.02;
        damageElement.style.transform = `translateY(${offsetY}px)`;
        damageElement.style.opacity = opacity;

        if (opacity <= 0) {
            clearInterval(animateInterval);
            document.body.removeChild(damageElement);
        }
    }, 16);
}