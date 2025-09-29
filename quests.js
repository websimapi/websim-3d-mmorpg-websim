import { game } from './game.js';
import { addChatMessage } from './chat.js';

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

export function initializeQuests() {
    if (questTemplates.length > 0) {
        addQuest(questTemplates[0]);
    }
}

export function addQuest(questTemplate) {
    const quest = JSON.parse(JSON.stringify(questTemplate));
    quest.status = 'active';
    quest.startTime = Date.now();

    game.playerData.activeQuests.push(quest);
    updateQuestLog();

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

    updateQuestLog();
}

function completeQuest(quest) {
    quest.status = 'completed';

    game.playerData.stats.xp += quest.rewards.xp;
    game.playerData.stats.gold += quest.rewards.gold || 0;

    addChatMessage('System', `Quest completed: ${quest.title}! Gained ${quest.rewards.xp} XP!`, '#00ff00');

    import('./progression.js').then(module => module.checkLevelUp());
    import('./ui.js').then(module => module.updateUI());
}

export function updateQuestLog() {
    const questList = document.getElementById('questList');
    questList.innerHTML = '';

    game.playerData.activeQuests.forEach(quest => {
        if (quest.status !== 'active') return;

        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item';

        let objectivesHtml = '';
        quest.objectives.forEach(objective => {
            const progress = Math.min(objective.current, objective.required);
            const progressPercent = (progress / objective.required) * 100;

            objectivesHtml += `
                <div class="quest-objective">${objective.text}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div style="font-size: 10px; color: #aaa; margin-bottom: 5px;">${progress}/${objective.required}</div>
            `;
        });

        questDiv.innerHTML = `
            <div class="quest-title">${quest.title}</div>
            ${objectivesHtml}
        `;

        questList.appendChild(questDiv);
    });
}