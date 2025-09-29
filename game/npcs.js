import { game } from '../core/gameState.js';

export function initializeNPCs() {
    createNPC('Village Elder', { x: 20, z: 20 }, [
        "Welcome to our village, traveler!",
        "The monsters have been getting stronger lately.",
        "We could use a hero like you to help us."
    ], ['kill_goblins']);

    createNPC('Merchant', { x: -30, z: 15 }, [
        "Looking for supplies?",
        "I have the finest wares in the land!",
        "Coins for goods, that's how we do business."
    ], [], true);

    createNPC('Blacksmith', { x: 0, z: -25 }, [
        "Need better equipment?",
        "I can forge you the finest weapons and armor!",
        "Bring me materials and coin."
    ]);
}

function createNPC(name, position, dialogue, quests = [], isVendor = false) {
    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.8, 1.2, 3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(1, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 4;
    head.castShadow = true;
    group.add(head);

    // Hat (for distinction)
    const hatGeometry = new THREE.ConeGeometry(1.2, 1.5, 8);
    const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.y = 5.5;
    hat.castShadow = true;
    group.add(hat);

    group.position.set(position.x, 0, position.z);

    group.userData = {
        type: 'npc',
        name: name,
        dialogue: dialogue,
        currentDialogue: 0,
        quests: quests,
        isVendor: isVendor,
        vendorItems: isVendor ? generateVendorItems() : []
    };

    game.scene.add(group);
    game.world.npcs.push(group);
}

function generateVendorItems() {
    return [
        { name: 'Health Potion', price: 10, type: 'consumable', effect: 'heal', value: 50 },
        { name: 'Mana Potion', price: 15, type: 'consumable', effect: 'mana', value: 30 },
        { name: 'Iron Sword', price: 100, type: 'weapon', damage: 15 },
        { name: 'Leather Armor', price: 80, type: 'armor', defense: 10 }
    ];
}

export function checkNPCInteraction() {
    game.world.npcs.forEach(npc => {
        const distance = npc.position.distanceTo(game.player.position);
        if (distance <= 3) {
            document.getElementById('interactionPrompt').style.display = 'block';
            document.getElementById('interactionPrompt').textContent = `Press E to talk to ${npc.userData.name}`;
        }
    });
}