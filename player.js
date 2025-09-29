import { game } from './game.js';
import { getTerrainHeight } from './world.js';
import { updateQuestProgress, checkLevelUp } from './ui.js';

export function createPlayer() {
    const playerGroup = new THREE.Group();

    // Head
    const headGeometry = new THREE.SphereGeometry(0.8, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: game.playerData.appearance.skinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    head.castShadow = true;
    playerGroup.add(head);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.8, 2, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    playerGroup.add(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6);
    const armMaterial = new THREE.MeshLambertMaterial({ color: game.playerData.appearance.skinColor });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1, 1.5, 0);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1, 1.5, 0);
    rightArm.castShadow = true;
    playerGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.5, 6);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -0.25, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -0.25, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);

    // Hair (if not bald)
    if (game.playerData.appearance.hairStyle !== 'bald') {
        let hairGeometry;
        switch (game.playerData.appearance.hairStyle) {
            case 'short':
                hairGeometry = new THREE.SphereGeometry(0.85, 8, 6);
                break;
            case 'long':
                hairGeometry = new THREE.CylinderGeometry(0.8, 0.9, 1.5, 8);
                break;
            case 'curly':
                hairGeometry = new THREE.SphereGeometry(1, 8, 6);
                break;
            case 'spiky':
                hairGeometry = new THREE.ConeGeometry(0.8, 1.2, 8);
                break;
        }

        const hairMaterial = new THREE.MeshLambertMaterial({ color: game.playerData.appearance.hairColor });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 2.8;
        hair.castShadow = true;
        playerGroup.add(hair);
    }

    // Position player
    playerGroup.position.set(0, 0, 0);
    playerGroup.userData = { type: 'player', health: game.playerData.stats.health };

    game.player = playerGroup;
    game.scene.add(playerGroup);
}

export function initializePlayer() {
    // Controls
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', onMouseClick);
}

export function updatePlayer() {
    const deltaTime = game.time.deltaTime;
    const moveSpeed = 5;
    const sprintMultiplier = 1.8;

    // Calculate movement
    const movement = new THREE.Vector3();

    if (game.controls.forward) movement.z -= 1;
    if (game.controls.backward) movement.z += 1;
    if (game.controls.left) movement.x -= 1;
    if (game.controls.right) movement.x += 1;

    if (movement.length() > 0) {
        movement.normalize();

        let currentSpeed = moveSpeed;

        // Sprint logic
        if (game.controls.sprint && game.playerData.stats.stamina > 0) {
            currentSpeed *= sprintMultiplier;
            game.playerData.stats.stamina -= 20 * deltaTime;
            document.getElementById('staminaBar').style.display = 'block';
        } else {
            document.getElementById('staminaBar').style.display = 'none';
        }

        // Apply movement
        const velocity = movement.multiplyScalar(currentSpeed * deltaTime);
        game.player.position.add(velocity);

        // Keep player on terrain
        game.player.position.y = getTerrainHeight(game.player.position.x, game.player.position.z);

        // Update quest progress for exploration
        updateQuestProgress('explore');
    }

    // Jump logic
    if (game.controls.jump && game.player.userData.grounded !== false) {
        game.player.userData.jumpVelocity = 8;
        game.player.userData.grounded = false;
    }

    // Apply gravity and jumping
    if (game.player.userData.jumpVelocity !== undefined) {
        game.player.position.y += game.player.userData.jumpVelocity * deltaTime;
        game.player.userData.jumpVelocity -= 20 * deltaTime; // gravity

        const groundHeight = getTerrainHeight(game.player.position.x, game.player.position.z);
        if (game.player.position.y <= groundHeight) {
            game.player.position.y = groundHeight;
            game.player.userData.jumpVelocity = undefined;
            game.player.userData.grounded = true;
        }
    }

    // Regeneration
    const regenRate = deltaTime;

    // Health regen (when not in combat)
    if (!game.playerData.inCombat) {
        game.playerData.stats.health = Math.min(
            game.playerData.stats.maxHealth,
            game.playerData.stats.health + 2 * regenRate
        );
    }

    // Mana regen
    game.playerData.stats.mana = Math.min(
        game.playerData.stats.maxMana,
        game.playerData.stats.mana + 1 * regenRate
    );

    // Stamina regen (when not sprinting)
    if (!game.controls.sprint) {
        game.playerData.stats.stamina = Math.min(
            game.playerData.stats.maxStamina,
            game.playerData.stats.stamina + 10 * regenRate
        );
    }

    // Clamp stats
    game.playerData.stats.health = Math.max(0, game.playerData.stats.health);
    game.playerData.stats.mana = Math.max(0, game.playerData.stats.mana);
    game.playerData.stats.stamina = Math.max(0, game.playerData.stats.stamina);
}

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            game.controls.forward = true;
            break;
        case 'KeyS':
            game.controls.backward = true;
            break;
        case 'KeyA':
            game.controls.left = true;
            break;
        case 'KeyD':
            game.controls.right = true;
            break;
        case 'Space':
            event.preventDefault();
            game.controls.jump = true;
            break;
        case 'ShiftLeft':
            game.controls.sprint = true;
            break;
        case 'KeyI':
            toggleInventory();
            break;
        case 'Escape':
            toggleSettings();
            break;
        case 'KeyE':
            interactWithNearby();
            break;
        // Skill keys
        case 'Digit1':
            useSkill(0);
            break;
        case 'Digit2':
            useSkill(1);
            break;
        case 'Digit3':
            useSkill(2);
            break;
        case 'Digit4':
            useSkill(3);
            break;
        case 'Digit5':
            useSkill(4);
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            game.controls.forward = false;
            break;
        case 'KeyS':
            game.controls.backward = false;
            break;
        case 'KeyA':
            game.controls.left = false;
            break;
        case 'KeyD':
            game.controls.right = false;
            break;
        case 'Space':
            game.controls.jump = false;
            break;
        case 'ShiftLeft':
            game.controls.sprint = false;
            break;
    }
}

