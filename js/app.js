// Import all components - they self-register
import './components/GameButton.js';
import './components/EquationDisplay.js';
import './components/NumberLine.js';
import './components/GameTooltip.js';
import './components/PulseOverlay.js';
import './components/ConfettiCanvas.js';
import './components/ResultScreen.js';
import './components/ProgressBar.js';
import './components/CelebrationScene.js';
import './components/ModeSelector.js';
import './components/TextToSpeechToggle.js';
import './components/MusicToggle.js';
import './components/GameContainer.js';
import './components/PlayerNameInput.js';

// Import services
import './services/GameLogic.js';
import './services/AudioService.js';
import './services/MusicService.js';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Higher or Lower Game - Web Components Version Loaded');
    
    // Components are self-registering via customElements.define
    // GameContainer will handle the game initialization
});