export class ModeSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._mode = localStorage.getItem('gameMode') || 'greater';
        this._onChange = null;
        this._isInitialLoad = true;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        // Update buttons to ensure correct state
        this.updateButtons();
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
            greaterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Greater button clicked');
                this.mode = 'greater';
            });
            greaterBtn.addEventListener('mouseenter', () => {
                import('../services/AudioService.js').then(module => {
                    module.AudioService.playHoverSound();
                });
            });
        }
        
        if (lessBtn) {
            lessBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Less button clicked');
                this.mode = 'less';
            });
            lessBtn.addEventListener('mouseenter', () => {
                import('../services/AudioService.js').then(module => {
                    module.AudioService.playHoverSound();
                });
            });
        }
    }

    updateButtons() {
        const greaterBtn = this.shadowRoot.querySelector('#greater-btn');
        const lessBtn = this.shadowRoot.querySelector('#less-btn');
        const selector = this.shadowRoot.querySelector('.mode-selector');
        
        if (greaterBtn && lessBtn) {
            // If this is the initial load, just set the button states without animation
            if (this._isInitialLoad) {
                this._isInitialLoad = false;
                if (this._mode === 'greater') {
                    greaterBtn.classList.add('active');
                    lessBtn.classList.remove('active');
                } else {
                    lessBtn.classList.add('active');
                    greaterBtn.classList.remove('active');
                }
                return;
            }
            
            // Add fade-out and spin-in animation for mode changes
            if (selector) {
                selector.classList.add('fade-out');
                
                // Wait for fade out, then update buttons
                setTimeout(() => {
                    if (this._mode === 'greater') {
                        greaterBtn.classList.add('active');
                        lessBtn.classList.remove('active');
                    } else {
                        lessBtn.classList.add('active');
                        greaterBtn.classList.remove('active');
                    }
                    
                    // Remove fade-out and add spin-in
                    selector.classList.remove('fade-out');
                    selector.classList.add('spin-in');
                    
                    // Clean up after animation completes
                    setTimeout(() => {
                        selector.classList.remove('spin-in');
                    }, 500);
                }, 300); // Fade out duration
            } else {
                // Fallback if selector not found
                if (this._mode === 'greater') {
                    greaterBtn.classList.add('active');
                    lessBtn.classList.remove('active');
                } else {
                    lessBtn.classList.add('active');
                    greaterBtn.classList.remove('active');
                }
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
                    top: 30px;
                    left: 50%;
                    transform: translateX(-50%) rotate(-2deg);
                    z-index: 15;
                }
                
                .mode-selector {
                    display: flex;
                    background: #fff;
                    border: 8px solid #000;
                    box-shadow: 
                        10px 10px 0px #000,
                        10px 10px 0px 8px #fbbf24;
                    overflow: visible;
                    position: relative;
                    transform: scale(1);
                    animation: brutal-selector-entrance 0.5s ease-out;
                }
                
                .mode-selector::before {
                    content: 'MODE';
                    position: absolute;
                    top: -35px;
                    left: 50%;
                    transform: translateX(-50%) rotate(-5deg);
                    background: #fb7185;
                    color: #000;
                    padding: 5px 15px;
                    border: 4px solid #000;
                    font-size: 14px;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    box-shadow: 4px 4px 0px #000;
                    z-index: 10;
                }
                
                .mode-selector::after {
                    content: '';
                    position: absolute;
                    inset: -15px;
                    background: repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(0,0,0,0.03) 10px,
                        rgba(0,0,0,0.03) 20px
                    );
                    pointer-events: none;
                    z-index: -1;
                }
                
                .mode-btn {
                    padding: 20px 35px;
                    background: #fef3c7;
                    border: none;
                    font-size: 22px;
                    font-weight: 900;
                    color: #000;
                    cursor: pointer;
                    transition: all 0.1s ease;
                    position: relative;
                    min-width: 160px;
                    font-family: 'Roboto', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    overflow: visible;
                    outline: 3px solid transparent;
                    outline-offset: -3px;
                    z-index: 1;
                }
                
                .mode-btn:first-child {
                    border-right: 6px solid #000;
                    overflow: visible;
                }
                
                .mode-btn:hover:not(.active) {
                    outline: 3px dashed #dc2626;
                    outline-offset: -3px;
                    animation: brutal-outline-dance 0.5s ease-in-out infinite;
                }
                
                @keyframes brutal-outline-dance {
                    0%, 100% { outline-offset: -3px; }
                    50% { outline-offset: -6px; }
                }
                
                .mode-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(255,255,255,0.4) 50%, 
                        transparent 100%);
                    transform: translateX(-100%);
                    transition: transform 0.5s ease;
                    z-index: 1;
                    overflow: hidden;
                    pointer-events: none;
                }
                
                .mode-btn:hover:not(.active) {
                    background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
                    transform: rotate(-2deg) translateY(-4px);
                    box-shadow: 
                        0 8px 0px #000,
                        0 8px 0px 4px #fb7185;
                    border-color: #000;
                }
                
                .mode-btn:hover:not(.active)::before {
                    transform: translateX(100%);
                }
                
                /* Add brutal hover indicator */
                .mode-btn:hover:not(.active)::after {
                    content: '👈 PICK ME';
                    position: absolute;
                    bottom: -35px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 14px;
                    font-weight: 900;
                    background: #fb7185;
                    color: #000;
                    padding: 4px 10px;
                    border: 3px solid #000;
                    box-shadow: 3px 3px 0px #000;
                    animation: brutal-point 0.5s ease-in-out infinite alternate;
                    pointer-events: none;
                    white-space: nowrap;
                }
                
                @keyframes brutal-point {
                    0% { transform: translateX(-50%) translateY(0) rotate(-10deg); }
                    100% { transform: translateX(-50%) translateY(-5px) rotate(10deg); }
                }
                
                .mode-btn:active:not(.active) {
                    transform: rotate(0deg) translateY(2px);
                    box-shadow: 
                        0 2px 0px #000,
                        0 2px 0px 2px #fb7185;
                }
                
                .mode-btn.active {
                    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
                    color: #000;
                    box-shadow: inset 6px 6px 0px rgba(0,0,0,0.2);
                    transform: translateY(2px);
                    position: relative;
                    z-index: 1;
                }
                
                /* Position checkmark on left for first button, right for second */
                .mode-btn:first-of-type.active::after {
                    content: '✓';
                    position: absolute;
                    top: -15px;
                    left: -15px;
                    width: 40px;
                    height: 40px;
                    background: #fbbf24;
                    border: 4px solid #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 900;
                    box-shadow: 3px 3px 0px #000;
                    animation: brutal-check-bounce 0.5s ease-out;
                    z-index: 100;
                }
                
                .mode-btn:last-of-type.active::after {
                    content: '✓';
                    position: absolute;
                    top: -15px;
                    right: -15px;
                    width: 40px;
                    height: 40px;
                    background: #fbbf24;
                    border: 4px solid #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 900;
                    box-shadow: 3px 3px 0px #000;
                    animation: brutal-check-bounce 0.5s ease-out;
                    z-index: 100;
                }
                
                @keyframes brutal-check-bounce {
                    0% { transform: scale(0) rotate(0deg); }
                    50% { transform: scale(1.2) rotate(-180deg); }
                    100% { transform: scale(1) rotate(-360deg); }
                }
                
                /* Operator symbols with brutal style */
                .operator-symbol {
                    font-size: 32px;
                    font-weight: 900;
                    margin-left: 12px;
                    display: inline-block;
                    transform: translateY(-2px);
                    text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
                    position: relative;
                    z-index: 2;
                }
                
                .mode-btn.active .operator-symbol {
                    animation: brutal-operator-pulse 1s ease-in-out infinite;
                }
                
                @keyframes brutal-operator-pulse {
                    0%, 100% { 
                        transform: translateY(-2px) scale(1);
                        text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
                    }
                    50% { 
                        transform: translateY(-2px) scale(1.2);
                        text-shadow: 5px 5px 0px rgba(0,0,0,0.2);
                    }
                }
                
                /* Brutal hover effects */
                .mode-btn:not(.active):hover .operator-symbol {
                    animation: brutal-symbol-shake 0.3s ease-in-out;
                    color: #dc2626;
                    text-shadow: 
                        4px 4px 0px #fbbf24,
                        5px 5px 0px #000;
                    transform: translateY(-2px) scale(1.2);
                }
                
                @keyframes brutal-symbol-shake {
                    0%, 100% { transform: translateY(-2px) rotate(0deg) scale(1.2); }
                    25% { transform: translateY(-2px) rotate(-15deg) scale(1.3); }
                    75% { transform: translateY(-2px) rotate(15deg) scale(1.3); }
                }
                
                /* Background pattern for active button */
                .mode-btn.active {
                    background-image: 
                        linear-gradient(135deg, #10b981 0%, #34d399 100%),
                        repeating-linear-gradient(
                            -45deg,
                            transparent,
                            transparent 5px,
                            rgba(0,0,0,0.05) 5px,
                            rgba(0,0,0,0.05) 10px
                        );
                    background-blend-mode: normal;
                }
                
                
                @media (max-width: 480px) {
                    :host {
                        transform: translateX(-50%) rotate(-2deg) scale(0.85);
                    }
                    
                    .mode-btn {
                        padding: 16px 25px;
                        font-size: 18px;
                        min-width: 130px;
                    }
                    
                    .operator-symbol {
                        font-size: 26px;
                    }
                    
                    .mode-selector::before {
                        font-size: 12px;
                        padding: 4px 12px;
                        top: -30px;
                    }
                }
                
                @keyframes brutal-selector-entrance {
                    from {
                        opacity: 0;
                        transform: scale(0) rotate(-180deg);
                    }
                    50% {
                        transform: scale(1.1) rotate(10deg);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }
                
                /* Fade out animation */
                .mode-selector.fade-out {
                    animation: brutal-fade-out 0.3s ease-out forwards;
                }
                
                @keyframes brutal-fade-out {
                    0% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                        filter: blur(0px);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.8) rotate(-10deg);
                        filter: blur(4px);
                    }
                }
                
                /* Spin in animation */
                .mode-selector.spin-in {
                    animation: brutal-spin-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                
                @keyframes brutal-spin-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.3) rotate(-360deg);
                        filter: blur(5px);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.1) rotate(-180deg);
                        filter: blur(0px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                        filter: blur(0px);
                    }
                }
            </style>
            
            <div class="mode-selector">
                <button id="greater-btn" class="mode-btn ${this._mode === 'greater' ? 'active' : ''}">
                    Greater
                    <span class="operator-symbol">></span>
                </button>
                <button id="less-btn" class="mode-btn ${this._mode === 'less' ? 'active' : ''}">
                    Less
                    <span class="operator-symbol"><</span>
                </button>
            </div>
        `;
    }
}

customElements.define('mode-selector', ModeSelector);