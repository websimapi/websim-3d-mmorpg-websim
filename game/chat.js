import { game } from '../core/gameState.js';

export function initializeChatSystem() {
    game.ui.chatMessages = [];

    // Add welcome message
    addChatMessage('System', 'Welcome to the world!', '#ffff00');
}

export function addChatMessage(sender, message, color = '#ffffff') {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const chatMessage = {
        timestamp,
        sender,
        message,
        color
    };

    game.ui.chatMessages.push(chatMessage);

    // Keep only last 50 messages
    if (game.ui.chatMessages.length > 50) {
        game.ui.chatMessages.shift();
    }

    updateChatDisplay();
}

function updateChatDisplay() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';

    // Show last 10 messages
    const recentMessages = game.ui.chatMessages.slice(-10);

    recentMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `
            <span style="color: #888">[${msg.timestamp}]</span>
            <span style="color: ${msg.color}; font-weight: bold">${msg.sender}:</span>
            <span style="color: #fff">${msg.message}</span>
        `;
        chatMessages.appendChild(messageDiv);
    });

    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}