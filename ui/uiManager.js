import { game } from '../core/gameState.js';

export function toggleInventory() {
    const inventory = document.getElementById('inventory');
    game.ui.inventoryOpen = !game.ui.inventoryOpen;
    inventory.style.display = game.ui.inventoryOpen ? 'block' : 'none';
    
    if (game.ui.inventoryOpen) {
        updateInventoryDisplay();
    }
}

export function toggleSettings() {
    const settings = document.getElementById('settingsMenu');
    game.ui.settingsOpen = !game.ui.settingsOpen;
    settings.style.display = game.ui.settingsOpen ? 'block' : 'none';
}

export function logout() {
    location.reload();
}

function updateInventoryDisplay() {
    const slots = document.querySelectorAll('.inventory-slot');
    slots.forEach((slot, index) => {
        const item = game.playerData.inventory[index];
        if (item) {
            slot.textContent = item.icon || '';
            slot.classList.add('occupied');
            slot.title = `${item.name}\n${item.description || ''}`;
        } else {
            slot.textContent = '';
            slot.classList.remove('occupied');
            slot.title = '';
        }
    });
}