import { game } from '../core/gameState.js';

const playerNames = [
    'DragonSlayer', 'ShadowMage', 'IronWarrior', 'SwiftArcher', 'MysticHealer',
    'StormBringer', 'DarkKnight', 'FireMage', 'SilentAssassin', 'HolyPaladin'
];

const chatMessages = [
    'anyone want to party?', 'selling rare sword', 'where is the dragon boss?',
    'gg', 'need help with quest', 'loot?', 'epic drop!', 'lvl up!',
    'anyone trading?', 'looking for guild', 'nice weather today'
];

export function initializeOtherPlayers() {
    for (let i = 0; i < 8; i++) {
        createOtherPlayer();
    }
}

function createOtherPlayer() {
    const group = new THREE.Group();

    // Similar to player but different colors
    const headGeometry = new THREE.SphereGeometry(1, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.6, 0.7) 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 4;
    head.castShadow = true;
    group.add(head);

    const bodyGeometry = new THREE.CylinderGeometry(0.8, 1.2, 3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5) 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    group.add(body);

    // Random position
    group.position.x = (Math.random() - 0.5) * 200;
    group.position.z = (Math.random() - 0.5) * 200;

    group.userData = {
        type: 'otherPlayer',
        name: playerNames[Math.floor(Math.random() * playerNames.length)],
        level: Math.floor(Math.random() * 20) + 1,
        targetPosition: group.position.clone(),
        lastChat: Date.now() + Math.random() * 60000,
        speed: 2 + Math.random() * 2
    };

    game.scene.add(group);
    game.world.otherPlayers.push(group);
}

export function updateOtherPlayers(deltaTime) {
    game.world.otherPlayers.forEach(player => {
        // Move toward target position
        const distance = player.position.distanceTo(player.userData.targetPosition);
        if (distance < 2) {
            // Choose new target
            player.userData.targetPosition = new THREE.Vector3(
                (Math.random() - 0.5) * 200,
                0,
                (Math.random() - 0.5) * 200
            );
        } else {
            const direction = new THREE.Vector3()
                .subVectors(player.userData.targetPosition, player.position)
                .normalize();
            player.position.add(direction.multiplyScalar(player.userData.speed * deltaTime));
        }

        // Random chat
        const now = Date.now();
        if (now - player.userData.lastChat > (30000 + Math.random() * 90000)) {
            const message = chatMessages[Math.floor(Math.random() * chatMessages.length)];
            addChatMessage(player.userData.name, message, '#ffffff');
            player.userData.lastChat = now;
        }
    });
}