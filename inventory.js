import { game } from './game.js';
import { addChatMessage } from './chat.js';
import { showFloatingText } from './ui.js';

export function initializeInventory() {
    // Initialize empty inventory
    for (let i = 0; i < 20; i++) {
        game.playerData.inventory.push(null);
    }

    // Create inventory grid
    const inventoryGrid = document.getElementById('inventoryGrid');
    for (let i = 0; i < 20; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.slot = i;

        slot.addEventListener('click', () => useInventoryItem(i));
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('drop', e => handleInventoryDrop(e, i));

        inventoryGrid.appendChild(slot);
    }

    // Add some starting items
    addItemToInventory({ type: 'potion', name: 'Health Potion', effect: 'heal', value: 50, icon: '🧪', rarity: 'common' });
    addItemToInventory({ type: 'potion', name: 'Mana Potion', effect: 'mana', value: 30, icon: '🔮', rarity: 'common' });
}

export function addItemToInventory(item) {
    for (let i = 0; i < game.playerData.inventory.length; i++) {
        if (game.playerData.inventory[i] === null) {
            game.playerData.inventory[i] = item;
            updateInventoryDisplay();
            return true;
        }
    }
    return false; // Inventory full
}

function updateInventoryDisplay() {
    const slots = document.querySelectorAll('.inventory-slot');
    slots.forEach((slot, index) => {
        const item = game.playerData.inventory[index];
        if (item) {
            slot.textContent = item.icon || '📦';
            slot.classList.add('occupied');
            slot.title = `${item.name}\\n${item.description || ''}`;
        } else {
            slot.textContent = '';
            slot.classList.remove('occupied');
            slot.title = '';
        }
    });
}

function useInventoryItem(slotIndex) {
    const item = game.playerData.inventory[slotIndex];
    if (!item) return;

    if (item.type === 'potion') {
        if (item.effect === 'heal') {
            const healAmount = Math.min(item.value, game.playerData.stats.maxHealth - game.playerData.stats.health);
            game.playerData.stats.health += healAmount;
            showFloatingText(game.player.position, `+${healAmount}`, '#00ff00');
        } else if (item.effect === 'mana') {
            const manaAmount = Math.min(item.value, game.playerData.stats.maxMana - game.playerData.stats.mana);
            game.playerData.stats.mana += manaAmount;
            showFloatingText(game.player.position, `+${manaAmount} MP`, '#0066ff');
        }

        // Remove item from inventory
        game.playerData.inventory[slotIndex] = null;
        updateInventoryDisplay();

        addChatMessage('System', `Used ${item.name}`, '#ffff00');
    }
}

function handleInventoryDrop(e, slotIndex) {
    // Implement drag and drop logic here
    e.preventDefault();
}