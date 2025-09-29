import { game } from './game.js';
import { showFloatingText } from './effects.js';
import { playerDeath } from './player.js';
import { addChatMessage } from './chat.js';

export function attackEnemy(enemy) {
    const currentTime = Date.now();
    if (currentTime - (game.playerData.lastAttack || 0) < 1500) return;

    const distance = game.player.position.distanceTo(enemy.position);
    if (distance > 5) {
        addChatMessage('System', 'Target too far away!', '#ff0000');
        return;
    }

    game.playerData.lastAttack = currentTime;
    game.ui.selectedTarget = enemy;

    const baseDamage = game.playerData.stats.strength * 2;
    const variance = (Math.random() - 0.5) * 20;
    const isCritical = Math.random() < 0.1;
    let damage = Math.floor(baseDamage + variance - (enemy.userData.defense || 0) * 0.5);

    if (isCritical) damage *= 2;
    damage = Math.max(1, damage);

    enemy.userData.health -= damage;
    showFloatingText(enemy.position, damage.toString(), isCritical ? '#ff8800' : '#ff4444');
    addChatMessage('System', '⚔️ sword swing', '#666666');

    if (enemy.userData.health <= 0) {
        killEnemy(enemy);
    } else {
        enemy.userData.state = 'chase';
        enemy.userData.target = game.player;
    }

    import('./ui.js').then(module => module.updateTargetFrame());
}

export function killEnemy(enemy) {
    game.playerData.stats.xp += enemy.userData.xpReward;

    import('./quests.js').then(module => {
        module.updateQuestProgress('kill', enemy.userData.enemyType);
        module.updateQuestProgress('kill', 'any');
    });

    if (Math.random() < 0.4) {
        import('./loot.js').then(module => module.dropLoot(enemy.position));
    }

    const goldGain = Math.floor(Math.random() * 20) + 5;
    game.playerData.stats.gold += goldGain;

    showFloatingText(enemy.position, `+${enemy.userData.xpReward} XP`, '#ffff00');
    addChatMessage('System', `Defeated ${enemy.userData.enemyType}! Gained ${enemy.userData.xpReward} XP and ${goldGain} gold!`, '#00ff00');

    game.scene.remove(enemy);
    const index = game.world.enemies.indexOf(enemy);
    if (index > -1) {
        game.world.enemies.splice(index, 1);
    }

    if (game.ui.selectedTarget === enemy) {
        game.ui.selectedTarget = null;
        document.getElementById('targetFrame').style.display = 'none';
    }

    import('./progression.js').then(module => module.checkLevelUp());

    setTimeout(() => {
        const enemyTypes = [
            { name: 'Goblin', color: 0x8B4513, health: 60, damage: 8, xp: 15, level: 1 },
            { name: 'Orc', color: 0x556B2F, health: 100, damage: 15, xp: 25, level: 2 },
            { name: 'Troll', color: 0x2F4F4F, health: 180, damage: 25, xp: 40, level: 3 }
        ];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        import('./enemies.js').then(module => module.createEnemy(type));
    }, 30000);
}

export function attackPlayer(enemy) {
    const damage = Math.floor(enemy.userData.damage * (0.8 + Math.random() * 0.4));
    const actualDamage = Math.max(1, damage - game.playerData.stats.defense * 0.3);

    game.playerData.stats.health -= actualDamage;
    game.playerData.inCombat = true;

    showFloatingText(game.player.position, `-${actualDamage}`, '#ff0000');

    if (document.getElementById('cameraShake').checked) {
        game.cameraData.shake.intensity = 0.5;
        game.cameraData.shake.duration = 200;
    }

    addChatMessage('System', `${enemy.userData.enemyType} attacks you for ${actualDamage} damage!`, '#ff4444');

    setTimeout(() => {
        game.playerData.inCombat = false;
    }, 5000);

    if (game.playerData.stats.health <= 0) {
        playerDeath();
    }
}