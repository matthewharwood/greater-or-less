import { GameButton } from './GameButton.js';
import { EquationDisplay } from './EquationDisplay.js';
import { NumberLine } from './NumberLine.js';
import { ResultScreen } from './ResultScreen.js';
import { GameTooltip } from './GameTooltip.js';
import { PulseOverlay } from './PulseOverlay.js';
import { ConfettiCanvas } from './ConfettiCanvas.js';
import { GameLogic } from '../services/GameLogic.js';
import { AudioService } from '../services/AudioService.js';

export class GameContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._leftNumber = 0;
        this._rightNumber = 0;
        this._firstClick = true;
        this._buttonsEnabled = false;
        this._showingResult = false;
        this._mode = GameLogic.getCurrentMode();
    }

    connectedCallback() {
        this.startNewGame();
        this.listenForModeChanges();
    }
    
    listenForModeChanges() {
        // Listen for mode changes from the mode selector
        document.addEventListener('mode-change', (e) => {
            this._mode = e.detail.mode;
            // Update the equation display without resetting the game
            if (!this._showingResult) {
                this.updateEquationDisplay();
            }
        });
    }
    
    updateEquationDisplay() {
        const equationDisplay = this.shadowRoot.querySelector('equation-display');
        if (equationDisplay) {
            equationDisplay.setAttribute('mode', this._mode);
        }
    }

    startNewGame() {
        GameLogic.incrementRound();
        const numbers = GameLogic.generateRandomNumbers();
        this._leftNumber = numbers[0];
        this._rightNumber = numbers[1];
        this._firstClick = true;
        this._buttonsEnabled = false;
        this._showingResult = false;
        
        this.render();
        this.updateNumberLine();
        
        // Speak the problem after a short delay
        setTimeout(() => {
            AudioService.speakProblem(this._leftNumber, this._rightNumber, this._mode);
        }, 500);
        
        // Enable buttons after 2 seconds
        setTimeout(() => {
            this.enableButtons();
        }, 2000);
    }

    updateNumberLine() {
        // Get current streak to determine if we should show the number line
        const currentStreak = parseInt(localStorage.getItem('gameStreak') || '0');
        const shouldHide = [1, 3, 5, 7].includes(currentStreak);
        
        // Update the external number line component
        setTimeout(() => {
            const numberLine = document.querySelector('#main-number-line');
            if (numberLine) {
                if (shouldHide) {
                    numberLine.style.visibility = 'hidden';
                    numberLine.style.opacity = '0';
                    numberLine.style.transition = 'opacity 0.3s ease';
                } else {
                    numberLine.style.visibility = 'visible';
                    numberLine.style.opacity = '1';
                    numberLine.style.transition = 'opacity 0.3s ease';
                    numberLine.leftNumber = this._leftNumber;
                    numberLine.rightNumber = this._rightNumber;
                }
            }
        }, 0);
    }

    render() {
        if (this._showingResult) {
            return; // Don't re-render during result screen
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: relative;
                }
                
                .game-content {
                    text-align: center;
                }
                
                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 100%;
                    margin-top: 30px;
                    position: relative;
                    padding: 20px;
                    background: linear-gradient(
                        135deg,
                        #fef3c7 0%,
                        #fde68a 50%,
                        #fef3c7 100%
                    );
                    border: 5px solid #000;
                    box-shadow: 8px 8px 0px #000;
                    transform: rotate(-1deg);
                }
                
                .action-buttons::before {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    right: -10px;
                    bottom: -10px;
                    background: repeating-linear-gradient(
                        45deg,
                        #fb7185,
                        #fb7185 10px,
                        transparent 10px,
                        transparent 20px
                    );
                    z-index: -1;
                    opacity: 0.3;
                }
                
                @media (min-width: 480px) {
                    .action-buttons {
                        flex-direction: row;
                        justify-content: center;
                        transform: rotate(1deg);
                    }
                }
            </style>
            <div class="game-content">
                <equation-display 
                    left-number="${this._leftNumber}"
                    right-number="${this._rightNumber}"
                    mode="${this._mode}">
                </equation-display>
                
                <div class="action-buttons">
                    <game-button 
                        id="true-btn"
                        value="True"
                        variant="action"
                        ${this._buttonsEnabled ? '' : 'disabled'}>
                    </game-button>
                    <game-button 
                        id="false-btn"
                        value="False"
                        variant="action"
                        ${this._buttonsEnabled ? '' : 'disabled'}>
                    </game-button>
                    <game-button 
                        id="equal-btn"
                        value="Equal"
                        variant="action"
                        ${this._buttonsEnabled ? '' : 'disabled'}>
                    </game-button>
                </div>
            </div>
        `;
        
        this.attachButtonHandlers();
    }

    attachButtonHandlers() {
        const trueBtn = this.shadowRoot.querySelector('#true-btn');
        const falseBtn = this.shadowRoot.querySelector('#false-btn');
        const equalBtn = this.shadowRoot.querySelector('#equal-btn');
        
        if (trueBtn) {
            trueBtn.clickHandler = () => this.handleGuess('higher');
        }
        if (falseBtn) {
            falseBtn.clickHandler = () => this.handleGuess('lower');
        }
        if (equalBtn) {
            equalBtn.clickHandler = () => this.handleGuess('equal');
        }
    }

    enableButtons() {
        this._buttonsEnabled = true;
        
        const buttons = this.shadowRoot.querySelectorAll('game-button[variant="action"]');
        buttons.forEach(btn => {
            btn.disabled = false;
        });
    }

    handleGuess(guess) {
        const isCorrect = GameLogic.evaluateAnswer(this._leftNumber, this._rightNumber, guess, this._mode);
        
        // Show tooltip on first incorrect click
        if (this._firstClick && !isCorrect) {
            let tooltipMessage;
            if (this._mode === 'greater') {
                // Greater than mode - red needs to be bigger (on the right)
                tooltipMessage = "Look at the dots! If 🔴 RED is on the RIGHT, it's BIGGER!";
            } else {
                // Less than mode - red needs to be smaller (on the left)
                tooltipMessage = "Look at the dots! If 🔴 RED is on the LEFT, it's SMALLER!";
            }
            this.showTooltip(tooltipMessage);
            this._firstClick = false;
            
            // If number line was hidden, show it now to help
            const currentStreak = parseInt(localStorage.getItem('gameStreak') || '0');
            const wasHidden = [1, 3, 5, 7].includes(currentStreak);
            if (wasHidden) {
                const numberLine = document.querySelector('#main-number-line');
                if (numberLine) {
                    numberLine.style.visibility = 'visible';
                    numberLine.style.opacity = '1';
                    numberLine.style.transition = 'opacity 0.3s ease';
                    numberLine.leftNumber = this._leftNumber;
                    numberLine.rightNumber = this._rightNumber;
                }
            }
            return;
        }
        
        this._firstClick = false;
        this.showResult(isCorrect);
    }

    showTooltip(message) {
        const tooltip = document.createElement('game-tooltip');
        tooltip.message = message;
        document.body.appendChild(tooltip);
    }

    showResult(won) {
        this._showingResult = true;
        
        // Update progress bar
        const progressBar = document.querySelector('#progress-bar');
        if (progressBar) {
            if (won) {
                progressBar.incrementStreak();
            } else {
                progressBar.resetStreak();
            }
        }
        
        // Play sound and create visual effects
        if (won) {
            AudioService.playWinSound();
            this.createPulse('green');
        } else {
            AudioService.playFailSound();
            this.createPulse('red');
            
            // Speak explanation after delay
            setTimeout(() => {
                AudioService.speakExplanation(this._leftNumber, this._rightNumber, this._mode);
            }, 1000);
        }
        
        // Don't clear innerHTML - overlay the result screen instead
        // Create a container for the result screen if it doesn't exist
        let resultContainer = this.shadowRoot.querySelector('.result-container');
        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.className = 'result-container';
            resultContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 200;
            `;
            this.shadowRoot.appendChild(resultContainer);
        }
        
        // Show result screen
        const resultScreen = document.createElement('result-screen');
        resultScreen.setAttribute('won', won.toString());
        resultScreen.setAttribute('left-number', this._leftNumber.toString());
        resultScreen.setAttribute('right-number', this._rightNumber.toString());
        resultScreen.setAttribute('mode', this._mode);
        
        resultScreen.onCountdownComplete = () => {
            // Remove result screen before starting new game
            if (resultContainer) {
                resultContainer.remove();
            }
            this.startNewGame();
        };
        
        resultContainer.innerHTML = '';
        resultContainer.appendChild(resultScreen);
        
        if (won) {
            // Add confetti to result screen container
            const confetti = document.createElement('confetti-canvas');
            resultContainer.appendChild(confetti);
        }
    }

    createPulse(color) {
        const pulse = document.createElement('pulse-overlay');
        pulse.setAttribute('color', color);
        document.body.appendChild(pulse);
    }

    createConfetti() {
        // Confetti is added directly to result screen
    }
}

customElements.define('game-container', GameContainer);