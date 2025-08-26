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
                }
                
                .equation-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                
                .number-row {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 10px;
                }
                
                .operator {
                    font-size: 32px;
                    font-weight: bold;
                    color: #007bff;
                    margin: 0 15px;
                }
                
                .english-text {
                    font-size: 18px;
                    color: #007bff;
                    margin: 15px 0;
                    font-weight: 500;
                }
            </style>
            <div class="equation-container">
                <div class="number-row">
                    <game-button 
                        value="${this._leftNumber}"
                        variant="number"
                        text-color="#e74c3c"
                        disabled>
                    </game-button>
                    <span class="operator">${this._mode === 'greater' ? '>' : '<'}</span>
                    <game-button 
                        value="${this._rightNumber}"
                        variant="number"
                        text-color="#27ae60"
                        disabled>
                    </game-button>
                </div>
                <div class="english-text">
                    "${this._leftNumber} is ${this._mode === 'greater' ? 'greater than' : 'less than'} ${this._rightNumber}"
                </div>
            </div>
        `;
    }
}

customElements.define('equation-display', EquationDisplay);