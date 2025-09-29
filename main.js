import * as THREE from 'three';
// Expose THREE globally because many refactored files implicitly rely on it being global
// due to legacy code structure (e.g., calling new THREE.Vector3())
window.THREE = THREE; 

import { initializeCharacterCreation } from './characterCreation.js';
import { startGame, toggleInventory, toggleSettings, logout } from './ui.js';

// Expose necessary UI functions globally for inline HTML event handlers (onclick)
window.startGame = startGame;
window.toggleInventory = toggleInventory;
window.toggleSettings = toggleSettings;
window.logout = logout;

// Initialize character creation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCharacterCreation();
});