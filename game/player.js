import { game } from '../core/gameState.js';

export function createPlayer() {
    const group = new THREE.Group();

    // Head
    const headGeometry = new THREE.SphereGeometry(1, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ 
        color: game.playerData.appearance.skinColor 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 4;
    head.castShadow = true;
    group.add(head);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 1.2, 3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    group.add(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2.5);
    const armMaterial = new THREE.MeshLambertMaterial({ 
        color: game.playerData.appearance.skinColor 
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.5, 2, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.5, 2, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.4, 0.4, 2.5);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.6, -1.5, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.6, -1.5, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    game.player = group;
    game.scene.add(group);

    // Initialize camera position
    updateCamera();
}

export function updatePlayer(deltaTime) {
    if (!game.player) return;

    const speed = game.controls.sprint ? 9 : 5;
    const moveDistance = speed * deltaTime;

    const direction = new THREE.Vector3();

    if (game.controls.forward) direction.z -= 1;
    if (game.controls.backward) direction.z += 1;
    if (game.controls.left) direction.x -= 1;
    if (game.controls.right) direction.x += 1;

    if (direction.length() > 0) {
        direction.normalize();
        game.player.position.add(direction.multiplyScalar(moveDistance));

        // Update player data position
        game.playerData.position.x = game.player.position.x;
        game.playerData.position.z = game.player.position.z;

        // Drain stamina if sprinting
        if (game.controls.sprint) {
            game.playerData.stats.stamina = Math.max(0, game.playerData.stats.stamina - 20 * deltaTime);
        }
    }

    // Regenerate stamina
    if (!game.controls.sprint) {
        game.playerData.stats.stamina = Math.min(
            game.playerData.stats.maxStamina,
            game.playerData.stats.stamina + 10 * deltaTime
        );
    }

    // Health and mana regeneration
    if (game.playerData.stats.health < game.playerData.stats.maxHealth) {
        game.playerData.stats.health = Math.min(
            game.playerData.stats.maxHealth,
            game.playerData.stats.health + 2 * deltaTime
        );
    }

    game.playerData.stats.mana = Math.min(
        game.playerData.stats.maxMana,
        game.playerData.stats.mana + 1 * deltaTime
    );

    updateCamera();
}

export function updateCamera() {
    if (!game.player || !game.camera) return;

    const offset = game.cameraData.offset;
    const shake = game.cameraData.shake;

    const targetPosition = new THREE.Vector3(
        game.player.position.x + offset.x + shake.x,
        game.player.position.y + offset.y + shake.y,
        game.player.position.z + offset.z
    );

    game.camera.position.lerp(targetPosition, 0.1);
    game.camera.lookAt(game.player.position);

    // Reduce shake over time
    if (shake.duration > 0) {
        shake.duration -= game.time.deltaTime;
        const intensity = shake.intensity * (shake.duration / 0.2);
        shake.x = (Math.random() - 0.5) * intensity;
        shake.y = (Math.random() - 0.5) * intensity;

        if (shake.duration <= 0) {
            shake.x = 0;
            shake.y = 0;
            shake.intensity = 0;
        }
    }
}