export class GameButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._clickHandler = null;
        this._value = '';
        this._disabled = false;
        this._textColor = null;
        this._variant = 'primary'; // primary, number, action
    }

    static get observedAttributes() {
        return ['value', 'disabled', 'text-color', 'variant'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'value':
                this._value = newValue;
                break;
            case 'disabled':
                this._disabled = newValue !== null && newValue !== 'false';
                break;
            case 'text-color':
                this._textColor = newValue;
                break;
            case 'variant':
                this._variant = newValue;
                break;
        }
        if (this.shadowRoot) {
            this.render();
        }
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get value() {
        return this._value;
    }

    set disabled(val) {
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    get disabled() {
        return this._disabled;
    }

    set clickHandler(handler) {
        this._clickHandler = handler;
        this.attachClickHandler();
    }

    attachClickHandler() {
        const button = this.shadowRoot?.querySelector('button');
        if (button && this._clickHandler && !this._disabled) {
            button.removeEventListener('click', this._clickHandler);
            button.addEventListener('click', this._clickHandler);
        }
    }

    attachHoverHandler() {
        const button = this.shadowRoot?.querySelector('button');
        if (button && !this._disabled) {
            button.addEventListener('mouseenter', () => {
                // Import and use AudioService dynamically to avoid circular dependency
                import('../services/AudioService.js').then(module => {
                    module.AudioService.playHoverSound();
                });
            });
        }
    }

    render() {
        const styles = this.getStyles();
        
        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <button ${this._disabled ? 'disabled' : ''}>
                ${this._value}
            </button>
        `;
        
        this.attachClickHandler();
        this.attachHoverHandler();
    }

    getStyles() {
        const baseStyles = `
            button {
                padding: 24px 40px;
                border: 5px solid #000;
                border-radius: 0;
                cursor: pointer;
                font-size: 22px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                min-height: 70px;
                min-width: 140px;
                touch-action: manipulation;
                transition: all 0.1s ease;
                font-family: 'Roboto', 'Roboto Mono', monospace;
                position: relative;
                transform: rotate(-1deg);
                box-shadow: 8px 8px 0px #000;
            }
            
            button:disabled {
                cursor: not-allowed;
                opacity: 1;
                transform: rotate(-1deg);
            }
            
            button:hover:not(:disabled) {
                transform: translate(-3px, -3px) rotate(-1deg);
                box-shadow: 11px 11px 0px #000;
            }
            
            button:active:not(:disabled) {
                transform: translate(5px, 5px) rotate(0deg);
                box-shadow: 2px 2px 0px #000;
            }
            
            @media (max-width: 479px) {
                button {
                    width: 100%;
                    padding: 20px 24px;
                    font-size: 18px;
                    min-height: 60px;
                }
            }
        `;

        const variantStyles = {
            primary: `
                button {
                    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                    color: #000;
                    border-color: #000;
                    position: relative;
                }
                button::before {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    right: -3px;
                    bottom: -3px;
                    background: #fb7185;
                    z-index: -1;
                    transform: rotate(1deg);
                }
                button:hover:not(:disabled) {
                    background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
                }
                button:disabled {
                    background: #e7e5e4;
                    color: #78716c;
                    border-color: #78716c;
                    box-shadow: 4px 4px 0px #78716c;
                }
                button:disabled::before {
                    display: none;
                }
            `,
            number: `
                button {
                    background: ${this._textColor === '#dc2626' ? '#fecdd3' : '#a7f3d0'};
                    color: #000;
                    border-color: #000;
                    font-family: 'Roboto Mono', monospace;
                    font-size: 36px;
                    font-weight: 900;
                    cursor: not-allowed;
                    transform: rotate(${this._textColor === '#dc2626' ? '-2' : '2'}deg);
                    box-shadow: 6px 6px 0px #000;
                    position: relative;
                    z-index: 1;
                }
                button::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 120%;
                    height: 120%;
                    transform: translate(-50%, -50%) rotate(${this._textColor === '#dc2626' ? '3' : '-3'}deg);
                    background: repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(0,0,0,0.03) 10px,
                        rgba(0,0,0,0.03) 20px
                    );
                    pointer-events: none;
                }
            `,
            action: `
                button {
                    background: #10b981;
                    color: #000;
                    border-color: #000;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 900;
                    position: relative;
                    overflow: hidden;
                }
                button::before {
                    content: '→';
                    position: absolute;
                    right: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 28px;
                    transition: all 0.2s ease;
                }
                button:hover:not(:disabled)::before {
                    right: 10px;
                    font-size: 32px;
                }
                button:hover:not(:disabled) {
                    background: #34d399;
                    transform: translate(-3px, -3px) rotate(1deg);
                    box-shadow: 11px 11px 0px #000;
                }
                button:disabled {
                    background: #e7e5e4;
                    color: #78716c;
                    border-color: #78716c;
                    box-shadow: 4px 4px 0px #78716c;
                }
                button:disabled::before {
                    display: none;
                }
            `
        };

        return baseStyles + (variantStyles[this._variant] || variantStyles.primary);
    }
}

customElements.define('game-button', GameButton);