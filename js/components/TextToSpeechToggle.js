export class TextToSpeechToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._enabled = localStorage.getItem('textToSpeechEnabled') === 'true' || false;
        this._onChange = null;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        // Dispatch initial state
        this.dispatchToggleChange();
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value) {
        if (value !== this._enabled) {
            this._enabled = value;
            localStorage.setItem('textToSpeechEnabled', value.toString());
            this.updateToggle();
            this.dispatchToggleChange();
        }
    }

    set onChange(callback) {
        this._onChange = callback;
    }

    attachEventListeners() {
        const button = this.shadowRoot.querySelector('.tts-toggle');
        if (button) {
            button.addEventListener('click', () => {
                this.enabled = !this._enabled;
            });
            button.addEventListener('mouseenter', () => {
                import('../services/AudioService.js').then(module => {
                    module.AudioService.playHoverSound();
                });
            });
        }
    }

    updateToggle() {
        const button = this.shadowRoot.querySelector('.tts-toggle');
        const icon = this.shadowRoot.querySelector('.speaker-icon');
        const checkmark = this.shadowRoot.querySelector('.checkmark');
        
        if (button) {
            if (this._enabled) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    }

    dispatchToggleChange() {
        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('tts-toggle', {
            detail: { enabled: this._enabled },
            bubbles: true,
            composed: true
        }));
        
        // Call callback if set
        if (this._onChange) {
            this._onChange(this._enabled);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    bottom: 30px;
                    left: 30px;
                    z-index: 100;
                }
                
                .tts-toggle {
                    width: 60px;
                    height: 60px;
                    background: #fff;
                    border: 5px solid #000;
                    box-shadow: 5px 5px 0px #000;
                    cursor: pointer;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform: rotate(-3deg);
                    transition: all 0.1s ease;
                    overflow: hidden;
                }
                
                .tts-toggle::before {
                    content: 'TTS';
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%) rotate(3deg);
                    background: #fbbf24;
                    color: #000;
                    padding: 2px 8px;
                    border: 3px solid #000;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.05em;
                    box-shadow: 2px 2px 0px #000;
                    font-family: 'Roboto', sans-serif;
                }
                
                .tts-toggle::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 5px,
                        rgba(0,0,0,0.03) 5px,
                        rgba(0,0,0,0.03) 10px
                    );
                    pointer-events: none;
                }
                
                .speaker-icon {
                    font-size: 28px;
                    z-index: 2;
                    position: relative;
                    transition: all 0.2s ease;
                }
                
                /* Active state */
                .tts-toggle.active {
                    background: #10b981;
                    transform: rotate(-3deg) scale(1.05);
                    box-shadow: 
                        6px 6px 0px #000,
                        6px 6px 0px 5px #fbbf24;
                }
                
                .tts-toggle.active .speaker-icon {
                    animation: brutal-speaker-pulse 1s ease-in-out infinite;
                }
                
                @keyframes brutal-speaker-pulse {
                    0%, 100% { 
                        transform: scale(1);
                    }
                    50% { 
                        transform: scale(1.2);
                    }
                }
                
                /* Checkmark for active state */
                .checkmark {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    width: 30px;
                    height: 30px;
                    background: #fb7185;
                    border: 3px solid #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: 900;
                    box-shadow: 2px 2px 0px #000;
                    opacity: 0;
                    transform: scale(0) rotate(0deg);
                    transition: all 0.3s ease;
                }
                
                .tts-toggle.active .checkmark {
                    opacity: 1;
                    transform: scale(1) rotate(360deg);
                }
                
                /* Hover effects */
                .tts-toggle:hover {
                    transform: rotate(-3deg) translateY(-2px);
                    box-shadow: 7px 7px 0px #000;
                }
                
                .tts-toggle.active:hover {
                    box-shadow: 
                        8px 8px 0px #000,
                        8px 8px 0px 5px #fbbf24;
                }
                
                /* Click effect */
                .tts-toggle:active {
                    transform: rotate(-3deg) translateY(2px);
                    box-shadow: 3px 3px 0px #000;
                }
                
                .tts-toggle.active:active {
                    box-shadow: 
                        4px 4px 0px #000,
                        4px 4px 0px 5px #fbbf24;
                }
                
                /* Sound waves for active state */
                .sound-wave {
                    position: absolute;
                    right: -20px;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .tts-toggle.active .sound-wave {
                    opacity: 1;
                    animation: brutal-wave 1.5s ease-in-out infinite;
                }
                
                @keyframes brutal-wave {
                    0%, 100% {
                        transform: translateY(-50%) translateX(0);
                    }
                    50% {
                        transform: translateY(-50%) translateX(5px);
                    }
                }
                
                .wave-line {
                    width: 3px;
                    height: 20px;
                    background: #000;
                    display: inline-block;
                    margin: 0 2px;
                    animation: brutal-wave-line 1s ease-in-out infinite;
                }
                
                .wave-line:nth-child(1) { 
                    height: 15px; 
                    animation-delay: 0s;
                }
                .wave-line:nth-child(2) { 
                    height: 25px; 
                    animation-delay: 0.1s;
                }
                .wave-line:nth-child(3) { 
                    height: 20px; 
                    animation-delay: 0.2s;
                }
                
                @keyframes brutal-wave-line {
                    0%, 100% {
                        transform: scaleY(1);
                    }
                    50% {
                        transform: scaleY(1.5);
                    }
                }
                
                /* Disabled state (off) */
                .tts-toggle:not(.active) .speaker-icon {
                    opacity: 0.7;
                }
                
                /* Cross line for off state */
                .off-indicator {
                    position: absolute;
                    width: 100%;
                    height: 4px;
                    background: #dc2626;
                    transform: rotate(-45deg);
                    transition: all 0.3s ease;
                    opacity: 1;
                    box-shadow: 1px 1px 0px #000;
                }
                
                .tts-toggle.active .off-indicator {
                    opacity: 0;
                    transform: rotate(-45deg) scale(0);
                }
                
                @media (max-width: 480px) {
                    :host {
                        bottom: 20px;
                        left: 20px;
                    }
                    
                    .tts-toggle {
                        width: 50px;
                        height: 50px;
                        border-width: 4px;
                    }
                    
                    .speaker-icon {
                        font-size: 24px;
                    }
                    
                    .tts-toggle::before {
                        font-size: 9px;
                        padding: 1px 6px;
                        top: -18px;
                    }
                }
            </style>
            
            <button class="tts-toggle ${this._enabled ? 'active' : ''}" 
                    aria-label="Toggle Text-to-Speech" 
                    title="${this._enabled ? 'Turn off speech' : 'Turn on speech'}">
                <span class="speaker-icon">🔊</span>
                <div class="checkmark">✓</div>
                <div class="off-indicator"></div>
                <div class="sound-wave">
                    <span class="wave-line"></span>
                    <span class="wave-line"></span>
                    <span class="wave-line"></span>
                </div>
            </button>
        `;
        
        // Update initial state
        this.updateToggle();
    }
}

customElements.define('tts-toggle', TextToSpeechToggle);