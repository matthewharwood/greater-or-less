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
            this.updateProgress(true); // Pass true to indicate this is from an increment
            
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

    updateProgress(isIncrement = false) {
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
            counter.setAttribute('data-streak', this._streak.toString());
            
            // Only add pulse effect when incrementing (correct answer)
            if (isIncrement && this._streak > 0) {
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
                    left: -10%;
                    width: 120%;
                    height: 0%;
                    background: linear-gradient(165deg, 
                        #10b981 0%,
                        #34d399 25%,
                        #fbbf24 50%,
                        #fb923c 75%,
                        #fb7185 100%
                    );
                    background-size: 100% 400%;
                    animation: gradient-shift 8s ease-in-out infinite;
                    transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: height, background-position, transform;
                    transform: skewX(-5deg);
                    transform-origin: bottom left;
                    overflow: hidden;
                }
                
                /* Brutal wave top edge */
                .progress-fill::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -10%;
                    width: 120%;
                    height: 100%;
                    background: inherit;
                    clip-path: polygon(
                        0% 100%, 0% 20px,
                        5% 15px, 10% 20px, 15% 10px, 20% 18px,
                        25% 8px, 30% 16px, 35% 6px, 40% 14px,
                        45% 4px, 50% 12px, 55% 2px, 60% 10px,
                        65% 0px, 70% 8px, 75% 2px, 80% 10px,
                        85% 4px, 90% 12px, 95% 6px, 100% 14px,
                        100% 100%
                    );
                    animation: brutal-wave-morph 3s ease-in-out infinite;
                }
                
                /* Additional brutal edge layer */
                .progress-fill::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 20px;
                    background: repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 20px,
                        rgba(0,0,0,0.1) 20px,
                        rgba(0,0,0,0.1) 40px
                    );
                    animation: brutal-stripe-move 2s linear infinite;
                }
                
                @keyframes brutal-wave-morph {
                    0%, 100% {
                        clip-path: polygon(
                            0% 100%, 0% 20px,
                            5% 15px, 10% 20px, 15% 10px, 20% 18px,
                            25% 8px, 30% 16px, 35% 6px, 40% 14px,
                            45% 4px, 50% 12px, 55% 2px, 60% 10px,
                            65% 0px, 70% 8px, 75% 2px, 80% 10px,
                            85% 4px, 90% 12px, 95% 6px, 100% 14px,
                            100% 100%
                        );
                    }
                    50% {
                        clip-path: polygon(
                            0% 100%, 0% 10px,
                            5% 18px, 10% 8px, 15% 16px, 20% 6px,
                            25% 14px, 30% 4px, 35% 12px, 40% 2px,
                            45% 10px, 50% 0px, 55% 8px, 60% 2px,
                            65% 10px, 70% 4px, 75% 12px, 80% 6px,
                            85% 14px, 90% 8px, 95% 16px, 100% 10px,
                            100% 100%
                        );
                    }
                }
                
                @keyframes brutal-stripe-move {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(40px);
                    }
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
                    left: -10%;
                    width: 120%;
                    height: 0%;
                    background: repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 10px,
                        rgba(0,0,0,0.15) 10px,
                        rgba(0,0,0,0.15) 20px
                    );
                    background-size: 200% 100%;
                    animation: liquid-flow 4s linear infinite;
                    transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    transform: skewX(-5deg);
                    transform-origin: bottom left;
                    mix-blend-mode: multiply;
                }
                
                @keyframes liquid-flow {
                    0% {
                        background-position: 0 0;
                    }
                    100% {
                        background-position: 28px 0;
                    }
                }
                
                /* Brutal zigzag wave top */
                .progress-liquid::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 15px;
                    background: linear-gradient(
                        45deg,
                        #000 25%,
                        transparent 25%,
                        transparent 75%,
                        #000 75%,
                        #000
                    ),
                    linear-gradient(
                        -45deg,
                        #000 25%,
                        transparent 25%,
                        transparent 75%,
                        #000 75%,
                        #000
                    );
                    background-size: 20px 20px;
                    background-position: 0 0, 10px 10px;
                    animation: zigzag-move 1s linear infinite;
                    opacity: 0.2;
                }
                
                @keyframes zigzag-move {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(20px);
                    }
                }
                
                .progress-fill.draining,
                .progress-liquid.draining {
                    transition: height 0.8s ease-in;
                    height: 0% !important;
                }
                
                
                .streak-counter {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: linear-gradient(135deg, #fbbf24 0%, #fb923c 100%);
                    padding: 25px 35px;
                    border: 8px solid #000;
                    border-radius: 0;
                    font-size: 32px;
                    font-weight: 900;
                    color: #000;
                    box-shadow: 
                        10px 10px 0px #000,
                        10px 10px 0px 8px #10b981,
                        20px 20px 0px 8px #000,
                        20px 20px 0px 12px #fb7185;
                    pointer-events: auto;
                    z-index: 12;
                    transition: all 0.1s ease;
                    cursor: pointer;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    transform: rotate(-3deg);
                    font-family: 'Roboto', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    position: relative;
                    overflow: visible;
                    text-shadow: 3px 3px 0px rgba(0,0,0,0.2);
                }
                
                /* ULTRA Brutal badge */
                .streak-counter::before {
                    content: 'STREAK';
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%) rotate(-8deg);
                    background: #dc2626;
                    color: #fff;
                    padding: 5px 15px;
                    border: 4px solid #000;
                    font-size: 14px;
                    font-weight: 900;
                    letter-spacing: 0.15em;
                    box-shadow: 4px 4px 0px #000;
                    animation: brutal-badge-float 2s ease-in-out infinite;
                    z-index: 10;
                }
                
                /* Fire emoji indicators */
                .streak-counter::after {
                    content: '🔥';
                    position: absolute;
                    top: -15px;
                    right: -20px;
                    font-size: 40px;
                    animation: brutal-fire-dance 1s ease-in-out infinite;
                    filter: drop-shadow(3px 3px 0px rgba(0,0,0,0.3));
                }
                
                /* Additional floating elements */
                .streak-counter[data-streak="10"]::after {
                    content: '🔥🔥🔥';
                    font-size: 45px;
                    animation: brutal-fire-explosion 0.5s ease-out;
                }
                
                .streak-counter[data-streak="5"]::after,
                .streak-counter[data-streak="6"]::after,
                .streak-counter[data-streak="7"]::after,
                .streak-counter[data-streak="8"]::after,
                .streak-counter[data-streak="9"]::after {
                    content: '🔥🔥';
                    animation: brutal-fire-dance 0.8s ease-in-out infinite;
                }
                
                @keyframes brutal-badge-float {
                    0%, 100% { transform: translateX(-50%) rotate(-8deg) translateY(0); }
                    50% { transform: translateX(-50%) rotate(-12deg) translateY(-5px); }
                }
                
                @keyframes brutal-fire-dance {
                    0%, 100% { 
                        transform: rotate(-10deg) scale(1);
                    }
                    25% {
                        transform: rotate(10deg) scale(1.1);
                    }
                    50% { 
                        transform: rotate(-5deg) scale(1.2);
                    }
                    75% {
                        transform: rotate(5deg) scale(1.1);
                    }
                }
                
                @keyframes brutal-fire-explosion {
                    0% { 
                        transform: scale(0) rotate(0deg);
                        opacity: 0;
                    }
                    50% { 
                        transform: scale(1.5) rotate(180deg);
                        opacity: 1;
                    }
                    100% { 
                        transform: scale(1) rotate(360deg);
                        opacity: 1;
                    }
                }
                
                /* Hover effects */
                .streak-counter:hover {
                    transform: rotate(-3deg) translateY(-3px);
                    box-shadow: 
                        12px 12px 0px #000,
                        12px 12px 0px 8px #10b981,
                        24px 24px 0px 8px #000,
                        24px 24px 0px 12px #fb7185;
                }
                
                .streak-counter:active {
                    transform: rotate(-3deg) translateY(2px);
                    box-shadow: 
                        6px 6px 0px #000,
                        6px 6px 0px 8px #10b981,
                        12px 12px 0px 8px #000,
                        12px 12px 0px 12px #fb7185;
                }
                
                .streak-counter.resetting {
                    background: repeating-linear-gradient(
                        -45deg,
                        #dc2626,
                        #dc2626 10px,
                        #000 10px,
                        #000 20px
                    );
                    color: white;
                    animation: brutal-reset-shake 0.5s ease;
                    transform: rotate(0deg);
                }
                
                @keyframes brutal-reset-shake {
                    0%, 100% { transform: rotate(0deg) translateX(0); }
                    10% { transform: rotate(-5deg) translateX(-10px); }
                    20% { transform: rotate(5deg) translateX(10px); }
                    30% { transform: rotate(-5deg) translateX(-10px); }
                    40% { transform: rotate(5deg) translateX(10px); }
                    50% { transform: rotate(-3deg) translateX(-5px); }
                    60% { transform: rotate(3deg) translateX(5px); }
                    70% { transform: rotate(-2deg) translateX(-3px); }
                    80% { transform: rotate(2deg) translateX(3px); }
                    90% { transform: rotate(-1deg) translateX(-1px); }
                }
                
                .streak-counter.pulse {
                    animation: brutal-counter-pulse 0.5s ease;
                }
                
                @keyframes brutal-counter-pulse {
                    0% {
                        transform: rotate(-3deg) scale(1);
                        box-shadow: 
                            10px 10px 0px #000,
                            10px 10px 0px 8px #10b981,
                            20px 20px 0px 8px #000,
                            20px 20px 0px 12px #fb7185;
                    }
                    50% {
                        transform: rotate(-5deg) scale(1.3);
                        box-shadow: 
                            15px 15px 0px #000,
                            15px 15px 0px 8px #10b981,
                            30px 30px 0px 8px #000,
                            30px 30px 0px 12px #fb7185,
                            0 0 50px rgba(251, 191, 36, 0.5);
                    }
                    100% {
                        transform: rotate(-3deg) scale(1);
                        box-shadow: 
                            10px 10px 0px #000,
                            10px 10px 0px 8px #10b981,
                            20px 20px 0px 8px #000,
                            20px 20px 0px 12px #fb7185;
                    }
                }
                
                /* Lightning bolts for high streaks */
                .streak-counter[data-streak="8"]::before,
                .streak-counter[data-streak="9"]::before,
                .streak-counter[data-streak="10"]::before {
                    animation: brutal-badge-float 0.5s ease-in-out infinite, brutal-flash 2s ease-in-out infinite;
                }
                
                @keyframes brutal-flash {
                    0%, 100% { background: #dc2626; }
                    50% { background: #fbbf24; box-shadow: 0 0 20px #fbbf24; }
                }
                
                
                
                @media (max-width: 480px) {
                    .streak-counter {
                        bottom: 20px;
                        right: 20px;
                        font-size: 24px;
                        padding: 20px 28px;
                        border-width: 6px;
                        box-shadow: 
                            8px 8px 0px #000,
                            8px 8px 0px 6px #10b981,
                            16px 16px 0px 6px #000,
                            16px 16px 0px 10px #fb7185;
                    }
                    
                    .streak-counter::before {
                        font-size: 12px;
                        padding: 4px 12px;
                        top: -25px;
                        border-width: 3px;
                    }
                    
                    .streak-counter::after {
                        font-size: 32px;
                        right: -15px;
                        top: -12px;
                    }
                    
                    .streak-counter[data-streak="10"]::after {
                        font-size: 36px;
                    }
                    
                    .streak-counter:hover {
                        box-shadow: 
                            10px 10px 0px #000,
                            10px 10px 0px 6px #10b981,
                            20px 20px 0px 6px #000,
                            20px 20px 0px 10px #fb7185;
                    }
                    
                    .streak-counter:active {
                        box-shadow: 
                            5px 5px 0px #000,
                            5px 5px 0px 6px #10b981,
                            10px 10px 0px 6px #000,
                            10px 10px 0px 10px #fb7185;
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