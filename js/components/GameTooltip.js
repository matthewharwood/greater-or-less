export class GameTooltip extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._message = '';
        this._duration = 3750;
        this._timeoutId = null;
    }

    static get observedAttributes() {
        return ['message', 'duration'];
    }

    connectedCallback() {
        this.render();
        this.startAutoHide();
    }

    disconnectedCallback() {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'message':
                this._message = newValue || '';
                break;
            case 'duration':
                this._duration = parseInt(newValue) || 3750;
                break;
        }
        if (this.shadowRoot) {
            this.render();
        }
    }

    set message(val) {
        this.setAttribute('message', val);
    }

    get message() {
        return this._message;
    }

    set duration(val) {
        this.setAttribute('duration', val.toString());
    }

    show(message, duration = 3750) {
        this._message = message;
        this._duration = duration;
        this.render();
        this.startAutoHide();
    }

    hide() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    }

    startAutoHide() {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
        this._timeoutId = setTimeout(() => {
            this.hide();
        }, this._duration);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-5deg);
                    z-index: 200;
                }
                
                .tooltip {
                    background: repeating-linear-gradient(
                        135deg,
                        #fb7185 0px,
                        #fb7185 20px,
                        #fbbf24 20px,
                        #fbbf24 40px
                    );
                    color: #000;
                    padding: 30px 40px;
                    border: 8px solid #000;
                    border-radius: 0;
                    font-size: 24px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-family: 'Roboto', sans-serif;
                    text-align: center;
                    max-width: 400px;
                    position: relative;
                    box-shadow: 
                        12px 12px 0px #000,
                        12px 12px 0px 8px #10b981;
                    animation: brutal-tooltip-entrance 0.3s ease-out, brutal-tooltip-shake 2s ease-in-out infinite;
                }
                
                .tooltip::before {
                    content: '⚠';
                    position: absolute;
                    left: -40px;
                    top: 50%;
                    transform: translateY(-50%) rotate(-15deg);
                    font-size: 60px;
                    background: #fbbf24;
                    border: 6px solid #000;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 6px 6px 0px #000;
                    animation: brutal-warning-pulse 0.5s ease-in-out infinite alternate;
                }
                
                .tooltip::after {
                    content: '!';
                    position: absolute;
                    right: -30px;
                    top: -30px;
                    font-size: 48px;
                    font-weight: 900;
                    background: #fff;
                    border: 5px solid #000;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 4px 4px 0px #000;
                    transform: rotate(15deg);
                    animation: brutal-exclaim-bounce 0.3s ease-in-out infinite alternate;
                }
                
                /* Arrow pointing down */
                .arrow-down {
                    position: absolute;
                    bottom: -40px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 30px solid transparent;
                    border-right: 30px solid transparent;
                    border-top: 40px solid #000;
                    animation: brutal-arrow-point 0.5s ease-in-out infinite alternate;
                }
                
                .arrow-down::before {
                    content: '';
                    position: absolute;
                    top: -40px;
                    left: -22px;
                    width: 0;
                    height: 0;
                    border-left: 22px solid transparent;
                    border-right: 22px solid transparent;
                    border-top: 32px solid #fb7185;
                }
                
                @keyframes brutal-tooltip-entrance {
                    0% {
                        opacity: 0;
                        transform: scale(0) rotate(-5deg);
                    }
                    50% {
                        transform: scale(1.2) rotate(-8deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(-5deg);
                    }
                }
                
                @keyframes brutal-tooltip-shake {
                    0%, 100% { transform: rotate(-5deg) translateX(0); }
                    25% { transform: rotate(-3deg) translateX(-5px); }
                    50% { transform: rotate(-7deg) translateX(5px); }
                    75% { transform: rotate(-4deg) translateX(-3px); }
                }
                
                @keyframes brutal-warning-pulse {
                    from { 
                        transform: translateY(-50%) rotate(-15deg) scale(1); 
                        background: #fbbf24;
                    }
                    to { 
                        transform: translateY(-50%) rotate(-20deg) scale(1.1); 
                        background: #f59e0b;
                    }
                }
                
                @keyframes brutal-exclaim-bounce {
                    from { transform: rotate(15deg) scale(1); }
                    to { transform: rotate(20deg) scale(1.15); }
                }
                
                @keyframes brutal-arrow-point {
                    from { transform: translateX(-50%) translateY(0); }
                    to { transform: translateX(-50%) translateY(10px); }
                }
                
                /* Flashing border effect */
                @keyframes brutal-border-flash {
                    0%, 100% { border-color: #000; }
                    50% { border-color: #fb7185; }
                }
                
                .tooltip {
                    animation: 
                        brutal-tooltip-entrance 0.3s ease-out,
                        brutal-tooltip-shake 2s ease-in-out infinite,
                        brutal-border-flash 0.5s ease-in-out infinite;
                }
                
                /* Inner text styling */
                .tooltip-text {
                    position: relative;
                    z-index: 2;
                    text-shadow: 
                        3px 3px 0px #fff,
                        4px 4px 0px #000;
                }
                
                /* Background pattern overlay */
                .pattern-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 10px,
                        rgba(0,0,0,0.1) 10px,
                        rgba(0,0,0,0.1) 11px
                    );
                    pointer-events: none;
                }
            </style>
            <div class="tooltip">
                <div class="pattern-overlay"></div>
                <div class="tooltip-text">${this._message}</div>
                <div class="arrow-down"></div>
            </div>
        `;
    }
}

customElements.define('game-tooltip', GameTooltip);