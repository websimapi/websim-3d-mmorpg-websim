import { game } from '../core/gameState.js';
import { initializeThreeJS } from './rendering.js';
import { generateWorld } from './world.js';
import { createPlayer } from './player.js';
import { initializeEnemies } from './enemies.js';
import { initializeNPCs } from './npcs.js';
import { initializeOtherPlayers } from './otherPlayers.js';
import { initializeSkills } from './skills.js';
import { initializeQuests } from './quests.js';
import { initializeInventory } from './inventory.js';
import { initializeControls } from './controls.js';
import { initializeChatSystem, addChatMessage } from './chat.js';
import { startGameLoop } from './gameLoop.js';

export function initializeGame() {
    initializeThreeJS();
    generateWorld();
    createPlayer();
    initializeEnemies();
    initializeNPCs();
    initializeOtherPlayers();
    initializeSkills();
    initializeQuests();
    initializeInventory();
    initializeControls();
    initializeChatSystem();
    startGameLoop();
    
    addChatMessage('System', 'Welcome to the world, ' + game.playerData.username + '!', '#ffff00');
}