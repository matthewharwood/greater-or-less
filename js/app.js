function generateRandomNumbers() {
    // Get current round number from localStorage, default to 1
    let currentRound = parseInt(localStorage.getItem('gameRound') || '1');
    
    // Every 5th round (5, 10, 15, 20, etc.), make numbers equal
    if (currentRound % 5 === 0) {
        const equalNumber = Math.floor(Math.random() * 1001);
        return [equalNumber, equalNumber];
    }
    
    // For other rounds, generate different numbers
    let rng_range_1 = Math.floor(Math.random() * 1001);
    let rng_range_2 = Math.floor(Math.random() * 1001);
    
    // Ensure they're not accidentally equal
    while (rng_range_1 === rng_range_2) {
        rng_range_2 = Math.floor(Math.random() * 1001);
    }
    
    return [rng_range_1, rng_range_2];
}

const globalRandomNumbers = generateRandomNumbers();

class RandomButton extends HTMLElement {
    constructor(value, clickHandler, disabled = false, textColor = null) {
        super();
        this.attachShadow({ mode: 'open' });
        this.value = value;
        this.clickHandler = clickHandler;
        this.disabled = disabled;
        this.textColor = textColor;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                button {
                    padding: 20px 30px;
                    background-color: #007bff;
                    color: white;
                    border: 3px solid #0056b3;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: 600;
                    min-height: 60px;
                    min-width: 100px;
                    touch-action: manipulation;
                    transition: all 0.8s ease-in-out;
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                }
                button:hover {
                    background-color: #0056b3;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
                }
                button:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
                }
                button:disabled {
                    background-color: #e9ecef;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    transition: all 0.8s ease-in-out;
                    border: 3px solid #dee2e6;
                }
                button:disabled:hover {
                    background-color: #e9ecef;
                    transform: none;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                @media (max-width: 479px) {
                    button {
                        width: 100%;
                        padding: 18px 20px;
                        font-size: 16px;
                    }
                }
            </style>
            <button ${this.disabled ? 'disabled' : ''} ${this.textColor ? `style="color: ${this.textColor} !important;"` : ''}>${this.value}</button>
        `;
        
        if (!this.disabled) {
            this.shadowRoot.querySelector('button').addEventListener('click', this.clickHandler);
        }
    }
}

customElements.define('random-button', RandomButton);

let firstClick = true;

function evaluateGuess(guess) {
    const [num1, num2] = globalRandomNumbers;
    let isCorrect = false;
    
    if (guess === 'higher' && num1 > num2) {
        isCorrect = true;
    } else if (guess === 'lower' && num1 < num2) {
        isCorrect = true;
    } else if (guess === 'equal' && num1 === num2) {
        isCorrect = true;
    }
    
    if (firstClick && !isCorrect) {
        // Show tooltip and prevent evaluation only if wrong on first click
        showTooltip("Can you read it out loud before guessing?");
        firstClick = false;
        return;
    }
    
    showResult(isCorrect);
    firstClick = false; // Reset for next round
}

function showResult(won) {
    const container = document.querySelector('#game-container');
    const [num1, num2] = globalRandomNumbers;
    
    const encouragementMessages = [
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
    
    const winningMessages = [
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

    if (won) {
        const randomWinMessage = winningMessages[Math.floor(Math.random() * winningMessages.length)];
        
        // Play win sound
        const winAudio = new Audio('img/win_horns.mp3');
        winAudio.volume = 0.75;
        winAudio.play().catch(e => console.log('Could not play win sound:', e));
        
        container.innerHTML = `
            <canvas id="confetti-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;"></canvas>
            <h2 style="color: green; position: relative; z-index: 20;">${randomWinMessage}</h2>
            <div id="countdown" style="position: relative; z-index: 20; font-size: 48px; font-weight: bold; color: #27ae60; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); margin: 20px 0; background: linear-gradient(135deg, #a8e6cf, #7fcdcd); border: 4px solid #27ae60; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 20px auto; box-shadow: 0 8px 16px rgba(39, 174, 96, 0.4), inset 0 4px 8px rgba(255,255,255,0.3); animation: countdown-bounce 1s infinite;">3</div>
        `;
        
        createConfetti();
        createPulse('green');
        
        let countdown = 3;
        const countdownElement = document.querySelector('#countdown');
        
        const timer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownElement.textContent = countdown;
                // Add pulse animation on each tick
                countdownElement.style.animation = 'countdown-pulse 0.5s ease-out';
                setTimeout(() => {
                    countdownElement.style.animation = 'countdown-bounce 1s infinite';
                }, 500);
            } else {
                clearInterval(timer);
                location.reload();
            }
        }, 1000);
    } else {
        let explanation = "";
        if (num1 > num2) {
            explanation = `
                <div style="background: linear-gradient(135deg, #ffe6e6, #ffcccc); border: 3px solid #ff9999; border-radius: 20px; padding: 25px; margin: 20px 0; box-shadow: 0 8px 16px rgba(255, 102, 102, 0.2); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 40px; opacity: 0.3; transform: rotate(15deg);">📚</div>
                    <div style="font-size: 24px; margin: 15px 0; color: #1a5490; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">
                        <strong>${num1}</strong> is <span style="color: #c0392b; font-weight: bold; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">BIGGER</span> than <strong>${num2}</strong>
                    </div>
                    <div style="font-size: 18px; color: #2c3e50; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">
                        So <strong>${num1} > ${num2}</strong> is <span style="color: #1e8449; font-weight: bold; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">TRUE</span> ✅
                    </div>
                </div>
            `;
        } else if (num1 < num2) {
            explanation = `
                <div style="background: linear-gradient(135deg, #ffe6e6, #ffcccc); border: 3px solid #ff9999; border-radius: 20px; padding: 25px; margin: 20px 0; box-shadow: 0 8px 16px rgba(255, 102, 102, 0.2); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 40px; opacity: 0.3; transform: rotate(15deg);">📖</div>
                    <div style="font-size: 24px; margin: 15px 0; color: #1a5490; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">
                        <strong>${num1}</strong> is <span style="color: #c0392b; font-weight: bold; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">SMALLER</span> than <strong>${num2}</strong>
                    </div>
                    <div style="font-size: 18px; color: #2c3e50; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">
                        So <strong>${num1} > ${num2}</strong> is <span style="color: #c0392b; font-weight: bold; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">FALSE</span> ❌
                    </div>
                </div>
            `;
        } else {
            explanation = `
                <div style="background: linear-gradient(135deg, #ffe6e6, #ffcccc); border: 3px solid #ff9999; border-radius: 20px; padding: 25px; margin: 20px 0; box-shadow: 0 8px 16px rgba(255, 102, 102, 0.2); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 40px; opacity: 0.3; transform: rotate(15deg);">⚖️</div>
                    <div style="font-size: 24px; margin: 15px 0; color: #1a5490; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">
                        <strong>${num1}</strong> and <strong>${num2}</strong> are <span style="color: #b7950b; font-weight: bold; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">THE SAME</span>
                    </div>
                    <div style="font-size: 18px; color: #2c3e50; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">
                        So <strong>${num1} > ${num2}</strong> is <span style="color: #c0392b; font-weight: bold; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">FALSE</span> ❌<br>
                        (They are <span style="color: #b7950b; font-weight: bold; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">EQUAL</span>)
                    </div>
                </div>
            `;
        }
        
        const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        
        // Play fail sound
        const failAudio = new Audio('img/fail_horns.mp3');
        failAudio.volume = 0.75;
        failAudio.play().catch(e => console.log('Could not play fail sound:', e));
        
        createPulse('red');
        
        // Speak the explanation when they lose
        setTimeout(() => {
            let spokenExplanation = "";
            if (num1 > num2) {
                spokenExplanation = `${num1} is greater than ${num2}, so the statement is true.`;
            } else if (num1 < num2) {
                spokenExplanation = `${num1} is less than ${num2}, so the statement is false.`;
            } else {
                spokenExplanation = `${num1} equals ${num2}, so the statement is false.`;
            }
            speakText(spokenExplanation);
        }, 1000);
        
        container.innerHTML = `
            <h2 style="color: red;">❌ WRONG! ❌</h2>
            <div style="margin: 20px 0; line-height: 1.5;">
                ${explanation}
            </div>
            <p style="font-size: 18px; color: #666; margin: 20px 0;">
                ${randomMessage}
            </p>
            <div id="countdown" style="font-size: 24px; color: #ff6b6b;">15</div>
        `;
        
        let countdown = 15;
        const countdownElement = document.querySelector('#countdown');
        
        const timer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownElement.textContent = countdown;
            } else {
                clearInterval(timer);
                location.reload();
            }
        }, 1000);
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8; // Slightly slower for kids
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.volume = 0.8; // 80% volume
        speechSynthesis.speak(utterance);
    }
}

function initGame() {
    const container = document.querySelector('#game-container');
    
    const button1 = new RandomButton(globalRandomNumbers[0], null, true, '#e74c3c'); // Red for left
    const button2 = new RandomButton(globalRandomNumbers[1], null, true, '#27ae60'); // Green for right
    
    const trueButton = new RandomButton("True", () => evaluateGuess('higher'), true);
    const falseButton = new RandomButton("False", () => evaluateGuess('lower'), true);
    const equalButton = new RandomButton("Equal", () => evaluateGuess('equal'), true);
    
    const greaterThanSign = document.createElement('span');
    greaterThanSign.textContent = ' > ';
    greaterThanSign.style.fontSize = '32px';
    greaterThanSign.style.fontWeight = 'bold';
    greaterThanSign.style.color = '#007bff';
    greaterThanSign.style.margin = '0 15px';
    
    const numberRow = document.createElement('div');
    numberRow.className = 'number-row';
    numberRow.appendChild(button1);
    numberRow.appendChild(greaterThanSign);
    numberRow.appendChild(button2);
    
    const englishText = document.createElement('div');
    englishText.style.fontSize = '18px';
    englishText.style.color = '#007bff';
    englishText.style.margin = '15px 0';
    englishText.style.fontWeight = '500';
    englishText.textContent = `"${globalRandomNumbers[0]} is greater than ${globalRandomNumbers[1]}"`;
    
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    actionButtons.appendChild(trueButton);
    actionButtons.appendChild(falseButton);
    actionButtons.appendChild(equalButton);
    
    container.appendChild(numberRow);
    container.appendChild(englishText);
    container.appendChild(actionButtons);
    
    // Draw the number line
    drawNumberLine(globalRandomNumbers[0], globalRandomNumbers[1]);
    
    // Speak the problem at start
    setTimeout(() => {
        speakText(`${globalRandomNumbers[0]} is greater than ${globalRandomNumbers[1]}. True or false?`);
    }, 500);
    
    // Enable buttons after 2 seconds
    setTimeout(() => {
        trueButton.disabled = false;
        trueButton.clickHandler = () => evaluateGuess('higher');
        trueButton.render();
        
        falseButton.disabled = false;
        falseButton.clickHandler = () => evaluateGuess('lower');
        falseButton.render();
        
        equalButton.disabled = false;
        equalButton.clickHandler = () => evaluateGuess('equal');
        equalButton.render();
    }, 2000);
}

function createConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.game-card');
    
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    const confettiPieces = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 3,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiPieces.forEach((piece, index) => {
            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.rotation += piece.rotationSpeed;
            
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.rotation * Math.PI / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
            ctx.restore();
            
            // Remove pieces that have fallen off screen
            if (piece.y > canvas.height + 10) {
                confettiPieces.splice(index, 1);
            }
        });
        
        if (confettiPieces.length > 0) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function createPulse(color) {
    const pulseOverlay = document.createElement('div');
    pulseOverlay.className = `pulse-overlay pulse-${color}`;
    document.body.appendChild(pulseOverlay);
    
    // Remove the pulse overlay after animation completes
    setTimeout(() => {
        if (pulseOverlay.parentNode) {
            pulseOverlay.parentNode.removeChild(pulseOverlay);
        }
    }, 600);
}

function drawNumberLine(leftNum, rightNum) {
    const canvas = document.getElementById('number-line');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw main number line
    const lineY = height / 2;
    const padding = 40;
    const lineWidth = width - (padding * 2);
    
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padding, lineY);
    ctx.lineTo(width - padding, lineY);
    ctx.stroke();
    
    // Draw tick marks (every 100 units for visual clarity)
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
        const x = padding + (i * lineWidth / 10);
        const tickHeight = i % 5 === 0 ? 15 : 8; // Bigger ticks at 0, 500, 1000
        
        ctx.beginPath();
        ctx.moveTo(x, lineY - tickHeight);
        ctx.lineTo(x, lineY + tickHeight);
        ctx.stroke();
        
        // Label major ticks
        if (i % 5 === 0) {
            ctx.fillStyle = '#007bff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText((i * 100).toString(), x, lineY + 30);
        }
    }
    
    // Add "SMALLER" and "BIGGER" labels
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    // SMALLER on left side
    ctx.fillText('SMALLER', padding + (lineWidth * 0.15), lineY + 50);
    
    // Arrow pointing left
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding + 20, lineY + 55);
    ctx.lineTo(padding + 5, lineY + 55);
    ctx.stroke();
    // Arrow head pointing left
    ctx.beginPath();
    ctx.moveTo(padding + 5, lineY + 55);
    ctx.lineTo(padding + 12, lineY + 50);
    ctx.lineTo(padding + 12, lineY + 60);
    ctx.closePath();
    ctx.fill();
    
    // BIGGER on right side
    ctx.fillText('BIGGER', width - padding - (lineWidth * 0.15), lineY + 50);
    
    // Arrow pointing right
    ctx.beginPath();
    ctx.moveTo(width - padding - 20, lineY + 55);
    ctx.lineTo(width - padding - 5, lineY + 55);
    ctx.stroke();
    // Arrow head pointing right
    ctx.beginPath();
    ctx.moveTo(width - padding - 5, lineY + 55);
    ctx.lineTo(width - padding - 12, lineY + 50);
    ctx.lineTo(width - padding - 12, lineY + 60);
    ctx.closePath();
    ctx.fill();
    
    // Calculate positions for our numbers
    const leftPos = padding + (leftNum / 1000) * lineWidth;
    const rightPos = padding + (rightNum / 1000) * lineWidth;
    
    // Draw dots for the numbers
    ctx.fillStyle = '#e74c3c'; // Red for left number
    ctx.beginPath();
    ctx.arc(leftPos, lineY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#27ae60'; // Green for right number
    ctx.beginPath();
    ctx.arc(rightPos, lineY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw connecting line between dots
    ctx.strokeStyle = leftNum > rightNum ? '#e74c3c' : '#27ae60';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(leftPos, lineY);
    ctx.lineTo(rightPos, lineY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash
    
    // Label the numbers above their dots
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(leftNum.toString(), leftPos, lineY - 20);
    
    ctx.fillStyle = '#27ae60';
    ctx.fillText(rightNum.toString(), rightPos, lineY - 20);
    
    // Draw arrows pointing to dots from equation
    drawArrowFromCard(leftPos, rightPos, leftNum, rightNum);
}

function drawArrowFromCard(leftPos, rightPos, leftNum, rightNum) {
    const canvas = document.getElementById('number-line');
    const ctx = canvas.getContext('2d');
    const lineY = canvas.height / 2;
    
    // Draw curved arrows from card area to number line
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    
    // Left arrow (from left side of card to left dot)
    ctx.beginPath();
    ctx.moveTo(leftPos - 50, 10); // Start above canvas
    ctx.quadraticCurveTo(leftPos - 25, lineY - 40, leftPos, lineY - 15);
    ctx.stroke();
    
    // Right arrow (from right side of card to right dot)  
    ctx.beginPath();
    ctx.moveTo(rightPos + 50, 10); // Start above canvas
    ctx.quadraticCurveTo(rightPos + 25, lineY - 40, rightPos, lineY - 15);
    ctx.stroke();
    
    // Arrow heads
    ctx.fillStyle = '#007bff';
    // Left arrow head
    ctx.beginPath();
    ctx.moveTo(leftPos, lineY - 15);
    ctx.lineTo(leftPos - 5, lineY - 25);
    ctx.lineTo(leftPos + 5, lineY - 25);
    ctx.closePath();
    ctx.fill();
    
    // Right arrow head
    ctx.beginPath();
    ctx.moveTo(rightPos, lineY - 15);
    ctx.lineTo(rightPos - 5, lineY - 25);
    ctx.lineTo(rightPos + 5, lineY - 25);
    ctx.closePath();
    ctx.fill();
}

function showTooltip(message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);
    
    // Remove tooltip after 3 seconds
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    }, 3000);
}

function incrementRound() {
    let currentRound = parseInt(localStorage.getItem('gameRound') || '1');
    localStorage.setItem('gameRound', (currentRound + 1).toString());
}

document.addEventListener('DOMContentLoaded', () => {
    incrementRound();
    firstClick = true; // Reset for each new game
    initGame();
});