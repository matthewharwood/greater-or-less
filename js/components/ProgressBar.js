export class ProgressBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._streak = 0;
        this._maxStreak = 10;
        this._isAnimating = false;
    }

    static get observedAttributes() {
        return ['streak'];
    }

    connectedCallback() {
        this.render();
        this.loadStreak();
        this.attachEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'streak') {
            this._streak = parseInt(newValue) || 0;
            if (this.shadowRoot) {
                this.updateProgress();
            }
        }
    }

    set streak(val) {
        const newStreak = Math.min(val, this._maxStreak);
        this.setAttribute('streak', newStreak.toString());
        this.saveStreak(newStreak);
    }

    get streak() {
        return this._streak;
    }

    incrementStreak() {
        if (this._streak < this._maxStreak) {
            this._streak++;
            this.saveStreak(this._streak);
            this.updateProgress();
            
            if (this._streak === this._maxStreak) {
                this.celebrate();
            }
        }
    }

    resetStreak() {
        if (this._streak > 0) {
            this.animateDrain(() => {
                this._streak = 0;
                this.saveStreak(0);
                this.updateProgress();
            });
        }
    }

    saveStreak(value) {
        localStorage.setItem('gameStreak', value.toString());
    }

    loadStreak() {
        const saved = localStorage.getItem('gameStreak');
        if (saved) {
            this._streak = parseInt(saved) || 0;
            // Prevent getting stuck at 10
            if (this._streak >= this._maxStreak) {
                this._streak = 0;
                this.saveStreak(0);
            }
            this.updateProgress();
        }
    }
    
    attachEventListeners() {
        // Add double-tap handler to counter for manual reset
        const counter = this.shadowRoot.querySelector('.streak-counter');
        if (counter) {
            let lastTap = 0;
            counter.addEventListener('click', (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 500 && tapLength > 0) {
                    // Double tap detected
                    this.manualReset();
                    e.preventDefault();
                }
                lastTap = currentTime;
            });
        }
    }
    
    manualReset() {
        // Confirm reset
        const counter = this.shadowRoot.querySelector('.streak-counter');
        if (counter) {
            // Show reset feedback
            counter.classList.add('resetting');
            counter.textContent = 'Resetting...';
            
            setTimeout(() => {
                // Clear all game-related localStorage
                localStorage.removeItem('gameStreak');
                localStorage.removeItem('gameRound');
                
                // Reset streak
                this._streak = 0;
                this.updateProgress();
                
                // Remove resetting class
                counter.classList.remove('resetting');
                
                // Optional: reload page for fresh start
                location.reload();
            }, 500);
        }
    }

    animateDrain(callback) {
        const fill = this.shadowRoot.querySelector('.progress-fill');
        const liquid = this.shadowRoot.querySelector('.progress-liquid');
        
        if (fill && liquid) {
            this._isAnimating = true;
            
            // Add drain animation class
            fill.classList.add('draining');
            liquid.classList.add('draining');
            
            setTimeout(() => {
                fill.classList.remove('draining');
                liquid.classList.remove('draining');
                this._isAnimating = false;
                if (callback) callback();
            }, 800);
        }
    }

    updateProgress() {
        const percentage = (this._streak / this._maxStreak) * 100;
        const fill = this.shadowRoot.querySelector('.progress-fill');
        const liquid = this.shadowRoot.querySelector('.progress-liquid');
        const counter = this.shadowRoot.querySelector('.streak-counter');
        
        if (fill && liquid) {
            fill.style.height = `${percentage}%`;
            liquid.style.height = `${percentage}%`;
        }
        
        if (counter) {
            counter.textContent = `${this._streak}/10`;
            
            // Add pulse effect on increment
            if (this._streak > 0) {
                counter.classList.add('pulse');
                setTimeout(() => {
                    counter.classList.remove('pulse');
                }, 500);
            }
        }
    }

    celebrate() {
        // Create and show celebration scene
        const celebration = document.createElement('celebration-scene');
        celebration.setAttribute('player-name', 'Dean');
        celebration.setAttribute('duration', '12000');
        
        celebration.addEventListener('celebration-complete', () => {
            // Reset streak after celebration
            this._streak = 0;
            this.saveStreak(0);
            this.updateProgress();
            
            // Reload the page to restart the game
            location.reload();
        });
        
        document.body.appendChild(celebration);
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
                    pointer-events: none;
                    z-index: 1;
                }
                
                .progress-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                
                .progress-fill {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 0%;
                    background: linear-gradient(180deg, 
                        rgba(76, 217, 100, 0.3) 0%,
                        rgba(52, 199, 89, 0.4) 25%,
                        rgba(48, 176, 199, 0.45) 50%,
                        rgba(52, 199, 89, 0.4) 75%,
                        rgba(76, 217, 100, 0.3) 100%
                    );
                    background-size: 100% 400%;
                    animation: gradient-shift 8s ease-in-out infinite;
                    transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: height, background-position;
                }
                
                @keyframes gradient-shift {
                    0% {
                        background-position: 0% 0%;
                    }
                    50% {
                        background-position: 0% 100%;
                    }
                    100% {
                        background-position: 0% 0%;
                    }
                }
                
                .progress-liquid {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 0%;
                    background: linear-gradient(90deg,
                        rgba(52, 199, 89, 0.15),
                        rgba(76, 217, 100, 0.2),
                        rgba(48, 176, 199, 0.25),
                        rgba(76, 217, 100, 0.2),
                        rgba(52, 199, 89, 0.15)
                    );
                    background-size: 200% 100%;
                    animation: liquid-flow 6s linear infinite;
                    transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }
                
                @keyframes liquid-flow {
                    0% {
                        background-position: -100% 0;
                    }
                    100% {
                        background-position: 100% 0;
                    }
                }
                
                .progress-liquid::before {
                    content: '';
                    position: absolute;
                    top: -5px;
                    left: -100%;
                    width: 200%;
                    height: 20px;
                    background: linear-gradient(90deg,
                        transparent,
                        rgba(255, 255, 255, 0.3),
                        transparent
                    );
                    animation: wave 3s linear infinite;
                }
                
                @keyframes wave {
                    0% {
                        left: -100%;
                    }
                    100% {
                        left: 100%;
                    }
                }
                
                .progress-fill.draining,
                .progress-liquid.draining {
                    transition: height 0.8s ease-in;
                    height: 0% !important;
                }
                
                
                .streak-counter {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 12px 20px;
                    border-radius: 25px;
                    font-size: 18px;
                    font-weight: bold;
                    color: #34c759;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    pointer-events: auto;
                    z-index: 12;
                    transition: transform 0.3s ease, background 0.3s ease;
                    cursor: default;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }
                
                .streak-counter.resetting {
                    background: rgba(255, 107, 107, 0.95);
                    color: white;
                    animation: shake 0.5s ease;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .streak-counter.pulse {
                    animation: counter-pulse 0.5s ease;
                }
                
                @keyframes counter-pulse {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                
                
                
                @media (max-width: 480px) {
                    .streak-counter {
                        bottom: 10px;
                        right: 10px;
                        font-size: 16px;
                        padding: 10px 16px;
                    }
                }
            </style>
            <div class="progress-container">
                <div class="progress-fill"></div>
                <div class="progress-liquid"></div>
            </div>
            <div class="streak-counter">0/10</div>
        `;
    }
}

customElements.define('progress-bar', ProgressBar);