import { game, loadingTips } from './core/gameState.js';
import { initializeCharacterCreation, startGame } from './ui/characterCreation.js';
import { toggleInventory, toggleSettings, logout } from './ui/uiManager.js';

// Make loadingTips globally available
window.loadingTips = loadingTips;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCharacterCreation();
});

// Make functions globally accessible for onclick handlers
window.startGame = startGame;
window.toggleInventory = toggleInventory;
window.toggleSettings = toggleSettings;
window.logout = logout;