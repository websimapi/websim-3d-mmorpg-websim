import { game } from '../core/gameState.js';

export function initializeInventory() {
    // Initialize inventory with 20 empty slots
    game.playerData.inventory = new Array(20).fill(null);

    // Add some starting items
    addItem({ name: 'Health Potion', type: 'consumable', icon: '🧪', effect: 'heal', value: 50 });
    addItem({ name: 'Rusty Sword', type: 'weapon', icon: '⚔️', damage: 10 });

    createInventoryGrid();
}

function createInventoryGrid() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';

    for (let i = 0; i < 20; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.slotIndex = i;

        slot.addEventListener('click', () => useItem(i));
        slot.addEventListener('dragstart', (e) => startDrag(e, i));
        slot.addEventListener('dragover', (e) => e.preventDefault());
        slot.addEventListener('drop', (e) => handleDrop(e, i));

        grid.appendChild(slot);
    }

    updateInventoryDisplay();
}

export function addItem(item) {
    const emptySlot = game.playerData.inventory.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
        game.playerData.inventory[emptySlot] = item;
        updateInventoryDisplay();
        return true;
    }
    return false;
}

function useItem(slotIndex) {
    const item = game.playerData.inventory[slotIndex];
    if (!item) return;

    switch (item.type) {
        case 'consumable':
            if (item.effect === 'heal') {
                game.playerData.stats.health = Math.min(
                    game.playerData.stats.maxHealth,
                    game.playerData.stats.health + item.value
                );
            } else if (item.effect === 'mana') {
                game.playerData.stats.mana = Math.min(
                    game.playerData.stats.maxMana,
                    game.playerData.stats.mana + item.value
                );
            }
            // Remove consumable after use
            game.playerData.inventory[slotIndex] = null;
            break;

        case 'weapon':
            equipItem(item, slotIndex);
            break;

        case 'armor':
            equipItem(item, slotIndex);
            break;
    }

    updateInventoryDisplay();
}

function equipItem(item, slotIndex) {
    // Store current equipped item
    const currentEquipped = game.playerData.equipment[item.type];

    // Equip new item
    game.playerData.equipment[item.type] = item;

    // Put old item back in inventory if there was one
    if (currentEquipped) {
        game.playerData.inventory[slotIndex] = currentEquipped;
    } else {
        game.playerData.inventory[slotIndex] = null;
    }
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

let draggedItem = null;
let draggedSlot = null;

function startDrag(e, slotIndex) {
    draggedItem = game.playerData.inventory[slotIndex];
    draggedSlot = slotIndex;
    e.dataTransfer.effectAllowed = 'move';
}

function handleDrop(e, targetSlot) {
    e.preventDefault();

    if (draggedSlot === null || draggedSlot === targetSlot) return;

    // Swap items
    const targetItem = game.playerData.inventory[targetSlot];
    game.playerData.inventory[targetSlot] = draggedItem;
    game.playerData.inventory[draggedSlot] = targetItem;

    updateInventoryDisplay();

    draggedItem = null;
    draggedSlot = null;
}