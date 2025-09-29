import { game } from '../core/gameState.js';
import { initializeGame } from '../game/gameManager.js';

// Character Creation
let selectedClass = 'warrior';
let selectedSkinColor = '#fdbcb4';
let selectedHairColor = '#2c1608';

export function initializeCharacterCreation() {
    // Class selection
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedClass = btn.dataset.class;
        });
    });

    // Color pickers
    document.querySelectorAll('#skinColorPicker .color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('#skinColorPicker .color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedSkinColor = option.dataset.color;
        });
    });

    document.querySelectorAll('#hairColorPicker .color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('#hairColorPicker .color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedHairColor = option.dataset.color;
        });
    });

    // Set defaults
    document.querySelector('.class-btn[data-class="warrior"]').classList.add('selected');
    document.querySelector('#skinColorPicker .color-option').classList.add('selected');
    document.querySelector('#hairColorPicker .color-option').classList.add('selected');
}

export function startGame() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username || username.length < 3) {
        alert('Please enter a username (3+ characters)');
        return;
    }

    // Store character data
    game.playerData.username = username;
    game.playerData.class = selectedClass;
    game.playerData.appearance.skinColor = selectedSkinColor;
    game.playerData.appearance.hairColor = selectedHairColor;
    game.playerData.appearance.hairStyle = document.getElementById('hairStyleSelect').value;

    // Apply class bonuses
    switch (selectedClass) {
        case 'warrior':
            game.playerData.stats.maxHealth = 150;
            game.playerData.stats.health = 150;
            game.playerData.stats.defense = 15;
            game.playerData.stats.strength = 15;
            break;
        case 'mage':
            game.playerData.stats.maxMana = 100;
            game.playerData.stats.mana = 100;
            game.playerData.stats.intelligence = 15;
            break;
        case 'rogue':
            game.playerData.stats.agility = 15;
            game.playerData.stats.maxStamina = 150;
            game.playerData.stats.stamina = 150;
            break;
    }

    // Show loading screen
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'flex';

    // Simulate loading
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                initializeGame();
            }, 500);
        }
        
        document.getElementById('loadingProgress').style.width = progress + '%';
        document.getElementById('loadingPercentage').textContent = Math.floor(progress) + '%';
        
        // Rotate loading tips
        if (Math.random() < 0.3) {
            const tip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
            document.getElementById('loadingTip').textContent = 'Tip: ' + tip;
        }
    }, 100);
}