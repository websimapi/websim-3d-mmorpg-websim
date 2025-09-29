import { game } from './game.js';
import { getTerrainHeight } from './world.js';
import { addChatMessage } from './chat.js';

const npcData = [
    {
        name: 'Village Elder',
        position: { x: 30, z: 30 },
        color: 0x8B4513,
        dialogue: [
            "Welcome, young adventurer!",
            "The world is dangerous, but filled with opportunity.",
            "Seek out the ancient ruins to the north for great treasure!"
        ],
        quests: ['ancient_ruins', 'collect_herbs']
    },
    {
        name: 'Merchant',
        position: { x: -25, z: 40 },
        color: 0x4B0082,
        dialogue: [
            "Welcome to my shop!",
            "I have the finest wares in the land!",
            "Come back anytime, friend!"
        ],
        isShop: true
    },
    {
        name: 'Guard Captain',
        position: { x: 0, z: 50 },
        color: 0x2F4F4F,
        dialogue: [
            "Stay safe out there, citizen.",
            "The monsters have been more aggressive lately.",
            "We could use more brave souls like you!"
        ],
        quests: ['monster_threat']
    }
];

export function initializeNPCs() {
    npcData.forEach(data => createNPC(data));
}

function createNPC(data) {
    const npcGroup = new THREE.Group();

    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: data.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    npcGroup.add(body);

    const headGeometry = new THREE.SphereGeometry(0.6, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    npcGroup.add(head);

    npcGroup.position.x = data.position.x;
    npcGroup.position.z = data.position.z;
    npcGroup.position.y = getTerrainHeight(data.position.x, data.position.z);

    npcGroup.userData = {
        type: 'npc',
        name: data.name,
        dialogue: data.dialogue,
        dialogueIndex: 0,
        quests: data.quests || [],
        isShop: data.isShop || false,
        displayName: data.name,
        nameColor: 0xffff00
    };

    game.world.npcs.push(npcGroup);
    game.scene.add(npcGroup);
}

export function interactWithNPC(npc) {
    const dialogue = npc.userData.dialogue[npc.userData.dialogueIndex];
    addChatMessage(npc.userData.name, dialogue, '#ffff00');

    npc.userData.dialogueIndex = (npc.userData.dialogueIndex + 1) % npc.userData.dialogue.length;

    if (npc.userData.quests && npc.userData.quests.length > 0) {
        const availableQuests = npc.userData.quests.filter(questId => 
            !game.playerData.activeQuests.some(q => q.id === questId)
        );

        if (availableQuests.length > 0 && Math.random() < 0.3) {
            addChatMessage(npc.userData.name, "I have a task for you, brave adventurer!", '#ffff00');
        }
    }
}