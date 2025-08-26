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

    render() {
        const styles = this.getStyles();
        
        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <button ${this._disabled ? 'disabled' : ''}>
                ${this._value}
            </button>
        `;
        
        this.attachClickHandler();
    }

    getStyles() {
        const baseStyles = `
            button {
                padding: 20px 30px;
                border: 3px solid;
                border-radius: 12px;
                cursor: pointer;
                font-size: 18px;
                font-weight: 600;
                min-height: 60px;
                min-width: 100px;
                touch-action: manipulation;
                transition: all 0.8s ease-in-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            button:disabled {
                cursor: not-allowed;
                transform: none;
            }
            
            @media (max-width: 479px) {
                button {
                    width: 100%;
                    padding: 18px 20px;
                    font-size: 16px;
                }
            }
        `;

        const variantStyles = {
            primary: `
                button {
                    background-color: #007bff;
                    color: white;
                    border-color: #0056b3;
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                }
                button:hover:not(:disabled) {
                    background-color: #0056b3;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
                }
                button:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                }
                button:disabled {
                    background-color: #e9ecef;
                    color: #6c757d;
                    border-color: #dee2e6;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
            `,
            number: `
                button {
                    background-color: #e9ecef;
                    color: ${this._textColor || '#007bff'};
                    border-color: #dee2e6;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    cursor: not-allowed;
                }
            `,
            action: `
                button {
                    background-color: #007bff;
                    color: white;
                    border-color: #0056b3;
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                }
                button:hover:not(:disabled) {
                    background-color: #0056b3;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
                }
                button:disabled {
                    background-color: #e9ecef;
                    color: #6c757d;
                    border-color: #dee2e6;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
            `
        };

        return baseStyles + (variantStyles[this._variant] || variantStyles.primary);
    }
}

customElements.define('game-button', GameButton);