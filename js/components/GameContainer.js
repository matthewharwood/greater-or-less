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
    }

    connectedCallback() {
        this.startNewGame();
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
            AudioService.speakProblem(this._leftNumber, this._rightNumber);
        }, 500);
        
        // Enable buttons after 2 seconds
        setTimeout(() => {
            this.enableButtons();
        }, 2000);
    }

    updateNumberLine() {
        // Update the external number line component
        const numberLine = document.querySelector('#main-number-line');
        if (numberLine) {
            numberLine.leftNumber = this._leftNumber;
            numberLine.rightNumber = this._rightNumber;
        }
    }

    render() {
        if (this._showingResult) {
            return; // Don't re-render during result screen
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .game-content {
                    text-align: center;
                }
                
                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    width: 100%;
                    margin-top: 20px;
                }
                
                @media (min-width: 480px) {
                    .action-buttons {
                        flex-direction: row;
                        justify-content: center;
                    }
                }
            </style>
            <div class="game-content">
                <equation-display 
                    left-number="${this._leftNumber}"
                    right-number="${this._rightNumber}">
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
        const isCorrect = GameLogic.evaluateAnswer(this._leftNumber, this._rightNumber, guess);
        
        // Show tooltip on first incorrect click
        if (this._firstClick && !isCorrect) {
            this.showTooltip("Can you read it out loud before guessing?");
            this._firstClick = false;
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
        
        // Play sound and create visual effects
        if (won) {
            AudioService.playWinSound();
            this.createPulse('green');
            this.createConfetti();
        } else {
            AudioService.playFailSound();
            this.createPulse('red');
            
            // Speak explanation after delay
            setTimeout(() => {
                AudioService.speakExplanation(this._leftNumber, this._rightNumber);
            }, 1000);
        }
        
        // Show result screen
        const resultScreen = document.createElement('result-screen');
        resultScreen.setAttribute('won', won.toString());
        resultScreen.setAttribute('left-number', this._leftNumber.toString());
        resultScreen.setAttribute('right-number', this._rightNumber.toString());
        
        resultScreen.onCountdownComplete = () => {
            this.startNewGame();
        };
        
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(resultScreen);
        
        if (won) {
            // Add confetti to result screen
            const confetti = document.createElement('confetti-canvas');
            this.shadowRoot.appendChild(confetti);
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