import { game } from './game.js';
import { addChatMessage } from './ui.js';

export function initializeQuests() {
    const questTemplates = [
        {
            id: 'ancient_ruins',
            title: 'Ancient Ruins',
            description: 'Explore the mysterious ruins to the north',
            objectives: [
                { type: 'explore', target: { x: 0, z: -100 }, radius: 10, current: 0, required: 1, text: 'Reach the ancient ruins' }
            ],
            rewards: { xp: 100, gold: 50 },
            giver: 'Village Elder'
        },
        {
            id: 'collect_herbs',
            title: 'Herb Collection',
            description: 'Collect healing herbs for the village',
            objectives: [
                { type: 'kill', target: 'Goblin', current: 0, required: 5, text: 'Defeat 5 Goblins for herbs' }
            ],
            rewards: { xp: 75, gold: 30 },
            giver: 'Village Elder'
        },
        {
            id: 'monster_threat',
            title: 'Monster Threat',
            description: 'Reduce the monster population around the village',
            objectives: [
                { type: 'kill', target: 'any', current: 0, required: 10, text: 'Defeat 10 monsters' }
            ],
            rewards: { xp: 150, gold: 75 },
            giver: 'Guard Captain'
        }
    ];

    if (questTemplates.length > 0) {
        addQuest(questTemplates[0]);
    }
}

function addQuest(questTemplate) {
    const quest = JSON.parse(JSON.stringify(questTemplate));
    quest.status = 'active';
    quest.startTime = Date.now();

    game.playerData.activeQuests.push(quest);

    addChatMessage('System', `New quest: ${quest.title}`, '#ffff00');
}

export function updateQuestProgress(type, target = null) {
    game.playerData.activeQuests.forEach(quest => {
        if (quest.status !== 'active') return;

        quest.objectives.forEach(objective => {
            if (objective.type === type) {
                if (type === 'kill') {
                    if (target === objective.target || objective.target === 'any') {
                        objective.current = Math.min(objective.current + 1, objective.required);
                    }
                } else if (type === 'explore') {
                    const playerPos = game.player.position;
                    const distance = Math.sqrt(
                        Math.pow(playerPos.x - objective.target.x, 2) +
                        Math.pow(playerPos.z - objective.target.z, 2)
                    );
                    if (distance <= objective.radius) {
                        objective.current = 1;
                    }
                }
            }
        });

        const allCompleted = quest.objectives.every(obj => obj.current >= obj.required);
        if (allCompleted && quest.status === 'active') {
            completeQuest(quest);
        }
    });
}

function completeQuest(quest) {
    quest.status = 'completed';

    game.playerData.stats.xp += quest.rewards.xp;
    game.playerData.stats.gold += quest.rewards.gold || 0;

    addChatMessage('System', `Quest completed: ${quest.title}! Gained ${quest.rewards.xp} XP!`, '#00ff00');

    checkLevelUp();
}

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