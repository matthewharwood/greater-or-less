import { GameButton } from './GameButton.js';

export class EquationDisplay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._leftNumber = 0;
        this._rightNumber = 0;
        this._mode = 'greater';
    }

    static get observedAttributes() {
        return ['left-number', 'right-number', 'mode'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'left-number':
                this._leftNumber = parseInt(newValue) || 0;
                break;
            case 'right-number':
                this._rightNumber = parseInt(newValue) || 0;
                break;
            case 'mode':
                const previousMode = this._mode;
                this._mode = newValue || 'greater';
                // Mark that mode has changed for animation
                if (previousMode && previousMode !== this._mode) {
                    this._modeJustChanged = true;
                }
                break;
        }
        if (this.shadowRoot) {
            this.render();
        }
    }

    set leftNumber(val) {
        this.setAttribute('left-number', val.toString());
    }

    set rightNumber(val) {
        this.setAttribute('right-number', val.toString());
    }

    get leftNumber() {
        return this._leftNumber;
    }

    get rightNumber() {
        return this._rightNumber;
    }

    render() {
        // Store the animation state before render
        const shouldAnimate = this._modeJustChanged;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    text-align: center;
                    position: relative;
                    z-index: 12;
                }

                .equation-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                    position: relative;
                }

                .number-row {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                    margin-bottom: 16px;
                    position: relative;
                }

                .operator {
                    font-size: 64px;
                    font-weight: 900;
                    color: #000;
                    margin: 0 20px;
                    font-family: 'Roboto Mono', monospace;
                    text-shadow: 4px 4px 0px #fbbf24;
                    transform: rotate(-5deg) scale(1.2);
                    display: inline-block;
                    position: relative;
                    z-index: 10;
                    transform-origin: center center;
                    transition: none;
                }

                /* Falling animation when mode changes */
                .operator.falling {
                    animation: brutal-operator-fall 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                @keyframes brutal-operator-fall {
                    0% {
                        transform: rotate(-5deg) scale(4) translateY(-100px);
                        opacity: 0;
                        filter: blur(2px) drop-shadow(0 40px 20px rgba(0,0,0,0.4));
                    }
                    20% {
                        opacity: 1;
                        filter: blur(0px) drop-shadow(0 30px 15px rgba(0,0,0,0.3));
                    }
                    60% {
                        transform: rotate(-5deg) scale(1.5) translateY(0);
                        filter: drop-shadow(0 10px 8px rgba(0,0,0,0.2));
                    }
                    80% {
                        transform: rotate(-5deg) scale(1.1) translateY(5px);
                        filter: drop-shadow(0 5px 4px rgba(0,0,0,0.15));
                    }
                    90% {
                        transform: rotate(-5deg) scale(1.25) translateY(-2px);
                    }
                    100% {
                        transform: rotate(-5deg) scale(1.2) translateY(0);
                        filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1));
                    }
                }

                .operator::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 80px;
                    height: 80px;
                    background: #fb7185;
                    transform: translate(-50%, -50%) rotate(45deg);
                    z-index: -1;
                    border: 4px solid #000;
                    transition: all 0.3s ease;
                }

                /* Background grows during fall */
                .operator.falling::before {
                    animation: brutal-operator-bg-pulse 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }

                @keyframes brutal-operator-bg-pulse {
                    0% {
                        transform: translate(-50%, -50%) rotate(45deg) scale(3);
                        background: #fbbf24;
                        opacity: 0;
                    }
                    20% {
                        opacity: 0.5;
                    }
                    60% {
                        transform: translate(-50%, -50%) rotate(45deg) scale(1.5);
                        background: #fb7185;
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(45deg) scale(1);
                        background: #fb7185;
                        opacity: 1;
                    }
                }

                .english-text {
                    font-size: 24px;
                    color: #000;
                    margin: 20px 0;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-family: 'Roboto', sans-serif;
                    background: #fde68a;
                    padding: 16px 32px;
                    border: 4px solid #000;
                    box-shadow: 6px 6px 0px #000;
                    transform: rotate(1deg);
                    display: inline-block;
                    position: relative;
                }

                .english-text::after {
                    content: '';
                    position: absolute;
                    top: -8px;
                    left: -8px;
                    right: -8px;
                    bottom: -8px;
                    background: repeating-linear-gradient(
                        45deg,
                        #10b981,
                        #10b981 10px,
                        transparent 10px,
                        transparent 20px
                    );
                    z-index: -1;
                    opacity: 0.3;
                }

                @media (max-width: 479px) {
                    .operator {
                        font-size: 48px;
                    }

                    .english-text {
                        font-size: 18px;
                        padding: 12px 24px;
                    }

                    .number-row {
                        gap: 16px;
                    }
                }
            </style>
            <div class="equation-container">
                <div class="number-row">
                    <game-button
                        value="${this._leftNumber}"
                        variant="number"
                        text-color="#dc2626"
                        disabled>
                    </game-button>
                    <span class="operator${shouldAnimate ? ' falling' : ''}">${this._mode === 'greater' ? '>' : '<'}</span>
                    <game-button
                        value="${this._rightNumber}"
                        variant="number"
                        text-color="#059669"
                        disabled>
                    </game-button>
                </div>
                <div class="english-text">
                    ${this._leftNumber} is ${this._mode === 'greater' ? 'GREATER THAN' : 'LESS THAN'} ${this._rightNumber}
                </div>
            </div>
        `;

        // Reset the flag after rendering
        if (shouldAnimate) {
            this._modeJustChanged = false;
            // Play a sound when the operator drops
            import('../services/AudioService.js').then(module => {
                module.AudioService.playHoverSound();
            });
        }
    }
}

customElements.define('equation-display', EquationDisplay);
