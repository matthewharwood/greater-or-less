export class ConfettiCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._canvas = null;
        this._ctx = null;
        this._confettiPieces = [];
        this._animationId = null;
    }

    connectedCallback() {
        this.render();
        this.setupCanvas();
        this.start();
    }

    disconnectedCallback() {
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 10;
                }
                
                canvas {
                    width: 100%;
                    height: 100%;
                }
            </style>
            <canvas></canvas>
        `;
    }

    setupCanvas() {
        this._canvas = this.shadowRoot.querySelector('canvas');
        const rect = this.getBoundingClientRect();
        this._canvas.width = rect.width;
        this._canvas.height = rect.height;
        this._ctx = this._canvas.getContext('2d');
    }

    start() {
        this.createConfetti();
        this.animate();
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
        const count = 100;
        
        this._confettiPieces = [];
        for (let i = 0; i < count; i++) {
            this._confettiPieces.push({
                x: Math.random() * this._canvas.width,
                y: -10,
                vx: Math.random() * 4 - 2,
                vy: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 3,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }
    }

    animate() {
        if (!this._ctx || !this._canvas) return;
        
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        
        for (let i = this._confettiPieces.length - 1; i >= 0; i--) {
            const piece = this._confettiPieces[i];
            
            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.rotation += piece.rotationSpeed;
            
            this._ctx.save();
            this._ctx.translate(piece.x, piece.y);
            this._ctx.rotate(piece.rotation * Math.PI / 180);
            this._ctx.fillStyle = piece.color;
            this._ctx.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
            this._ctx.restore();
            
            // Remove pieces that have fallen off screen
            if (piece.y > this._canvas.height + 10) {
                this._confettiPieces.splice(i, 1);
            }
        }
        
        if (this._confettiPieces.length > 0) {
            this._animationId = requestAnimationFrame(() => this.animate());
        } else {
            // Remove component when animation is done
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        }
    }
}

customElements.define('confetti-canvas', ConfettiCanvas);