import { game } from './game.js';
import { getTerrainHeight } from './world.js';
import { updateCamera } from './camera.js';

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

    // Position camera
    updateCamera();
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
        import('./quests.js').then(module => module.updateQuestProgress('explore'));
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

export function playerDeath() {
    import('./chat.js').then(module => 
        module.addChatMessage('System', 'You have died! Respawning...', '#ff0000')
    );

    // Respawn after 5 seconds
    setTimeout(() => {
        game.player.position.set(0, 0, 0);
        game.player.position.y = getTerrainHeight(0, 0);

        game.playerData.stats.health = Math.floor(game.playerData.stats.maxHealth * 0.5);
        game.playerData.stats.xp = Math.floor(game.playerData.stats.xp * 0.9);
        game.playerData.stats.gold = Math.floor(game.playerData.stats.gold * 0.9);

        import('./chat.js').then(module => 
            module.addChatMessage('System', 'You have respawned at the starting location.', '#ffff00')
        );

        import('./ui.js').then(module => module.updateUI());
    }, 5000);
}