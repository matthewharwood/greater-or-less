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
                this._mode = newValue || 'greater';
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
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    text-align: center;
                    position: relative;
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
                    <span class="operator">${this._mode === 'greater' ? '>' : '<'}</span>
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
    }
}

customElements.define('equation-display', EquationDisplay);