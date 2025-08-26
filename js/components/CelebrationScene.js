export class CelebrationScene extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._duration = 12000;
        this._playerName = 'Dean';
        this._fireworks = [];
        this._animationId = null;
        this._canvas = null;
        this._ctx = null;
    }

    static get observedAttributes() {
        return ['player-name', 'duration'];
    }

    connectedCallback() {
        this.render();
        this.setupCanvas();
        this.startCelebration();
    }

    disconnectedCallback() {
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'player-name':
                this._playerName = newValue || 'Dean';
                break;
            case 'duration':
                this._duration = parseInt(newValue) || 12000;
                break;
        }
    }

    startCelebration() {
        // Play celebration audio
        this.playCheerSound();
        
        // Start fireworks animation
        this.createFireworks();
        this.animateFireworks();
        
        // Auto close after duration
        setTimeout(() => {
            this.endCelebration();
        }, this._duration);
    }

    playCheerSound() {
        const audio = new Audio('img/cheer.mp3');
        audio.volume = 0.8;
        audio.play().catch(e => console.log('Could not play cheer sound:', e));
    }

    endCelebration() {
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
        }
        
        // Dispatch event to notify parent
        this.dispatchEvent(new CustomEvent('celebration-complete'));
        
        // Remove from DOM
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    }

    setupCanvas() {
        this._canvas = this.shadowRoot.querySelector('#fireworks-canvas');
        if (this._canvas) {
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;
            this._ctx = this._canvas.getContext('2d');
        }
    }

    createFireworks() {
        // Create multiple firework launchers
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.launchFirework();
            }, i * 300);
        }
        
        // Continue launching fireworks periodically
        this._launchInterval = setInterval(() => {
            if (Math.random() < 0.7) {
                this.launchFirework();
            }
        }, 600);
        
        // Stop launching new fireworks before the end
        setTimeout(() => {
            clearInterval(this._launchInterval);
        }, this._duration - 3000);
    }

    launchFirework() {
        const colors = [
            '#ff0000', '#00ff00', '#0000ff', 
            '#ffff00', '#ff00ff', '#00ffff',
            '#ffa500', '#ff69b4', '#00ff7f'
        ];
        
        const firework = {
            x: Math.random() * this._canvas.width,
            y: this._canvas.height,
            targetY: Math.random() * (this._canvas.height * 0.5) + 100,
            vx: (Math.random() - 0.5) * 2,
            vy: -15 - Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            trail: [],
            exploded: false,
            particles: []
        };
        
        this._fireworks.push(firework);
    }

    explodeFirework(firework) {
        firework.exploded = true;
        const particleCount = 50 + Math.floor(Math.random() * 50);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 3 + Math.random() * 4;
            
            firework.particles.push({
                x: firework.x,
                y: firework.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                alpha: 1,
                size: 2 + Math.random() * 2
            });
        }
    }

    animateFireworks() {
        if (!this._ctx || !this._canvas) return;
        
        // Create trail effect
        this._ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        
        // Update and draw fireworks
        for (let i = this._fireworks.length - 1; i >= 0; i--) {
            const fw = this._fireworks[i];
            
            if (!fw.exploded) {
                // Update position
                fw.x += fw.vx;
                fw.y += fw.vy;
                fw.vy += 0.3; // gravity
                
                // Add to trail
                fw.trail.push({ x: fw.x, y: fw.y });
                if (fw.trail.length > 10) {
                    fw.trail.shift();
                }
                
                // Draw trail
                this._ctx.strokeStyle = fw.color;
                this._ctx.lineWidth = 2;
                this._ctx.beginPath();
                fw.trail.forEach((point, index) => {
                    if (index === 0) {
                        this._ctx.moveTo(point.x, point.y);
                    } else {
                        this._ctx.lineTo(point.x, point.y);
                    }
                });
                this._ctx.stroke();
                
                // Draw firework
                this._ctx.fillStyle = fw.color;
                this._ctx.beginPath();
                this._ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
                this._ctx.fill();
                
                // Check if should explode
                if (fw.y <= fw.targetY || fw.vy >= 0) {
                    this.explodeFirework(fw);
                }
            } else {
                // Update and draw particles
                let allFaded = true;
                
                fw.particles.forEach(particle => {
                    if (particle.alpha > 0) {
                        allFaded = false;
                        
                        // Update particle
                        particle.x += particle.vx;
                        particle.y += particle.vy;
                        particle.vy += 0.1; // gravity
                        particle.vx *= 0.99; // air resistance
                        particle.alpha -= 0.01;
                        
                        // Draw particle
                        this._ctx.fillStyle = fw.color;
                        this._ctx.globalAlpha = particle.alpha;
                        this._ctx.beginPath();
                        this._ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                        this._ctx.fill();
                    }
                });
                
                this._ctx.globalAlpha = 1;
                
                // Remove if all particles faded
                if (allFaded) {
                    this._fireworks.splice(i, 1);
                }
            }
        }
        
        this._animationId = requestAnimationFrame(() => this.animateFireworks());
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .celebration-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    background: linear-gradient(to bottom, #000428, #004e92);
                }
                
                #fireworks-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                
                .message-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    z-index: 10;
                    animation: message-entrance 1s ease-out;
                }
                
                .main-message {
                    font-size: 72px;
                    font-weight: bold;
                    color: #ffffff;
                    text-shadow: 
                        3px 3px 0 #ff00ff,
                        -3px -3px 0 #00ffff,
                        3px -3px 0 #ffff00,
                        -3px 3px 0 #00ff00,
                        0 0 30px rgba(255, 255, 255, 0.8);
                    margin-bottom: 20px;
                    animation: rainbow-text 2s linear infinite, bounce 1s ease-in-out infinite;
                }
                
                .sub-message {
                    font-size: 36px;
                    color: #ffffff;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                    margin-bottom: 20px;
                    animation: glow 2s ease-in-out infinite;
                }
                
                .player-name {
                    font-size: 56px;
                    font-weight: bold;
                    color: #ffd700;
                    text-shadow: 
                        2px 2px 0 #ff6b6b,
                        4px 4px 10px rgba(255, 215, 0, 0.5);
                    animation: name-pulse 1.5s ease-in-out infinite;
                }
                
                .achievement-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px 40px;
                    border-radius: 50px;
                    font-size: 28px;
                    font-weight: bold;
                    margin-top: 30px;
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
                    animation: badge-float 3s ease-in-out infinite;
                }
                
                .stars {
                    font-size: 48px;
                    animation: star-spin 2s linear infinite;
                }
                
                @keyframes message-entrance {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                
                @keyframes rainbow-text {
                    0%, 100% { color: #ff0000; }
                    16% { color: #ff8800; }
                    33% { color: #ffff00; }
                    50% { color: #00ff00; }
                    66% { color: #0088ff; }
                    83% { color: #ff00ff; }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes glow {
                    0%, 100% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.5); }
                    50% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 255, 255, 0.8); }
                }
                
                @keyframes name-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                @keyframes badge-float {
                    0%, 100% { transform: translateY(0) rotate(-2deg); }
                    50% { transform: translateY(-10px) rotate(2deg); }
                }
                
                @keyframes star-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @media (max-width: 768px) {
                    .main-message { font-size: 48px; }
                    .sub-message { font-size: 24px; }
                    .player-name { font-size: 36px; }
                    .achievement-badge { font-size: 20px; padding: 15px 30px; }
                    .stars { font-size: 36px; }
                }
            </style>
            
            <div class="celebration-container">
                <canvas id="fireworks-canvas"></canvas>
                <div class="message-container">
                    <div class="stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
                    <div class="main-message">INCREDIBLE!</div>
                    <div class="sub-message">You did an amazing job,</div>
                    <div class="player-name">${this._playerName}!</div>
                    <div class="achievement-badge">
                        🏆 10 IN A ROW CHAMPION! 🏆
                    </div>
                    <div class="stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
                </div>
            </div>
        `;
    }
}

customElements.define('celebration-scene', CelebrationScene);