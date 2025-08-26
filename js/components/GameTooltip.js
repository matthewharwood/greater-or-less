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
                    transform: translate(-50%, -50%);
                    z-index: 200;
                }
                
                .tooltip {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
                    border: 3px solid #ffffff;
                    text-align: center;
                    max-width: 300px;
                    animation: tooltip-bounce 0.5s ease-out;
                }
                
                @keyframes tooltip-bounce {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    70% {
                        transform: scale(1.05);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            </style>
            <div class="tooltip">
                ${this._message}
            </div>
        `;
    }
}

customElements.define('game-tooltip', GameTooltip);