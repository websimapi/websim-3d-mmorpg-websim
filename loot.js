import { game } from './game.js';
import { createSparkleEffect } from './effects.js';
import { addItemToInventory } from './inventory.js';
import { addChatMessage } from './chat.js';

const lootTypes = [
    { type: 'potion', name: 'Health Potion', effect: 'heal', value: 50, icon: '🧪', rarity: 'common', chance: 0.3 },
    { type: 'potion', name: 'Mana Potion', effect: 'mana', value: 30, icon: '🔮', rarity: 'common', chance: 0.2 },
    { type: 'weapon', name: 'Iron Sword', damage: 10, icon: '⚔️', rarity: 'uncommon', chance: 0.15 },
    { type: 'armor', name: 'Leather Vest', defense: 5, icon: '🛡️', rarity: 'common', chance: 0.15 },
    { type: 'accessory', name: 'Power Ring', strength: 3, icon: '💍', rarity: 'rare', chance: 0.05 }
];

export function dropLoot(position) {
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

export function pickupLoot(lootObject) {
    const item = lootObject.userData.item;
    if (addItemToInventory(item)) {
        addChatMessage('System', `Picked up: ${item.name}`, '#00ff00');

        game.scene.remove(lootObject);
        const index = game.world.objects.indexOf(lootObject);
        if (index > -1) {
            game.world.objects.splice(index, 1);
        }
    } else {
        addChatMessage('System', 'Inventory full!', '#ff0000');
    }
}