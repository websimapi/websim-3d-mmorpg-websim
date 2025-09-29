import { game } from './game.js';

export function initializeChatSystem() {
    const chatPhrases = [
        "anyone want to party?",
        "selling rare sword",
        "where is the dragon boss?",
        "gg",
        "need help with quest",
        "LFG dungeon run",
        "WTS enchanted armor",
        "this zone is packed",
        "nice weather today",
        "level 5 LFG",
        "trading potions",
        "found secret area!",
        "lag is real",
        "awesome graphics",
        "love this game",
        "anyone seen the merchant?",
        "epic loot drop!",
        "pvp anyone?",
        "guild recruiting",
        "server restart soon?"
    ];

    // Chat input
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // Make AI players chat periodically
    setInterval(() => {
        game.world.otherPlayers.forEach(player => {
            if (Math.random() < 0.1) { // 10% chance each interval
                const phrase = chatPhrases[Math.floor(Math.random() * chatPhrases.length)];
                addChatMessage(player.userData.name, phrase, '#ffffff');
            }
        });
    }, 5000); // Every 5 seconds

    addChatMessage('System', 'Welcome to the world, ' + game.playerData.username + '!', '#ffff00');
}

export function addChatMessage(sender, message, color) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');

    const time = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    messageDiv.innerHTML = `<span style="color: #888">[${time}]</span> <span style="color: ${color}; font-weight: bold">${sender}:</span> <span style="color: #fff">${message}</span>`;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Keep only last 50 messages
    while (chatMessages.children.length > 50) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message) {
        addChatMessage(game.playerData.username, message, '#00ffff');
        input.value = '';

        // Process chat commands
        if (message.startsWith('/')) {
            processChatCommand(message);
        }
    }
}

function processChatCommand(command) {
    const args = command.split(' ');
    const cmd = args[0].toLowerCase();

    switch (cmd) {
        case '/help':
            addChatMessage('System', 'Available commands: /help, /party, /whisper [name]', '#ffff00');
            break;
        case '/party':
            addChatMessage('System', 'Looking for party...', '#ffff00');
            break;
        case '/whisper':
            if (args.length > 2) {
                const targetName = args[1];
                const message = args.slice(2).join(' ');
                addChatMessage('You whisper to ' + targetName, message, '#ff69b4');

                // Simulate response
                setTimeout(() => {
                    addChatMessage(targetName + ' whispers', 'Thanks for the message!', '#ff69b4');
                }, 1000);
            } else {
                addChatMessage('System', 'Usage: /whisper [name] [message]', '#ff0000');
            }
            break;
        default:
            addChatMessage('System', 'Unknown command. Type /help for available commands.', '#ff0000');
    }
}