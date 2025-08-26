export class ResultScreen extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._won = false;
        this._leftNumber = 0;
        this._rightNumber = 0;
        this._countdownValue = 3;
        this._countdownInterval = null;
        this._onCountdownComplete = null;
    }

    static get observedAttributes() {
        return ['won', 'left-number', 'right-number'];
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
        
        if (num1 > num2) {
            return `
                <div class="number-explanation">
                    <strong>${num1}</strong> is <span class="highlight-red">BIGGER</span> than <strong>${num2}</strong>
                </div>
                <div class="statement-result">
                    So <strong>${num1} > ${num2}</strong> is <span class="highlight-green">TRUE</span> ✅
                </div>
            `;
        } else if (num1 < num2) {
            return `
                <div class="number-explanation">
                    <strong>${num1}</strong> is <span class="highlight-red">SMALLER</span> than <strong>${num2}</strong>
                </div>
                <div class="statement-result">
                    So <strong>${num1} > ${num2}</strong> is <span class="highlight-red">FALSE</span> ❌
                </div>
            `;
        } else {
            return `
                <div class="number-explanation">
                    <strong>${num1}</strong> and <strong>${num2}</strong> are <span class="highlight-yellow">THE SAME</span>
                </div>
                <div class="statement-result">
                    So <strong>${num1} > ${num2}</strong> is <span class="highlight-red">FALSE</span> ❌<br>
                    (They are <span class="highlight-yellow">EQUAL</span>)
                </div>
            `;
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
                    color: green;
                    position: relative;
                    z-index: 20;
                    margin: 20px 0;
                }
                
                #countdown {
                    position: relative;
                    z-index: 20;
                    font-size: 48px;
                    font-weight: bold;
                    color: #27ae60;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    margin: 20px auto;
                    background: linear-gradient(135deg, #a8e6cf, #7fcdcd);
                    border: 4px solid #27ae60;
                    border-radius: 50%;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 16px rgba(39, 174, 96, 0.4), inset 0 4px 8px rgba(255,255,255,0.3);
                    animation: countdown-bounce 1s infinite;
                }
                
                @keyframes countdown-bounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    40% {
                        transform: translateY(-10px) scale(1.1);
                    }
                    60% {
                        transform: translateY(-5px) scale(1.05);
                    }
                }
                
                @keyframes countdown-pulse {
                    0% {
                        transform: scale(1);
                        box-shadow: 0 8px 16px rgba(39, 174, 96, 0.4), inset 0 4px 8px rgba(255,255,255,0.3);
                    }
                    50% {
                        transform: scale(1.15);
                        box-shadow: 0 12px 24px rgba(39, 174, 96, 0.6), inset 0 6px 12px rgba(255,255,255,0.4);
                    }
                    100% {
                        transform: scale(1);
                        box-shadow: 0 8px 16px rgba(39, 174, 96, 0.4), inset 0 4px 8px rgba(255,255,255,0.3);
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
                    color: red;
                    margin: 20px 0;
                }
                
                .explanation-well {
                    background: linear-gradient(135deg, #ffe6e6, #ffcccc);
                    border: 3px solid #ff9999;
                    border-radius: 20px;
                    padding: 25px;
                    margin: 20px 0;
                    box-shadow: 0 8px 16px rgba(255, 102, 102, 0.2);
                    position: relative;
                    overflow: hidden;
                }
                
                .explanation-icon {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    font-size: 40px;
                    opacity: 0.3;
                    transform: rotate(15deg);
                }
                
                .number-explanation {
                    font-size: 24px;
                    margin: 15px 0;
                    color: #1a5490;
                    text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;
                }
                
                .statement-result {
                    font-size: 18px;
                    color: #2c3e50;
                    text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;
                }
                
                .highlight-red {
                    color: #c0392b;
                    font-weight: bold;
                    text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;
                }
                
                .highlight-green {
                    color: #1e8449;
                    font-weight: bold;
                    text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;
                }
                
                .highlight-yellow {
                    color: #b7950b;
                    font-weight: bold;
                    text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;
                }
                
                .encouragement {
                    font-size: 18px;
                    color: #666;
                    margin: 20px 0;
                }
                
                #countdown {
                    font-size: 24px;
                    color: #ff6b6b;
                    font-weight: bold;
                    margin: 20px 0;
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
                padding: 20px;
            }
        `;
    }
}

customElements.define('result-screen', ResultScreen);