function onMouseClick(event) {
    if (event.target.id === 'gameCanvas') {
        // Check for enemy click
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, game.camera);

        const enemies = game.world.enemies.filter(enemy => enemy.userData.health > 0);
        const intersects = raycaster.intersectObjects(enemies, true);

        if (intersects.length > 0) {
            const enemy = intersects[0].object.parent;
            if (enemy.userData.type === 'enemy') {
                attackEnemy(enemy);
                game.ui.selectedTarget = enemy;
            }
        }
    }
}

export function attackEnemy(enemy) {
    const currentTime = Date.now();
    
    // Check attack cooldown
    if (currentTime - (game.playerData.lastAttack || 0) < 1500) {
        return;
    }

    game.playerData.lastAttack = currentTime;

    // Calculate damage
    const baseDamage = game.playerData.stats.strength * 2;
    const variance = Math.random() * 0.2 - 0.1; // ±10%
    const isCritical = Math.random() < 0.1; // 10% crit chance
    
    let damage = Math.floor(baseDamage * (1 + variance));
    if (isCritical) damage *= 2;

    // Apply defense
    damage = Math.max(1, damage - enemy.userData.damage * 0.1);

    // Deal damage
    enemy.userData.health -= damage;

    // Show damage number
    const color = isCritical ? '#ff8800' : '#ff4444';
    showFloatingText(enemy.position, `-${damage}`, color);

    // Update quest progress
    updateQuestProgress('attack');

    addChatMessage('System', `You attack ${enemy.userData.enemyType} for ${damage} damage!`, '#ffaa00');

    // Check if enemy died
    if (enemy.userData.health <= 0) {
        enemyDied(enemy);
    }
}

function enemyDied(enemy) {
    // Give XP
    game.playerData.stats.xp += enemy.userData.xpReward;
    
    // Update quest progress
    updateQuestProgress('kill', enemy.userData.enemyType);
    
    // Drop loot
    dropLoot(enemy.position);
    
    // Death animation
    const startScale = enemy.scale.x;
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / 500; // 0.5 second animation
        
        if (progress >= 1) {
            // Remove enemy
            game.scene.remove(enemy);
            const index = game.world.enemies.indexOf(enemy);
            if (index > -1) {
                game.world.enemies.splice(index, 1);
            }
            return;
        }
        
        const scale = startScale * (1 - progress);
        enemy.scale.setScalar(scale);
        
        requestAnimationFrame(animate);
    };
    
    animate();
    
    addChatMessage('System', `${enemy.userData.enemyType} defeated! Gained ${enemy.userData.xpReward} XP!`, '#00ff00');
    checkLevelUp();
}

function dropLoot(position) {
    const dropChance = Math.random();
    
    if (dropChance < 0.3) { // 30% chance for health potion
        createLootDrop(position, {
            type: 'potion',
            name: 'Health Potion',
            effect: 'heal',
            value: 50,
            icon: '🧪',
            rarity: 'common'
        });
    } else if (dropChance < 0.5) { // 20% chance for mana potion
        createLootDrop(position, {
            type: 'potion',
            name: 'Mana Potion',
            effect: 'mana',
            value: 30,
            icon: '🔮',
            rarity: 'common'
        });
    } else if (dropChance < 0.6) { // 10% chance for equipment
        const equipment = generateRandomEquipment();
        createLootDrop(position, equipment);
    }
    
    // Always drop some gold
    const goldAmount = Math.floor(Math.random() * 20) + 5;
    game.playerData.stats.gold += goldAmount;
    showFloatingText(position, `+${goldAmount} gold`, '#ffd700');
}

function createLootDrop(position, item) {
    const lootGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const lootMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const loot = new THREE.Mesh(lootGeometry, lootMaterial);
    
    loot.position.copy(position);
    loot.position.y = getTerrainHeight(position.x, position.z) + 0.5;
    
    loot.userData = {
        type: 'loot',
        item: item,
        createdAt: Date.now()
    };
    
    game.scene.add(loot);
    game.world.objects.push(loot);
    
    // Auto-pickup after 10 seconds
    setTimeout(() => {
        game.scene.remove(loot);
        const index = game.world.objects.indexOf(loot);
        if (index > -1) {
            game.world.objects.splice(index, 1);
        }
    }, 10000);
}

function generateRandomEquipment() {
    const equipmentTypes = [
        { type: 'weapon', name: 'Rusty Sword', damage: 8, icon: '⚔️' },
        { type: 'weapon', name: 'Sharp Dagger', damage: 6, icon: '🗡️' },
        { type: 'armor', name: 'Leather Vest', defense: 5, icon: '🛡️' },
        { type: 'armor', name: 'Chain Mail', defense: 8, icon: '⚙️' }
    ];
    
    const baseItem = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
    return { ...baseItem, rarity: 'common' };
}