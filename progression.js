import { game } from './game.js';
import { addChatMessage } from './chat.js';
import { createSparkleEffect } from './effects.js';

export function checkLevelUp() {
    while (game.playerData.stats.xp >= game.playerData.stats.xpRequired) {
        game.playerData.stats.xp -= game.playerData.stats.xpRequired;
        game.playerData.stats.level++;
        game.playerData.stats.xpRequired = Math.floor(game.playerData.stats.xpRequired * 1.5);

        game.playerData.stats.maxHealth = Math.floor(game.playerData.stats.maxHealth * 1.1);
        game.playerData.stats.maxMana = Math.floor(game.playerData.stats.maxMana * 1.1);
        game.playerData.stats.maxStamina = Math.floor(game.playerData.stats.maxStamina * 1.1);
        game.playerData.stats.strength += 2;
        game.playerData.stats.agility += 2;
        game.playerData.stats.intelligence += 2;
        game.playerData.stats.defense += 2;

        game.playerData.stats.health = game.playerData.stats.maxHealth;
        game.playerData.stats.mana = game.playerData.stats.maxMana;
        game.playerData.stats.stamina = game.playerData.stats.maxStamina;

        showLevelUpEffect();
        addChatMessage('System', `Level up! You are now level ${game.playerData.stats.level}!`, '#ffd700');
    }
    import('./ui.js').then(module => module.updateUI());
}

function showLevelUpEffect() {
    const burstParticles = [];
    for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2;
        const particle = {
            position: {
                x: game.player.position.x,
                y: game.player.position.y + 1,
                z: game.player.position.z
            },
            velocity: {
                x: Math.cos(angle) * 0.2,
                y: Math.random() * 0.3 + 0.1,
                z: Math.sin(angle) * 0.2
            },
            life: 2.0,
            maxLife: 2.0,
            color: '#ffd700'
        };
        burstParticles.push(particle);
    }
    game.world.particles.push(...burstParticles);
}

