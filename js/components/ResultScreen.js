export class ResultScreen extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._won = false;
        this._leftNumber = 0;
        this._rightNumber = 0;
        this._mode = 'greater';
        this._countdownValue = 3;
        this._countdownInterval = null;
        this._onCountdownComplete = null;
    }

    static get observedAttributes() {
        return ['won', 'left-number', 'right-number', 'mode'];
    }

    connectedCallback() {
        this.render();
        this.startCountdown();
    }

    disconnectedCallback() {
        if (this._countdownInterval) {
            clearInterval(this._countdownInterval);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'won':
                this._won = newValue === 'true';
                break;
            case 'left-number':
                this._leftNumber = parseInt(newValue) || 0;
                break;
            case 'right-number':
                this._rightNumber = parseInt(newValue) || 0;
                break;
            case 'mode':
                this._mode = newValue || 'greater';
                break;
        }
        if (this.shadowRoot) {
            this.render();
        }
    }

    set onCountdownComplete(callback) {
        this._onCountdownComplete = callback;
    }

    startCountdown() {
        const countdownDuration = this._won ? 3 : 15;
        this._countdownValue = countdownDuration;
        this.updateCountdown();
        
        this._countdownInterval = setInterval(() => {
            this._countdownValue--;
            this.updateCountdown();
            
            if (this._countdownValue <= 0) {
                clearInterval(this._countdownInterval);
                if (this._onCountdownComplete) {
                    this._onCountdownComplete();
                }
            }
        }, 1000);
    }

    updateCountdown() {
        const countdownEl = this.shadowRoot.querySelector('#countdown');
        if (countdownEl) {
            countdownEl.textContent = this._countdownValue;
            
            if (this._won && this._countdownValue % 1 === 0) {
                countdownEl.style.animation = 'countdown-pulse 0.5s ease-out';
                setTimeout(() => {
                    countdownEl.style.animation = 'countdown-bounce 1s infinite';
                }, 500);
            }
        }
    }

    getWinningMessage() {
        const messages = [
            "🎉 BINGO YOU WON! 🎉",
            "⭐ AMAZING! YOU'RE CORRECT! ⭐",
            "🏆 CHAMPION! WELL DONE! 🏆",
            "🎯 PERFECT SHOT! YOU GOT IT! 🎯",
            "🌟 BRILLIANT! FANTASTIC WORK! 🌟",
            "🚀 AWESOME! YOU'RE ON FIRE! 🚀",
            "💎 EXCELLENT! SUPER SMART! 💎",
            "🎊 HOORAY! MAGNIFICENT! 🎊",
            "🥳 INCREDIBLE! YOU NAILED IT! 🥳",
            "🏅 OUTSTANDING! GREAT JOB! 🏅",
            "⚡ SPECTACULAR! WELL PLAYED! ⚡",
            "🎈 FANTASTIC! YOU'RE A STAR! 🎈"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getEncouragementMessage() {
        const messages = [
            "🤔 Think more carefully next time!",
            "⏰ Take your time to compare the numbers!",
            "👀 Look at each number closely before choosing!",
            "📏 Remember: bigger numbers are greater than smaller ones!",
            "🐌 Don't rush - think it through!",
            "🧠 Use your brain power to solve this!",
            "👣 Compare the numbers step by step!",
            "🚦 Slow down and think about which is bigger!",
            "💪 Practice makes perfect - keep trying!",
            "🎯 Focus on the numbers before clicking!",
            "😮‍💨 Take a deep breath and think carefully!",
            "⭐ You can do better - concentrate harder!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getExplanation() {
        const num1 = this._leftNumber;
        const num2 = this._rightNumber;
        const operator = this._mode === 'greater' ? '>' : '<';
        
        if (this._mode === 'greater') {
            // Greater than mode explanations
            if (num1 > num2) {
                return `
                    <div class="number-explanation">
                        <strong>${num1}</strong> is <span class="highlight-red">BIGGER</span> than <strong>${num2}</strong>
                    </div>
                    <div class="statement-result">
                        So <strong>${num1} ${operator} ${num2}</strong> is <span class="highlight-green">TRUE</span> ✅
                    </div>
                `;
            } else if (num1 < num2) {
                return `
                    <div class="number-explanation">
                        <strong>${num1}</strong> is <span class="highlight-red">SMALLER</span> than <strong>${num2}</strong>
                    </div>
                    <div class="statement-result">
                        So <strong>${num1} ${operator} ${num2}</strong> is <span class="highlight-red">FALSE</span> ❌
                    </div>
                `;
            } else {
                return `
                    <div class="number-explanation">
                        <strong>${num1}</strong> and <strong>${num2}</strong> are <span class="highlight-yellow">THE SAME</span>
                    </div>
                    <div class="statement-result">
                        So <strong>${num1} ${operator} ${num2}</strong> is <span class="highlight-red">FALSE</span> ❌<br>
                        (They are <span class="highlight-yellow">EQUAL</span>)
                    </div>
                `;
            }
        } else {
            // Less than mode explanations
            if (num1 < num2) {
                return `
                    <div class="number-explanation">
                        <strong>${num1}</strong> is <span class="highlight-red">SMALLER</span> than <strong>${num2}</strong>
                    </div>
                    <div class="statement-result">
                        So <strong>${num1} ${operator} ${num2}</strong> is <span class="highlight-green">TRUE</span> ✅
                    </div>
                `;
            } else if (num1 > num2) {
                return `
                    <div class="number-explanation">
                        <strong>${num1}</strong> is <span class="highlight-red">BIGGER</span> than <strong>${num2}</strong>
                    </div>
                    <div class="statement-result">
                        So <strong>${num1} ${operator} ${num2}</strong> is <span class="highlight-red">FALSE</span> ❌
                    </div>
                `;
            } else {
                return `
                    <div class="number-explanation">
                        <strong>${num1}</strong> and <strong>${num2}</strong> are <span class="highlight-yellow">THE SAME</span>
                    </div>
                    <div class="statement-result">
                        So <strong>${num1} ${operator} ${num2}</strong> is <span class="highlight-red">FALSE</span> ❌<br>
                        (They are <span class="highlight-yellow">EQUAL</span>)
                    </div>
                `;
            }
        }
    }

    render() {
        if (this._won) {
            this.renderWin();
        } else {
            this.renderLose();
        }
    }

    renderWin() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getCommonStyles()}
                
                h2 {
                    color: #000;
                    font-size: 36px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-family: 'Roboto', sans-serif;
                    position: relative;
                    z-index: 20;
                    margin: 30px auto;
                    padding: 20px 40px;
                    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
                    border: 6px solid #000;
                    box-shadow: 10px 10px 0px #000;
                    transform: rotate(-3deg);
                    display: inline-block;
                }
                
                h2::after {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    right: -10px;
                    bottom: -10px;
                    background: #fbbf24;
                    z-index: -1;
                    transform: rotate(2deg);
                }
                
                #countdown {
                    position: relative;
                    z-index: 20;
                    font-size: 72px;
                    font-weight: 900;
                    color: #000;
                    font-family: 'Roboto Mono', monospace;
                    margin: 30px auto;
                    background: #fbbf24;
                    border: 6px solid #000;
                    border-radius: 0;
                    width: 120px;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 8px 8px 0px #000;
                    animation: brutal-countdown-bounce 1s infinite;
                    transform: rotate(-5deg);
                }
                
                @keyframes brutal-countdown-bounce {
                    0%, 100% {
                        transform: rotate(-5deg) translateY(0);
                        box-shadow: 8px 8px 0px #000;
                    }
                    25% {
                        transform: rotate(-8deg) translateY(-15px);
                        box-shadow: 12px 12px 0px #000;
                    }
                    50% {
                        transform: rotate(5deg) translateY(-10px);
                        box-shadow: 10px 10px 0px #000;
                    }
                    75% {
                        transform: rotate(3deg) translateY(-5px);
                        box-shadow: 9px 9px 0px #000;
                    }
                }
                
                @keyframes brutal-pulse {
                    0%, 100% {
                        transform: rotate(-5deg) scale(1);
                        box-shadow: 8px 8px 0px #000;
                    }
                    50% {
                        transform: rotate(-5deg) scale(1.2);
                        box-shadow: 12px 12px 0px #000;
                        background: #fde68a;
                    }
                }
            </style>
            <h2>${this.getWinningMessage()}</h2>
            <div id="countdown">3</div>
        `;
    }

    renderLose() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getCommonStyles()}
                
                h2 {
                    color: #000;
                    font-size: 36px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-family: 'Roboto', sans-serif;
                    margin: 30px auto;
                    padding: 20px 40px;
                    background: #fb7185;
                    border: 6px solid #000;
                    box-shadow: 10px 10px 0px #000;
                    transform: rotate(3deg);
                    display: inline-block;
                    position: relative;
                }
                
                h2::after {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    right: -10px;
                    bottom: -10px;
                    background: repeating-linear-gradient(
                        -45deg,
                        #fbbf24,
                        #fbbf24 10px,
                        transparent 10px,
                        transparent 20px
                    );
                    z-index: -1;
                    opacity: 0.5;
                }
                
                .explanation-well {
                    background: #fef3c7;
                    border: 6px solid #000;
                    border-radius: 0;
                    padding: 30px;
                    margin: 30px auto;
                    box-shadow: 8px 8px 0px #000;
                    position: relative;
                    overflow: visible;
                    transform: rotate(-1deg);
                    max-width: 500px;
                }
                
                .explanation-well::before {
                    content: '!';
                    position: absolute;
                    top: -20px;
                    right: -20px;
                    font-size: 80px;
                    font-weight: 900;
                    color: #000;
                    background: #fbbf24;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 5px solid #000;
                    box-shadow: 4px 4px 0px #000;
                    transform: rotate(15deg);
                }
                
                .explanation-icon {
                    display: none;
                }
                
                .number-explanation {
                    font-size: 28px;
                    margin: 20px 0;
                    color: #000;
                    font-weight: 700;
                    font-family: 'Roboto', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }
                
                .statement-result {
                    font-size: 20px;
                    color: #000;
                    font-weight: 600;
                    font-family: 'Roboto Mono', monospace;
                    background: #fff;
                    padding: 15px;
                    border: 4px solid #000;
                    margin-top: 20px;
                    box-shadow: 4px 4px 0px #000;
                }
                
                .highlight-red {
                    background: #fb7185;
                    color: #000;
                    padding: 2px 8px;
                    font-weight: 900;
                    border: 3px solid #000;
                    display: inline-block;
                    transform: rotate(-2deg);
                    box-shadow: 2px 2px 0px #000;
                }
                
                .highlight-green {
                    background: #10b981;
                    color: #000;
                    padding: 2px 8px;
                    font-weight: 900;
                    border: 3px solid #000;
                    display: inline-block;
                    transform: rotate(2deg);
                    box-shadow: 2px 2px 0px #000;
                }
                
                .highlight-yellow {
                    background: #fbbf24;
                    color: #000;
                    padding: 2px 8px;
                    font-weight: 900;
                    border: 3px solid #000;
                    display: inline-block;
                    transform: rotate(-1deg);
                    box-shadow: 2px 2px 0px #000;
                }
                
                .encouragement {
                    font-size: 20px;
                    color: #000;
                    margin: 30px auto;
                    font-weight: 700;
                    font-family: 'Roboto', sans-serif;
                    background: linear-gradient(90deg, #fde68a 0%, #fbbf24 50%, #fde68a 100%);
                    padding: 15px 25px;
                    border: 4px solid #000;
                    box-shadow: 6px 6px 0px #000;
                    transform: rotate(1deg);
                    display: inline-block;
                    max-width: 400px;
                }
                
                #countdown {
                    font-size: 48px;
                    color: #000;
                    font-weight: 900;
                    font-family: 'Roboto Mono', monospace;
                    margin: 30px auto;
                    background: #fb7185;
                    border: 5px solid #000;
                    width: 100px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 6px 6px 0px #000;
                    transform: rotate(5deg);
                }
            </style>
            <h2>❌ WRONG! ❌</h2>
            <div class="explanation-well">
                <div class="explanation-icon">📚</div>
                ${this.getExplanation()}
            </div>
            <p class="encouragement">${this.getEncouragementMessage()}</p>
            <div id="countdown">15</div>
        `;
    }

    getCommonStyles() {
        return `
            :host {
                display: block;
                text-align: center;
                padding: 30px;
                position: relative;
            }
            
            :host::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 20px,
                    rgba(0,0,0,0.02) 20px,
                    rgba(0,0,0,0.02) 40px
                );
                pointer-events: none;
                z-index: 1;
            }
            
            * {
                position: relative;
                z-index: 2;
            }
        `;
    }
}

customElements.define('result-screen', ResultScreen);