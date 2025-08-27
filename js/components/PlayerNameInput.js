export class PlayerNameInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // List of fun random names
        this.randomNames = [
            'ACE', 'BLAZE', 'COMET', 'DASH', 'ECHO',
            'FLASH', 'GALAXY', 'HERO', 'IMPACT', 'JAZZ',
            'KNIGHT', 'LEGEND', 'MAVERICK', 'NOVA', 'PIXEL'
        ];
        
        // Get stored name or assign a random one
        this._playerName = localStorage.getItem('playerName');
        if (!this._playerName || !this._playerName.trim()) {
            // Pick a random name and save it
            this._playerName = this.randomNames[Math.floor(Math.random() * this.randomNames.length)];
            localStorage.setItem('playerName', this._playerName);
        }
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    get playerName() {
        return this._playerName;
    }

    set playerName(value) {
        this._playerName = value;
        localStorage.setItem('playerName', value);
        this.dispatchEvent(new CustomEvent('name-change', {
            detail: { name: value },
            bubbles: true,
            composed: true
        }));
    }

    attachEventListeners() {
        const input = this.shadowRoot.querySelector('.name-input');
        
        if (input) {
            // Auto-save on every keystroke
            input.addEventListener('input', (e) => {
                const newValue = e.target.value.trim();
                if (newValue) {
                    this.playerName = newValue;
                    this.showSavedIndicator();
                }
            });

            input.addEventListener('focus', () => {
                input.select();
            });

            input.addEventListener('mouseenter', () => {
                import('../services/AudioService.js').then(module => {
                    module.AudioService.playHoverSound();
                });
            });
        }
    }

    showSavedIndicator() {
        const indicator = this.shadowRoot.querySelector('.save-indicator');
        if (indicator) {
            indicator.classList.add('visible');
            clearTimeout(this._indicatorTimeout);
            this._indicatorTimeout = setTimeout(() => {
                indicator.classList.remove('visible');
            }, 1000);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 30px;
                    right: 30px;
                    z-index: 15;
                }
                
                .name-container {
                    display: flex;
                    gap: 0;
                    transform: rotate(2deg);
                    animation: brutal-name-entrance 0.5s ease-out;
                }
                
                @keyframes brutal-name-entrance {
                    from {
                        opacity: 0;
                        transform: translateX(50px) rotate(2deg) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) rotate(2deg) scale(1);
                    }
                }
                
                .name-label {
                    background: #a78bfa;
                    color: #000;
                    padding: 12px 15px;
                    border: 4px solid #000;
                    font-size: 16px;
                    font-weight: 900;
                    font-family: 'Roboto', sans-serif;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    box-shadow: 5px 5px 0px #000;
                    display: flex;
                    align-items: center;
                    transform: rotate(-2deg);
                    margin-right: -5px;
                    z-index: 2;
                    position: relative;
                }
                
                .name-input {
                    width: 180px;
                    padding: 12px 15px;
                    background: #fff;
                    border: 4px solid #000;
                    font-size: 18px;
                    font-weight: 700;
                    font-family: 'Roboto Mono', monospace;
                    box-shadow: 5px 5px 0px #000;
                    outline: none;
                    transition: all 0.1s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-left: -4px;
                    position: relative;
                }
                
                .name-input:focus {
                    background: #fef3c7;
                    transform: translateY(-2px);
                    box-shadow: 7px 7px 0px #000;
                }
                
                .name-input::placeholder {
                    color: #9ca3af;
                    font-style: italic;
                    text-transform: none;
                }
                
                /* Auto-save indicator */
                .save-indicator {
                    position: absolute;
                    top: -25px;
                    right: 0;
                    background: #10b981;
                    color: #000;
                    padding: 4px 10px;
                    border: 3px solid #000;
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    box-shadow: 3px 3px 0px #000;
                    opacity: 0;
                    transform: translateY(10px) rotate(5deg);
                    transition: all 0.2s ease;
                    pointer-events: none;
                    white-space: nowrap;
                }
                
                .save-indicator.visible {
                    opacity: 1;
                    transform: translateY(0) rotate(-3deg);
                    animation: brutal-indicator-bounce 0.3s ease-out;
                }
                
                @keyframes brutal-indicator-bounce {
                    0% { transform: translateY(10px) rotate(-3deg) scale(0.8); }
                    50% { transform: translateY(-5px) rotate(-5deg) scale(1.1); }
                    100% { transform: translateY(0) rotate(-3deg) scale(1); }
                }
                
                /* Trophy icon for motivation */
                .trophy-decoration {
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    font-size: 30px;
                    animation: brutal-trophy-bounce 2s ease-in-out infinite;
                    filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3));
                }
                
                @keyframes brutal-trophy-bounce {
                    0%, 100% { transform: translateY(0) rotate(-15deg); }
                    50% { transform: translateY(-10px) rotate(15deg); }
                }
                
                /* Mobile responsive */
                @media (max-width: 480px) {
                    :host {
                        top: 80px;
                        right: 20px;
                    }
                    
                    .name-container {
                        transform: rotate(0deg) scale(0.85);
                    }
                    
                    .name-input {
                        width: 100px;
                    }
                }
            </style>
            
            <div class="name-container">
                <div class="name-label">NAME:</div>
                <input 
                    type="text" 
                    class="name-input" 
                    placeholder="Enter name..."
                    value="${this._playerName}"
                    maxlength="20"
                />
                <span class="save-indicator">✓ SAVED</span>
                <span class="trophy-decoration">🏆</span>
            </div>
        `;
    }
}

customElements.define('player-name-input', PlayerNameInput);