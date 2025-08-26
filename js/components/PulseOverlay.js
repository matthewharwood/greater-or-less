export class PulseOverlay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._color = 'red';
        this._duration = 600;
        this._timeoutId = null;
    }

    static get observedAttributes() {
        return ['color', 'duration'];
    }

    connectedCallback() {
        this.render();
        this.startAutoRemove();
    }

    disconnectedCallback() {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'color':
                this._color = newValue || 'red';
                break;
            case 'duration':
                this._duration = parseInt(newValue) || 600;
                break;
        }
        if (this.shadowRoot) {
            this.render();
        }
    }

    pulse(color = 'red', duration = 600) {
        this._color = color;
        this._duration = duration;
        this.render();
        this.startAutoRemove();
    }

    startAutoRemove() {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
        this._timeoutId = setTimeout(() => {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        }, this._duration);
    }

    render() {
        const colorConfig = {
            red: 'rgba(255, 0, 0, 0.3)',
            green: 'rgba(0, 255, 0, 0.3)'
        };

        const bgColor = colorConfig[this._color] || colorConfig.red;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1000;
                }
                
                .overlay {
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, ${bgColor} 0%, rgba(0, 0, 0, 0) 70%);
                    animation: pulse-animation ${this._duration}ms ease-out;
                }
                
                @keyframes pulse-animation {
                    0% {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1);
                    }
                }
            </style>
            <div class="overlay"></div>
        `;
    }
}

customElements.define('pulse-overlay', PulseOverlay);