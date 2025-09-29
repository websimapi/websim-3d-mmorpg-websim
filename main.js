import { GameState } from './core/gameState.js';
import { initializeCharacterCreation, startGame } from './ui/characterCreation.js';
import { toggleInventory, toggleSettings, logout } from './ui/uiManager.js';

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCharacterCreation();
});

// Make functions globally accessible for onclick handlers
window.startGame = startGame;
window.toggleInventory = toggleInventory;
window.toggleSettings = toggleSettings;
window.logout = logout;