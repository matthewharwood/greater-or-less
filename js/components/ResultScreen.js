import { TranslationService } from '../services/TranslationService.js';

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
        
        // Listen for language changes
        this._languageListener = () => {
            this.render();
        };
    }

    static get observedAttributes() {
        return ['won', 'left-number', 'right-number', 'mode'];
    }

    connectedCallback() {
        this.render();
        this.startCountdown();
        TranslationService.addListener(this._languageListener);
    }

    disconnectedCallback() {
        if (this._countdownInterval) {
            clearInterval(this._countdownInterval);
        }
        TranslationService.removeListener(this._languageListener);
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
        return TranslationService.getWinMessage();
    }

    getEncouragementMessage() {
        return TranslationService.getEncouragementMessage();
    }

    getExplanation() {
        const num1 = this._leftNumber;
        const num2 = this._rightNumber;
        const operator = this._mode === 'greater' ? '>' : '<';
        const lang = TranslationService.getCurrentLanguage();
        
        if (this._mode === 'greater') {
            // Greater than mode explanations
            if (num1 > num2) {
                const biggerText = lang === 'ko' ? 
                    `<strong>${num1}</strong>${TranslationService.get('isBigger')} <strong>${num2}</strong>${TranslationService.get('biggerThan', lang)}` :
                    lang === 'ja' ?
                    `<strong>${num1}</strong>${TranslationService.get('isBigger')}<strong>${num2}</strong>${TranslationService.get('biggerThan', lang)}` :
                    `<strong>${num1}</strong> ${TranslationService.get('isBigger')} <strong>${num2}</strong>`;
                
                return `
                    <div class="number-explanation">
                        ${biggerText}
                    </div>
                    <div class="statement-result">
                        ${TranslationService.get('soStatement')} <strong>${num1} ${operator} ${num2}</strong> ${TranslationService.get('isTrue')} ✅
                    </div>
                `;
            } else if (num1 < num2) {
                const smallerText = lang === 'ko' ? 
                    `<strong>${num1}</strong>${TranslationService.get('isSmaller')} <strong>${num2}</strong>${TranslationService.get('smallerThan', lang)}` :
                    lang === 'ja' ?
                    `<strong>${num1}</strong>${TranslationService.get('isSmaller')}<strong>${num2}</strong>${TranslationService.get('smallerThan', lang)}` :
                    `<strong>${num1}</strong> ${TranslationService.get('isSmaller')} <strong>${num2}</strong>`;
                
                return `
                    <div class="number-explanation">
                        ${smallerText}
                    </div>
                    <div class="statement-result">
                        ${TranslationService.get('soStatement')} <strong>${num1} ${operator} ${num2}</strong> ${TranslationService.get('isFalse')} ❌
                    </div>
                `;
            } else {
                const equalText = lang === 'ko' || lang === 'ja' ? 
                    `<strong>${num1}</strong>${TranslationService.get('areSame')}<strong>${num2}</strong>${TranslationService.get('areEqual')}` :
                    `<strong>${num1}</strong> ${TranslationService.get('areSame')} <strong>${num2}</strong> ${TranslationService.get('areEqual')}`;
                
                return `
                    <div class="number-explanation">
                        ${equalText}
                    </div>
                    <div class="statement-result">
                        ${TranslationService.get('soStatement')} <strong>${num1} ${operator} ${num2}</strong> ${TranslationService.get('isFalse')} ❌<br>
                        ${TranslationService.get('theyAreEqual')}
                    </div>
                `;
            }
        } else {
            // Less than mode explanations
            if (num1 < num2) {
                const smallerText = lang === 'ko' ? 
                    `<strong>${num1}</strong>${TranslationService.get('isSmaller')} <strong>${num2}</strong>${TranslationService.get('smallerThan', lang)}` :
                    lang === 'ja' ?
                    `<strong>${num1}</strong>${TranslationService.get('isSmaller')}<strong>${num2}</strong>${TranslationService.get('smallerThan', lang)}` :
                    `<strong>${num1}</strong> ${TranslationService.get('isSmaller')} <strong>${num2}</strong>`;
                
                return `
                    <div class="number-explanation">
                        ${smallerText}
                    </div>
                    <div class="statement-result">
                        ${TranslationService.get('soStatement')} <strong>${num1} ${operator} ${num2}</strong> ${TranslationService.get('isTrue')} ✅
                    </div>
                `;
            } else if (num1 > num2) {
                const biggerText = lang === 'ko' ? 
                    `<strong>${num1}</strong>${TranslationService.get('isBigger')} <strong>${num2}</strong>${TranslationService.get('biggerThan', lang)}` :
                    lang === 'ja' ?
                    `<strong>${num1}</strong>${TranslationService.get('isBigger')}<strong>${num2}</strong>${TranslationService.get('biggerThan', lang)}` :
                    `<strong>${num1}</strong> ${TranslationService.get('isBigger')} <strong>${num2}</strong>`;
                
                return `
                    <div class="number-explanation">
                        ${biggerText}
                    </div>
                    <div class="statement-result">
                        ${TranslationService.get('soStatement')} <strong>${num1} ${operator} ${num2}</strong> ${TranslationService.get('isFalse')} ❌
                    </div>
                `;
            } else {
                const equalText = lang === 'ko' || lang === 'ja' ? 
                    `<strong>${num1}</strong>${TranslationService.get('areSame')}<strong>${num2}</strong>${TranslationService.get('areEqual')}` :
                    `<strong>${num1}</strong> ${TranslationService.get('areSame')} <strong>${num2}</strong> ${TranslationService.get('areEqual')}`;
                
                return `
                    <div class="number-explanation">
                        ${equalText}
                    </div>
                    <div class="statement-result">
                        ${TranslationService.get('soStatement')} <strong>${num1} ${operator} ${num2}</strong> ${TranslationService.get('isFalse')} ❌<br>
                        ${TranslationService.get('theyAreEqual')}
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
                    font-size: clamp(24px, 5vw, 36px);
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-family: 'Roboto', sans-serif;
                    position: relative;
                    z-index: 20;
                    margin: 20px auto;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
                    border: 6px solid #000;
                    box-shadow: 10px 10px 0px #000;
                    transform: rotate(-3deg);
                    display: inline-block;
                    max-width: 90%;
                    word-wrap: break-word;
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
                    font-size: clamp(48px, 8vw, 72px);
                    font-weight: 900;
                    color: #000;
                    font-family: 'Roboto Mono', monospace;
                    margin: 20px auto;
                    background: #fbbf24;
                    border: 6px solid #000;
                    border-radius: 0;
                    width: clamp(80px, 15vw, 120px);
                    height: clamp(80px, 15vw, 120px);
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
                
                @media (max-height: 600px) {
                    h2 {
                        margin: 10px auto;
                        padding: 10px 20px;
                        font-size: 20px;
                    }
                    
                    #countdown {
                        width: 70px;
                        height: 70px;
                        font-size: 36px;
                        margin: 15px auto;
                    }
                }
            </style>
            <div class="result-content">
                <h2>${this.getWinningMessage()}</h2>
                <div id="countdown">3</div>
            </div>
        `;
    }

    renderLose() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getCommonStyles()}
                
                h2 {
                    color: #000;
                    font-size: clamp(24px, 5vw, 36px);
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-family: 'Roboto', sans-serif;
                    margin: 20px auto;
                    padding: 15px 30px;
                    background: #fb7185;
                    border: 6px solid #000;
                    box-shadow: 10px 10px 0px #000;
                    transform: rotate(3deg);
                    display: inline-block;
                    position: relative;
                    max-width: 90%;
                    word-wrap: break-word;
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
                    padding: 15px;
                    margin: 15px auto;
                    box-shadow: 8px 8px 0px #000;
                    position: relative;
                    overflow: visible;
                    transform: rotate(-1deg);
                    max-width: min(600px, 85%);
                    box-sizing: border-box;
                }
                
                .explanation-well::before {
                    content: '!';
                    position: absolute;
                    top: -15px;
                    right: -15px;
                    font-size: clamp(40px, 8vw, 60px);
                    font-weight: 900;
                    color: #000;
                    background: #fbbf24;
                    width: clamp(40px, 8vw, 50px);
                    height: clamp(40px, 8vw, 50px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 4px solid #000;
                    box-shadow: 3px 3px 0px #000;
                    transform: rotate(15deg);
                }
                
                .explanation-icon {
                    display: none;
                }
                
                .number-explanation {
                    font-size: clamp(16px, 3.5vw, 24px);
                    margin: 10px 0;
                    color: #000;
                    font-weight: 700;
                    font-family: 'Roboto', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                    word-wrap: break-word;
                    line-height: 1.3;
                }
                
                .statement-result {
                    font-size: clamp(14px, 3vw, 20px);
                    color: #000;
                    font-weight: 600;
                    font-family: 'Roboto Mono', monospace;
                    background: #fff;
                    padding: 10px;
                    border: 4px solid #000;
                    margin-top: 15px;
                    box-shadow: 4px 4px 0px #000;
                    word-wrap: break-word;
                }
                
                .highlight-red {
                    background: #fb7185;
                    color: #000;
                    padding: 1px 6px;
                    font-weight: 900;
                    border: 2px solid #000;
                    display: inline-block;
                    transform: rotate(-2deg);
                    box-shadow: 2px 2px 0px #000;
                    margin: 0 2px;
                }
                
                .highlight-green {
                    background: #10b981;
                    color: #000;
                    padding: 1px 6px;
                    font-weight: 900;
                    border: 2px solid #000;
                    display: inline-block;
                    transform: rotate(2deg);
                    box-shadow: 2px 2px 0px #000;
                    margin: 0 2px;
                }
                
                .highlight-yellow {
                    background: #fbbf24;
                    color: #000;
                    padding: 1px 6px;
                    font-weight: 900;
                    border: 2px solid #000;
                    display: inline-block;
                    transform: rotate(-1deg);
                    box-shadow: 2px 2px 0px #000;
                    margin: 0 2px;
                }
                
                .encouragement {
                    font-size: clamp(16px, 3vw, 20px);
                    color: #000;
                    margin: 20px auto;
                    font-weight: 700;
                    font-family: 'Roboto', sans-serif;
                    background: linear-gradient(90deg, #fde68a 0%, #fbbf24 50%, #fde68a 100%);
                    padding: 12px 20px;
                    border: 4px solid #000;
                    box-shadow: 6px 6px 0px #000;
                    transform: rotate(1deg);
                    display: inline-block;
                    max-width: min(400px, 85%);
                    word-wrap: break-word;
                    box-sizing: border-box;
                }
                
                #countdown {
                    font-size: clamp(36px, 6vw, 48px);
                    color: #000;
                    font-weight: 900;
                    font-family: 'Roboto Mono', monospace;
                    margin: 15px auto;
                    background: #fb7185;
                    border: 5px solid #000;
                    width: clamp(70px, 12vw, 100px);
                    height: clamp(70px, 12vw, 100px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 6px 6px 0px #000;
                    transform: rotate(5deg);
                }
                
                @media (max-height: 700px) {
                    h2 {
                        margin: 10px auto;
                        padding: 10px 20px;
                        font-size: 20px;
                    }
                    
                    .explanation-well {
                        margin: 10px auto;
                        padding: 12px;
                    }
                    
                    .explanation-well::before {
                        font-size: 30px;
                        width: 35px;
                        height: 35px;
                        top: -10px;
                        right: -10px;
                    }
                    
                    .number-explanation {
                        font-size: 16px;
                        margin: 8px 0;
                    }
                    
                    .statement-result {
                        font-size: 14px;
                        padding: 8px;
                        margin-top: 10px;
                    }
                    
                    .encouragement {
                        font-size: 14px;
                        margin: 10px auto;
                        padding: 8px 15px;
                    }
                    
                    #countdown {
                        width: 60px;
                        height: 60px;
                        font-size: 30px;
                        margin: 10px auto;
                    }
                    
                    .highlight-red,
                    .highlight-green,
                    .highlight-yellow {
                        padding: 0px 4px;
                        border-width: 2px;
                        font-size: inherit;
                    }
                }
            </style>
            <div class="result-content">
                <h2>${TranslationService.get('wrong')}</h2>
                <div class="explanation-well">
                    <div class="explanation-icon">📚</div>
                    ${this.getExplanation()}
                </div>
                <p class="encouragement">${this.getEncouragementMessage()}</p>
                <div id="countdown">15</div>
            </div>
        `;
    }

    getCommonStyles() {
        return `
            :host {
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                text-align: center;
                background: rgba(255, 255, 255, 0.98);
                z-index: 100;
                overflow: hidden;
                animation: brutal-slide-in 0.3s ease-out;
            }
            
            @keyframes brutal-slide-in {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
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
            
            .result-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 40px 20px 20px;
                box-sizing: border-box;
            }
        `;
    }
}

customElements.define('result-screen', ResultScreen);