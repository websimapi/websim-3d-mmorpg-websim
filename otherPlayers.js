import { game } from './game.js';
import { getTerrainHeight } from './world.js';
import { showFloatingText } from './effects.js';
import { addChatMessage } from './chat.js';

const playerNames = [
    'DragonSlayer_2023', 'MageKnight', 'ShadowRogue', 'HealingHand', 'BeastMaster',
    'IronWill', 'FireStorm', 'NightCrawler', 'GoldSeeker', 'WarriorPoet'
];

export function initializeOtherPlayers() {
    for (let i = 0; i < 8; i++) {
        createOtherPlayer(playerNames[i]);
    }
}

function createOtherPlayer(name) {
    const playerGroup = new THREE.Group();

    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xdda0dd, 0x98d8c8];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const headGeometry = new THREE.SphereGeometry(0.7, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.3;
    head.castShadow = true;
    playerGroup.add(head);

    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    playerGroup.add(body);

    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 100;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    playerGroup.position.x = x;
    playerGroup.position.z = z;
    playerGroup.position.y = getTerrainHeight(x, z);

    playerGroup.userData = {
        type: 'otherPlayer',
        name: name,
        level: Math.floor(Math.random() * 10) + 1,
        waypoints: [],
        currentWaypoint: 0,
        state: 'wandering',
        lastChat: Date.now() + Math.random() * 30000,
        moveSpeed: 2 + Math.random(),
        displayName: name,
        nameColor: 0xffffff
    };

    for (let i = 0; i < 5; i++) {
        const wpAngle = Math.random() * Math.PI * 2;
        const wpDistance = 10 + Math.random() * 40;
        playerGroup.userData.waypoints.push({
            x: x + Math.cos(wpAngle) * wpDistance,
            z: z + Math.sin(wpAngle) * wpDistance
        });
    }

    game.world.otherPlayers.push(playerGroup);
    game.scene.add(playerGroup);
}

export function updateOtherPlayers() {
    const deltaTime = game.time.deltaTime;

    game.world.otherPlayers.forEach(player => {
        if (player.userData.waypoints.length > 0) {
            const targetWaypoint = player.userData.waypoints[player.userData.currentWaypoint];
            const direction = new THREE.Vector3()
                .subVectors(
                    new THREE.Vector3(targetWaypoint.x, 0, targetWaypoint.z),
                    player.position
                )
                .normalize();

            const distance = player.position.distanceTo(new THREE.Vector3(targetWaypoint.x, 0, targetWaypoint.z));

            if (distance < 2) {
                player.userData.currentWaypoint = (player.userData.currentWaypoint + 1) % player.userData.waypoints.length;
            } else {
                player.position.add(direction.multiplyScalar(player.userData.moveSpeed * deltaTime));
            }
        }

        player.position.y = getTerrainHeight(player.position.x, player.position.z);

        if (Math.random() < 0.001) {
            const nearbyEnemies = game.world.enemies.filter(enemy => 
                enemy.userData.health > 0 && 
                player.position.distanceTo(enemy.position) < 10
            );

            if (nearbyEnemies.length > 0) {
                const enemy = nearbyEnemies[0];
                const damage = 10 + Math.floor(Math.random() * 10);
                enemy.userData.health -= damage;

                showFloatingText(enemy.position, damage.toString(), '#ff4444');

                if (enemy.userData.health <= 0) {
                    import('./combat.js').then(module => module.killEnemy(enemy));

                    if (Math.random() < 0.1) {
                        addChatMessage(player.userData.name, 'Level up!', '#ffd700');
                        player.userData.level++;
                    }
                }
            }
        }
    });
}