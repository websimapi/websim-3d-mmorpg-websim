import { game } from '../core/gameState.js';

export function initializeQuests() {
    const availableQuests = [
        {
            id: 'kill_goblins',
            title: 'Goblin Menace',
            description: 'Defeat 5 goblins threatening the village',
            objectives: [
                { type: 'kill', target: 'goblin', current: 0, required: 5 }
            ],
            rewards: { xp: 100, gold: 50 },
            status: 'not_started'
        },
        {
            id: 'collect_herbs',
            title: 'Herb Gathering',
            description: 'Collect 10 healing herbs for the apothecary',
            objectives: [
                { type: 'collect', target: 'herb', current: 0, required: 10 }
            ],
            rewards: { xp: 75, gold: 30 },
            status: 'not_started'
        }
    ];

    game.playerData.activeQuests = [];
    updateQuestDisplay();
}

export function acceptQuest(questId) {
    // Find and accept quest (simplified)
    const quest = {
        id: questId,
        title: 'Kill Enemies',
        description: 'Defeat 3 enemies to prove your worth',
        objectives: [
            { type: 'kill', target: 'enemy', current: 0, required: 3 }
        ],
        rewards: { xp: 150, gold: 75 },
        status: 'active'
    };

    game.playerData.activeQuests.push(quest);
    updateQuestDisplay();
}

export function updateQuestProgress(type, target) {
    game.playerData.activeQuests.forEach(quest => {
        quest.objectives.forEach(objective => {
            if (objective.type === type && objective.target === target) {
                objective.current = Math.min(objective.required, objective.current + 1);

                if (objective.current >= objective.required) {
                    checkQuestCompletion(quest);
                }
            }
        });
    });

    updateQuestDisplay();
}

function checkQuestCompletion(quest) {
    const allComplete = quest.objectives.every(obj => obj.current >= obj.required);
    if (allComplete && quest.status === 'active') {
        quest.status = 'completed';

        // Give rewards
        game.playerData.stats.xp += quest.rewards.xp;
        game.playerData.stats.gold += quest.rewards.gold;

        console.log(`Quest completed: ${quest.title}!`);
    }
}

function updateQuestDisplay() {
    const questList = document.getElementById('questList');
    questList.innerHTML = '';

    game.playerData.activeQuests.forEach(quest => {
        if (quest.status !== 'active') return;

        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'quest-title';
        titleDiv.textContent = quest.title;
        questDiv.appendChild(titleDiv);

        quest.objectives.forEach(objective => {
            const objDiv = document.createElement('div');
            objDiv.className = 'quest-objective';
            objDiv.textContent = `${objective.current}/${objective.required} ${objective.target}s`;
            questDiv.appendChild(objDiv);

            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            progressFill.style.width = (objective.current / objective.required * 100) + '%';
            progressBar.appendChild(progressFill);
            questDiv.appendChild(progressBar);
        });

        questList.appendChild(questDiv);
    });
}