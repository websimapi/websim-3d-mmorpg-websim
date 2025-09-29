import { game } from './game.js';

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

export function getCharacterData() {
    return {
        class: selectedClass,
        skinColor: selectedSkinColor,
        hairColor: selectedHairColor,
        hairStyle: document.getElementById('hairStyleSelect').value
    };
}

