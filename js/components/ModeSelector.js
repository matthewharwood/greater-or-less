export class ModeSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._mode = localStorage.getItem('gameMode') || 'greater';
        this._onChange = null;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        // Dispatch initial mode
        this.dispatchModeChange();
    }

    get mode() {
        return this._mode;
    }

    set mode(value) {
        if (value !== this._mode) {
            this._mode = value;
            localStorage.setItem('gameMode', value);
            this.updateButtons();
            this.dispatchModeChange();
        }
    }

    set onChange(callback) {
        this._onChange = callback;
    }

    attachEventListeners() {
        const greaterBtn = this.shadowRoot.querySelector('#greater-btn');
        const lessBtn = this.shadowRoot.querySelector('#less-btn');
        
        if (greaterBtn) {
            greaterBtn.addEventListener('click', () => {
                this.mode = 'greater';
            });
        }
        
        if (lessBtn) {
            lessBtn.addEventListener('click', () => {
                this.mode = 'less';
            });
        }
    }

    updateButtons() {
        const greaterBtn = this.shadowRoot.querySelector('#greater-btn');
        const lessBtn = this.shadowRoot.querySelector('#less-btn');
        
        if (greaterBtn && lessBtn) {
            if (this._mode === 'greater') {
                greaterBtn.classList.add('active');
                lessBtn.classList.remove('active');
            } else {
                lessBtn.classList.add('active');
                greaterBtn.classList.remove('active');
            }
        }
    }

    dispatchModeChange() {
        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('mode-change', {
            detail: { mode: this._mode },
            bubbles: true,
            composed: true
        }));
        
        // Call callback if set
        if (this._onChange) {
            this._onChange(this._mode);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 15;
                }
                
                .mode-selector {
                    display: flex;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 25px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(10px);
                    overflow: hidden;
                    border: 2px solid #e0e0e0;
                }
                
                .mode-btn {
                    padding: 12px 24px;
                    background: transparent;
                    border: none;
                    font-size: 18px;
                    font-weight: 600;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    min-width: 120px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .mode-btn:first-child {
                    border-right: 2px solid #e0e0e0;
                }
                
                .mode-btn:hover:not(.active) {
                    background: rgba(0, 123, 255, 0.05);
                    color: #007bff;
                }
                
                .mode-btn.active {
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    color: white;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .mode-btn.active::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%);
                    pointer-events: none;
                }
                
                .operator-symbol {
                    font-size: 20px;
                    font-weight: bold;
                    margin-left: 8px;
                    display: inline-block;
                    transform: translateY(-1px);
                }
                
                @media (max-width: 480px) {
                    .mode-selector {
                        transform: scale(0.9);
                    }
                    
                    .mode-btn {
                        padding: 10px 18px;
                        font-size: 16px;
                        min-width: 100px;
                    }
                    
                    .operator-symbol {
                        font-size: 18px;
                    }
                }
                
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .mode-selector {
                    animation: slide-down 0.5s ease-out;
                }
            </style>
            
            <div class="mode-selector">
                <button id="greater-btn" class="mode-btn ${this._mode === 'greater' ? 'active' : ''}">
                    Greater
                    <span class="operator-symbol">></span>
                </button>
                <button id="less-btn" class="mode-btn ${this._mode === 'less' ? 'active' : ''}">
                    Less Than
                    <span class="operator-symbol"><</span>
                </button>
            </div>
        `;
    }
}

customElements.define('mode-selector', ModeSelector);