import { TranslationService } from '../services/TranslationService.js';

export class CelebrationScene extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._duration = 12000;
        // Get player name from localStorage, default to translated CHAMPION if not set
        const storedName = localStorage.getItem('playerName');
        this._playerName = storedName && storedName.trim() ? storedName.toUpperCase() : TranslationService.get('champion').toUpperCase();
        this._fireworks = [];
        this._animationId = null;
        this._canvas = null;
        this._ctx = null;
        
        // Listen for language changes
        this._languageListener = () => {
            const storedName = localStorage.getItem('playerName');
            this._playerName = storedName && storedName.trim() ? storedName.toUpperCase() : TranslationService.get('champion').toUpperCase();
            this.render();
        };
        
        // Listen for storage changes (when name changes in another component)
        this._storageListener = (e) => {
            if (e.key === 'playerName' && e.newValue) {
                this._playerName = e.newValue.toUpperCase();
                if (this.shadowRoot) {
                    this.render();
                    this.setupCanvas();
                }
            }
        };
    }

    static get observedAttributes() {
        return ['player-name', 'duration'];
    }

    connectedCallback() {
        this.render();
        this.setupCanvas();
        this.startCelebration();
        TranslationService.addListener(this._languageListener);
        window.addEventListener('storage', this._storageListener);
    }

    disconnectedCallback() {
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
        }
        TranslationService.removeListener(this._languageListener);
        window.removeEventListener('storage', this._storageListener);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'player-name':
                // Use the same logic as constructor - check localStorage first, then use translated champion
                const storedName = localStorage.getItem('playerName');
                this._playerName = newValue || (storedName && storedName.trim() ? storedName.toUpperCase() : TranslationService.get('champion').toUpperCase());
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
                    background: repeating-linear-gradient(
                        45deg,
                        #fbbf24,
                        #fbbf24 20px,
                        #fb7185 20px,
                        #fb7185 40px,
                        #10b981 40px,
                        #10b981 60px,
                        #818cf8 60px,
                        #818cf8 80px
                    );
                    animation: brutal-bg-slide 2s linear infinite;
                }
                
                @keyframes brutal-bg-slide {
                    from { background-position: 0 0; }
                    to { background-position: 113px 113px; }
                }
                
                .celebration-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: repeating-conic-gradient(
                        from 0deg at 50% 50%,
                        transparent 0deg,
                        transparent 20deg,
                        rgba(0,0,0,0.1) 20deg,
                        rgba(0,0,0,0.1) 40deg
                    );
                    animation: brutal-spin 10s linear infinite;
                }
                
                @keyframes brutal-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
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
                    transform: translate(-50%, -50%) rotate(-3deg);
                    text-align: center;
                    z-index: 10;
                    background: #fff;
                    border: 10px solid #000;
                    padding: 40px;
                    box-shadow: 
                        15px 15px 0px #fb7185,
                        30px 30px 0px #fbbf24,
                        45px 45px 0px #10b981;
                    animation: brutal-entrance 0.5s ease-out, brutal-shake 0.3s ease-out 0.5s;
                }
                
                @keyframes brutal-entrance {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) rotate(-3deg) scale(0);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) rotate(-3deg) scale(1);
                    }
                }
                
                @keyframes brutal-shake {
                    0%, 100% { transform: translate(-50%, -50%) rotate(-3deg); }
                    25% { transform: translate(-52%, -48%) rotate(-6deg); }
                    50% { transform: translate(-48%, -52%) rotate(3deg); }
                    75% { transform: translate(-52%, -52%) rotate(-1deg); }
                }
                
                .main-message {
                    font-size: 96px;
                    font-weight: 900;
                    color: #000;
                    text-transform: uppercase;
                    letter-spacing: -0.05em;
                    font-family: 'Roboto', sans-serif;
                    background: linear-gradient(45deg, #fb7185, #fbbf24, #10b981, #818cf8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: none;
                    position: relative;
                    margin-bottom: 30px;
                    animation: brutal-text-pulse 0.5s ease-in-out infinite alternate;
                }
                
                .main-message::before {
                    content: attr(data-text);
                    position: absolute;
                    left: 8px;
                    top: 8px;
                    z-index: -1;
                    color: #000;
                    -webkit-text-fill-color: #000;
                }
                
                @keyframes brutal-text-pulse {
                    from { transform: scale(1) rotate(-1deg); }
                    to { transform: scale(1.05) rotate(1deg); }
                }
                
                .sub-message {
                    font-size: 32px;
                    font-weight: 700;
                    color: #000;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    background: #fbbf24;
                    padding: 10px 20px;
                    border: 5px solid #000;
                    display: inline-block;
                    transform: rotate(2deg);
                    margin-bottom: 20px;
                    box-shadow: 5px 5px 0px #000;
                }
                
                .player-name {
                    font-size: 72px;
                    font-weight: 900;
                    color: #000;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    background: #10b981;
                    padding: 15px 30px;
                    border: 6px solid #000;
                    display: inline-block;
                    transform: rotate(-2deg);
                    box-shadow: 8px 8px 0px #000;
                    position: relative;
                    animation: brutal-name-bounce 0.8s ease-in-out infinite;
                }
                
                .player-name::after {
                    content: '!!!';
                    position: absolute;
                    right: -40px;
                    top: -20px;
                    font-size: 48px;
                    color: #000;
                    background: #fb7185;
                    padding: 5px 10px;
                    border: 4px solid #000;
                    transform: rotate(15deg);
                    box-shadow: 4px 4px 0px #000;
                }
                
                @keyframes brutal-name-bounce {
                    0%, 100% { transform: rotate(-2deg) translateY(0); }
                    50% { transform: rotate(-2deg) translateY(-10px); }
                }
                
                .achievement-badge {
                    display: inline-block;
                    background: repeating-linear-gradient(
                        -45deg,
                        #818cf8,
                        #818cf8 10px,
                        #fbbf24 10px,
                        #fbbf24 20px
                    );
                    color: #000;
                    padding: 25px 40px;
                    border: 8px solid #000;
                    border-radius: 0;
                    font-size: 32px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 30px;
                    box-shadow: 
                        10px 10px 0px #000,
                        10px 10px 0px 5px #fb7185;
                    animation: brutal-badge-rotate 2s ease-in-out infinite;
                    transform: rotate(5deg);
                }
                
                @keyframes brutal-badge-rotate {
                    0%, 100% { transform: rotate(5deg) scale(1); }
                    25% { transform: rotate(-5deg) scale(1.05); }
                    50% { transform: rotate(5deg) scale(1.1); }
                    75% { transform: rotate(-3deg) scale(1.05); }
                }
                
                .stars {
                    font-size: 64px;
                    position: relative;
                    display: inline-block;
                    animation: brutal-stars 0.5s ease-in-out infinite alternate;
                }
                
                .stars::before {
                    content: '★ ★ ★ ★ ★';
                    position: absolute;
                    left: 5px;
                    top: 5px;
                    color: #000;
                    z-index: -1;
                }
                
                @keyframes brutal-stars {
                    from { transform: scale(1) rotate(-5deg); }
                    to { transform: scale(1.1) rotate(5deg); }
                }
                
                /* Brutal geometric shapes */
                .brutal-shape {
                    position: absolute;
                    background: #fb7185;
                    border: 6px solid #000;
                    animation: brutal-float 3s ease-in-out infinite;
                }
                
                .brutal-shape-1 {
                    width: 100px;
                    height: 100px;
                    top: 10%;
                    left: 10%;
                    transform: rotate(45deg);
                    animation-delay: 0s;
                }
                
                .brutal-shape-2 {
                    width: 80px;
                    height: 80px;
                    top: 20%;
                    right: 15%;
                    background: #fbbf24;
                    animation-delay: 0.5s;
                }
                
                .brutal-shape-3 {
                    width: 120px;
                    height: 120px;
                    bottom: 15%;
                    left: 20%;
                    background: #10b981;
                    transform: rotate(30deg);
                    animation-delay: 1s;
                }
                
                .brutal-shape-4 {
                    width: 90px;
                    height: 90px;
                    bottom: 20%;
                    right: 10%;
                    background: #818cf8;
                    transform: rotate(60deg);
                    animation-delay: 1.5s;
                }
                
                @keyframes brutal-float {
                    0%, 100% { transform: translateY(0) rotate(45deg); }
                    50% { transform: translateY(-30px) rotate(50deg); }
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
                <div class="brutal-shape brutal-shape-1"></div>
                <div class="brutal-shape brutal-shape-2"></div>
                <div class="brutal-shape brutal-shape-3"></div>
                <div class="brutal-shape brutal-shape-4"></div>
                <div class="message-container">
                    <div class="stars">★ ★ ★ ★ ★</div>
                    <div class="main-message" data-text="${TranslationService.get('incredible').toUpperCase()}">${TranslationService.get('incredible').toUpperCase()}</div>
                    <div class="sub-message">${TranslationService.get('youCrushedIt').toUpperCase()}</div>
                    <div class="player-name">${this._playerName}</div>
                    <div class="achievement-badge">
                        🏆 ${TranslationService.get('streakLegend').toUpperCase()} 🏆
                    </div>
                    <div class="stars">★ ★ ★ ★ ★</div>
                </div>
            </div>
        `;
    }
}

customElements.define('celebration-scene', CelebrationScene);