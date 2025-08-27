import musicService from '../services/MusicService.js';

export class MusicToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._musicService = musicService;
        this._onChange = null;
        this._serviceListener = null;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();

        // Set initial state
        this.updateToggle();

        // Listen for service changes
        this._serviceListener = (enabled) => {
            this.updateToggle();
            this.dispatchToggleChange();
        };
        this._musicService.addListener(this._serviceListener);
    }

    disconnectedCallback() {
        // Remove listener but don't stop music (it's managed by the service)
        if (this._serviceListener) {
            this._musicService.removeListener(this._serviceListener);
        }
    }

    get enabled() {
        return this._musicService.enabled;
    }

    set enabled(value) {
        this._musicService.enabled = value;
        this.updateToggle();
        this.dispatchToggleChange();
    }

    set onChange(callback) {
        this._onChange = callback;
    }

    attachEventListeners() {
        const button = this.shadowRoot.querySelector('.music-toggle');
        if (button) {
            button.addEventListener('click', () => {
                console.log('Music toggle clicked, current state:', this.enabled);
                this.enabled = !this.enabled;
                console.log('New state:', this.enabled);
            });
            button.addEventListener('mouseenter', () => {
                import('../services/AudioService.js').then(module => {
                    module.AudioService.playHoverSound();
                });
            });
        }
    }

    updateToggle() {
        const button = this.shadowRoot.querySelector('.music-toggle');

        if (button) {
            console.log('Updating music toggle, enabled:', this._musicService.enabled);
            if (this._musicService.enabled) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }

            // Update aria-label and title
            button.setAttribute('aria-label', this._musicService.enabled ? 'Turn off music' : 'Turn on music');
            button.setAttribute('title', this._musicService.enabled ? 'Turn off music' : 'Turn on music');
        }
    }

    dispatchToggleChange() {
        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('music-toggle', {
            detail: { enabled: this._musicService.enabled },
            bubbles: true,
            composed: true
        }));

        // Call callback if set
        if (this._onChange) {
            this._onChange(this._musicService.enabled);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    z-index: 100;
                }

                .music-toggle {
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
                    transform: rotate(3deg);
                    transition: all 0.1s ease;
                    overflow: visible;
                }

                .music-toggle::before {
                    content: 'MUSIC';
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%) rotate(-3deg);
                    background: #a78bfa;
                    color: #000;
                    padding: 2px 8px;
                    border: 3px solid #000;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.05em;
                    box-shadow: 2px 2px 0px #000;
                    font-family: 'Roboto', sans-serif;
                }

                .music-toggle::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 5px,
                        rgba(0,0,0,0.03) 5px,
                        rgba(0,0,0,0.03) 10px
                    );
                    pointer-events: none;
                }

                .music-icon {
                    font-size: 28px;
                    z-index: 2;
                    position: relative;
                    transition: all 0.2s ease;
                }

                /* Active state */
                .music-toggle.active {
                    background: linear-gradient(135deg, #c084fc 0%, #a78bfa 100%);
                    transform: rotate(3deg) scale(1.05);
                    box-shadow:
                        6px 6px 0px #000,
                        6px 6px 0px 5px #fbbf24;
                }

                .music-toggle.active .music-icon {
                    animation: brutal-music-bounce 0.5s ease-in-out infinite alternate;
                }

                @keyframes brutal-music-bounce {
                    0% {
                        transform: scale(1) rotate(-5deg);
                    }
                    100% {
                        transform: scale(1.2) rotate(5deg);
                    }
                }

                /* Musical notes for active state */
                .note-1, .note-2, .note-3 {
                    position: absolute;
                    font-size: 20px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .music-toggle.active .note-1,
                .music-toggle.active .note-2,
                .music-toggle.active .note-3 {
                    opacity: 1;
                }

                .note-1 {
                    top: -15px;
                    right: -20px;
                    animation: brutal-note-float-1 2s ease-in-out infinite;
                }

                .note-2 {
                    top: -25px;
                    right: -10px;
                    animation: brutal-note-float-2 2.5s ease-in-out infinite;
                }

                .note-3 {
                    top: -20px;
                    right: -30px;
                    animation: brutal-note-float-3 3s ease-in-out infinite;
                }

                @keyframes brutal-note-float-1 {
                    0%, 100% {
                        transform: translateY(0) rotate(-10deg);
                        opacity: 0;
                    }
                    50% {
                        transform: translateY(-20px) rotate(10deg);
                        opacity: 1;
                    }
                }

                @keyframes brutal-note-float-2 {
                    0%, 100% {
                        transform: translateY(0) rotate(10deg);
                        opacity: 0;
                    }
                    50% {
                        transform: translateY(-25px) rotate(-15deg);
                        opacity: 1;
                    }
                }

                @keyframes brutal-note-float-3 {
                    0%, 100% {
                        transform: translateY(0) rotate(-5deg);
                        opacity: 0;
                    }
                    50% {
                        transform: translateY(-15px) rotate(15deg);
                        opacity: 1;
                    }
                }

                /* Checkmark for active state - overlaid on CD */
                .checkmark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    width: 35px;
                    height: 35px;
                    background: #10b981;
                    border: 4px solid #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    font-weight: 900;
                    color: #fff;
                    box-shadow: 3px 3px 0px #000;
                    opacity: 0;
                    transition: all 0.3s ease;
                    z-index: 3;
                    pointer-events: none;
                }

                .music-toggle.active .checkmark {
                    opacity: 1;
                    transform: translate(-110%, 10%) scale(1) rotate(360deg);
                }

                /* Hover effects */
                .music-toggle:hover {
                    transform: rotate(3deg) translateY(-2px);
                    box-shadow: 7px 7px 0px #000;
                }

                .music-toggle.active:hover {
                    box-shadow:
                        8px 8px 0px #000,
                        8px 8px 0px 5px #fbbf24;
                }

                /* Click effect */
                .music-toggle:active {
                    transform: rotate(3deg) translateY(2px);
                    box-shadow: 3px 3px 0px #000;
                }

                .music-toggle.active:active {
                    box-shadow:
                        4px 4px 0px #000,
                        4px 4px 0px 5px #fbbf24;
                }

                /* Disabled state (off) */
                .music-toggle:not(.active) .music-icon {
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

                .music-toggle.active .off-indicator {
                    opacity: 0;
                    transform: rotate(-45deg) scale(0);
                }

                /* Equalizer bars for active state */
                .equalizer {
                    position: absolute;
                    bottom: 5px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 3px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .music-toggle.active .equalizer {
                    opacity: 1;
                }

                .eq-bar {
                    width: 3px;
                    background: #000;
                    animation: brutal-eq-dance 0.5s ease-in-out infinite;
                }

                .eq-bar:nth-child(1) {
                    height: 8px;
                    animation-delay: 0s;
                }

                .eq-bar:nth-child(2) {
                    height: 12px;
                    animation-delay: 0.1s;
                }

                .eq-bar:nth-child(3) {
                    height: 10px;
                    animation-delay: 0.2s;
                }

                .eq-bar:nth-child(4) {
                    height: 14px;
                    animation-delay: 0.3s;
                }

                .eq-bar:nth-child(5) {
                    height: 9px;
                    animation-delay: 0.4s;
                }

                @keyframes brutal-eq-dance {
                    0%, 100% {
                        transform: scaleY(1);
                    }
                    50% {
                        transform: scaleY(1.5);
                    }
                }

                @media (max-width: 480px) {
                    :host {
                        bottom: 20px;
                        right: 20px;
                    }

                    .music-toggle {
                        width: 50px;
                        height: 50px;
                        border-width: 4px;
                    }

                    .music-icon {
                        font-size: 24px;
                    }

                    .music-toggle::before {
                        font-size: 9px;
                        padding: 1px 6px;
                        top: -18px;
                    }
                }
            </style>

            <button class="music-toggle ${this._musicService.enabled ? 'active' : ''}"
                    aria-label="Toggle Background Music"
                    title="${this._musicService.enabled ? 'Turn off music' : 'Turn on music'}">
                <span class="music-icon">💽</span>
                <div class="checkmark">✓</div>
                <div class="off-indicator"></div>
                <div class="note-1">♪</div>
                <div class="note-2">♫</div>
                <div class="note-3">♪</div>
                <div class="equalizer">
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                </div>
            </button>
        `;

        // Update initial state
        this.updateToggle();
    }
}

customElements.define('music-toggle', MusicToggle);
