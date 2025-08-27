export class NumberLine extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._leftNumber = 0;
        this._rightNumber = 0;
        this._canvas = null;
        this._ctx = null;
    }

    static get observedAttributes() {
        return ['left-number', 'right-number'];
    }

    connectedCallback() {
        this.render();
        this.setupCanvas();
        this.draw();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'left-number':
                this._leftNumber = parseInt(newValue) || 0;
                break;
            case 'right-number':
                this._rightNumber = parseInt(newValue) || 0;
                break;
        }
        if (this._canvas && this._ctx) {
            this.draw();
        }
    }

    set leftNumber(val) {
        this.setAttribute('left-number', val.toString());
    }

    set rightNumber(val) {
        this.setAttribute('right-number', val.toString());
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-top: -10px;
                    position: relative;
                    z-index: 10;
                    width: 100vw;
                    margin-left: calc(-50vw + 50%);
                    margin-right: calc(-50vw + 50%);
                }

                .canvas-container {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transform: rotate(0.5deg);
                    transition: transform 0.2s ease;
                    padding: 40px 120px;
                    width: 100%;
                    box-sizing: border-box;
                }

                /* Skewed background frame - proper rhombus */
                .skewed-frame {
                    position: absolute;
                    top: -10px;
                    left: 80px;
                    right: 80px;
                    bottom: -10px;
                    border: 8px solid #000;
                    background: rgba(255, 255, 255, 0.3);
                    transform: skewX(-15deg);
                    z-index: -1;
                    box-shadow:
                        15px 10px 0px #10b981,
                        30px 20px 0px rgba(0,0,0,0.3);
                    border-radius: 0;
                    clip-path: polygon(
                        5% 0%,
                        100% 0%,
                        95% 100%,
                        0% 100%
                    );
                }

                .skewed-frame::before {
                    content: '';
                    position: absolute;
                    inset: -4px;
                    border: 4px solid #fbbf24;
                    transform: skewX(5deg);
                    z-index: -1;
                    opacity: 0.6;
                }

                .skewed-frame::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg,
                        rgba(251, 113, 133, 0.2) 0%,
                        rgba(251, 191, 36, 0.2) 25%,
                        rgba(16, 185, 129, 0.2) 50%,
                        rgba(129, 140, 248, 0.2) 75%,
                        rgba(251, 113, 133, 0.2) 100%);
                    animation: brutal-gradient-shift 8s linear infinite;
                    mix-blend-mode: screen;
                }

                @keyframes brutal-gradient-shift {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }

                .canvas-container::after {
                    content: '➜';
                    position: absolute;
                    top: 50%;
                    right: -20px;
                    transform: translateY(-50%);
                    font-size: 40px;
                    color: #10b981;
                    text-shadow:
                        2px 2px 0px #000,
                        4px 4px 0px #fbbf24;
                    animation: brutal-arrow-pulse 2s ease-in-out infinite;
                    z-index: 1;
                }

                @keyframes brutal-arrow-pulse {
                    0%, 100% {
                        transform: translateY(-50%) translateX(0) scale(1);
                    }
                    50% {
                        transform: translateY(-50%) translateX(10px) scale(1.2);
                    }
                }

                canvas {
                    border: 6px solid #000;
                    border-radius: 0;
                    background: linear-gradient(90deg,
                        #fef3c7 0%,
                        #fde68a 25%,
                        #fef3c7 50%,
                        #fde68a 75%,
                        #fef3c7 100%);
                    box-shadow: 10px 10px 0px #000;
                    width: auto;
                    max-width: calc(100vw - 240px);
                    height: auto;
                    display: block;
                    position: relative;
                    z-index: 1;
                }

                .canvas-container:hover {
                    transform: rotate(0.5deg) translateY(-3px);
                }

                .canvas-container:hover canvas {
                    box-shadow: 12px 12px 0px #000;
                }

                /* Motion lines to emphasize direction */
                .motion-lines {
                    position: absolute;
                    top: 50%;
                    left: -40px;
                    transform: translateY(-50%);
                    width: 30px;
                    height: 60px;
                    overflow: hidden;
                    pointer-events: none;
                }

                .motion-lines::before,
                .motion-lines::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 3px;
                    background: #fb7185;
                    border: 1px solid #000;
                    animation: brutal-motion 1.5s linear infinite;
                }

                .motion-lines::before {
                    top: 20%;
                }

                .motion-lines::after {
                    top: 70%;
                    animation-delay: 0.75s;
                }

                @keyframes brutal-motion {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(200%);
                    }
                }
            </style>
            <div class="canvas-container">
                <div class="skewed-frame"></div>
                <div class="motion-lines"></div>
                <canvas id="numberline-canvas" height="180"></canvas>
            </div>
        `;
    }

    setupCanvas() {
        this._canvas = this.shadowRoot.querySelector('canvas');
        this._ctx = this._canvas.getContext('2d');
        
        // Set canvas width to available space (accounting for button areas)
        const container = this.shadowRoot.querySelector('.canvas-container');
        if (container) {
            const containerWidth = container.getBoundingClientRect().width - 240; // Leave space for buttons
            this._canvas.width = Math.max(800, Math.min(1400, containerWidth));
        }
    }

    draw() {
        if (!this._ctx || !this._canvas) return;

        const ctx = this._ctx;
        const width = this._canvas.width;
        const height = this._canvas.height;

        // Clear canvas with transparent background
        ctx.clearRect(0, 0, width, height);

        // Draw main number line with brutal style
        const lineY = height / 2;
        const padding = 60;
        const lineWidth = width - (padding * 2);

        // Thick black main line
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 8;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(padding, lineY);
        ctx.lineTo(width - padding, lineY);
        ctx.stroke();

        // Draw bold tick marks
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i * lineWidth / 10);
            const tickHeight = i % 5 === 0 ? 25 : 12;

            ctx.lineWidth = i % 5 === 0 ? 5 : 3;
            ctx.beginPath();
            ctx.moveTo(x, lineY - tickHeight);
            ctx.lineTo(x, lineY + tickHeight);
            ctx.stroke();

            // Bold labels for major ticks
            if (i % 5 === 0) {
                // Background box for label
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(x - 25, lineY + 35, 50, 25);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.strokeRect(x - 25, lineY + 35, 50, 25);

                // Label text
                ctx.fillStyle = '#000';
                ctx.font = 'bold 18px "Roboto Mono", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText((i * 100).toString(), x, lineY + 47);
            }
        }

        // Add directional labels
        this.drawDirectionalLabels(ctx, padding, lineWidth, lineY, width);

        // Calculate positions for our numbers
        const leftPos = padding + (this._leftNumber / 1000) * lineWidth;
        const rightPos = padding + (this._rightNumber / 1000) * lineWidth;

        // Draw brutal-style markers for the numbers
        // Left number marker - Pink/Red
        ctx.fillStyle = '#fb7185';
        ctx.fillRect(leftPos - 15, lineY - 15, 30, 30);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(leftPos - 15, lineY - 15, 30, 30);

        // Add rotation effect
        ctx.save();
        ctx.translate(leftPos, lineY);
        ctx.rotate(-Math.PI / 12);
        ctx.fillStyle = '#000';
        ctx.fillRect(-5, -5, 10, 10);
        ctx.restore();

        // Right number marker - Green
        ctx.fillStyle = '#10b981';
        ctx.fillRect(rightPos - 15, lineY - 15, 30, 30);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(rightPos - 15, lineY - 15, 30, 30);

        // Add rotation effect
        ctx.save();
        ctx.translate(rightPos, lineY);
        ctx.rotate(Math.PI / 12);
        ctx.fillStyle = '#000';
        ctx.fillRect(-5, -5, 10, 10);
        ctx.restore();

        // Draw bold connecting line with zigzag pattern
        const winner = this._leftNumber > this._rightNumber;
        ctx.strokeStyle = winner ? '#fb7185' : '#10b981';
        ctx.lineWidth = 6;

        // Zigzag pattern
        ctx.beginPath();
        const steps = 10;
        const stepX = (rightPos - leftPos) / steps;
        for (let i = 0; i <= steps; i++) {
            const x = leftPos + (i * stepX);
            const y = lineY + (i % 2 === 0 ? -8 : 8);
            if (i === 0) {
                ctx.moveTo(x, lineY);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Label the numbers with brutal style
        // Left number label
        ctx.save();
        ctx.translate(leftPos, lineY - 35);
        ctx.rotate(-Math.PI / 24);

        // Background box
        ctx.fillStyle = '#fecdd3';
        ctx.fillRect(-30, -15, 60, 30);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-30, -15, 60, 30);

        // Text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px "Roboto", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this._leftNumber.toString(), 0, 0);
        ctx.restore();

        // Right number label
        ctx.save();
        ctx.translate(rightPos, lineY - 35);
        ctx.rotate(Math.PI / 24);

        // Background box
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(-30, -15, 60, 30);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-30, -15, 60, 30);

        // Text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px "Roboto", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this._rightNumber.toString(), 0, 0);
        ctx.restore();

        // Draw arrows from above
        this.drawArrows(ctx, leftPos, rightPos, lineY);
    }

    drawDirectionalLabels(ctx, padding, lineWidth, lineY, width) {
        // Neo-Brutalist directional arrows positioned at the very edges

        // LEFT SIDE - SMALLER Arrow
        ctx.save();

        // Position at the far left, vertically centered
        const leftArrowX = 20;
        const arrowY = lineY;

        // Draw chunky left arrow with multiple layers
        // Shadow layer
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(leftArrowX + 3, arrowY + 3);
        ctx.lineTo(leftArrowX + 23, arrowY - 17);
        ctx.lineTo(leftArrowX + 23, arrowY - 7);
        ctx.lineTo(leftArrowX + 43, arrowY - 7);
        ctx.lineTo(leftArrowX + 43, arrowY + 13);
        ctx.lineTo(leftArrowX + 23, arrowY + 13);
        ctx.lineTo(leftArrowX + 23, arrowY + 23);
        ctx.closePath();
        ctx.fill();

        // Main arrow body - pink
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.moveTo(leftArrowX, arrowY);
        ctx.lineTo(leftArrowX + 20, arrowY - 20);
        ctx.lineTo(leftArrowX + 20, arrowY - 10);
        ctx.lineTo(leftArrowX + 40, arrowY - 10);
        ctx.lineTo(leftArrowX + 40, arrowY + 10);
        ctx.lineTo(leftArrowX + 20, arrowY + 10);
        ctx.lineTo(leftArrowX + 20, arrowY + 20);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Inner decoration - zigzag pattern
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(leftArrowX + 25, arrowY - 5);
        ctx.lineTo(leftArrowX + 28, arrowY);
        ctx.lineTo(leftArrowX + 31, arrowY - 5);
        ctx.lineTo(leftArrowX + 34, arrowY);
        ctx.lineTo(leftArrowX + 37, arrowY - 5);
        ctx.stroke();

        // Vertical SMALLER label next to arrow
        ctx.save();
        ctx.translate(leftArrowX + 15, arrowY - 45);
        ctx.rotate(-Math.PI / 2);

        // Label background
        ctx.fillStyle = '#fecdd3';
        ctx.fillRect(-35, -12, 70, 24);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-35, -12, 70, 24);

        // Label text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px "Roboto", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SMALLER', 0, 0);
        ctx.restore();

        ctx.restore();

        // RIGHT SIDE - BIGGER Arrow
        ctx.save();

        // Position at the far right
        const rightArrowX = width - 60;

        // Draw chunky right arrow with multiple layers
        // Shadow layer
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(rightArrowX + 43, arrowY + 3);
        ctx.lineTo(rightArrowX + 23, arrowY - 17);
        ctx.lineTo(rightArrowX + 23, arrowY - 7);
        ctx.lineTo(rightArrowX + 3, arrowY - 7);
        ctx.lineTo(rightArrowX + 3, arrowY + 13);
        ctx.lineTo(rightArrowX + 23, arrowY + 13);
        ctx.lineTo(rightArrowX + 23, arrowY + 23);
        ctx.closePath();
        ctx.fill();

        // Main arrow body - green
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(rightArrowX + 40, arrowY);
        ctx.lineTo(rightArrowX + 20, arrowY - 20);
        ctx.lineTo(rightArrowX + 20, arrowY - 10);
        ctx.lineTo(rightArrowX, arrowY - 10);
        ctx.lineTo(rightArrowX, arrowY + 10);
        ctx.lineTo(rightArrowX + 20, arrowY + 10);
        ctx.lineTo(rightArrowX + 20, arrowY + 20);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Inner decoration - zigzag pattern
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rightArrowX + 3, arrowY - 5);
        ctx.lineTo(rightArrowX + 6, arrowY);
        ctx.lineTo(rightArrowX + 9, arrowY - 5);
        ctx.lineTo(rightArrowX + 12, arrowY);
        ctx.lineTo(rightArrowX + 15, arrowY - 5);
        ctx.stroke();

        // Vertical BIGGER label next to arrow
        ctx.save();
        ctx.translate(rightArrowX + 25, arrowY - 45);
        ctx.rotate(Math.PI / 2);

        // Label background
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(-30, -12, 60, 24);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-30, -12, 60, 24);

        // Label text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px "Roboto", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BIGGER', 0, 0);
        ctx.restore();

        // Add decorative dots around arrows for extra Neo-Brutalist flair
        // Left side dots
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(leftArrowX + 10, arrowY + 35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(leftArrowX + 25, arrowY + 35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right side dots
        ctx.beginPath();
        ctx.arc(rightArrowX + 15, arrowY + 35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rightArrowX + 30, arrowY + 35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawArrows(ctx, leftPos, rightPos, lineY) {
        // Add pointing hands that always point directly at the number positions
        const handY = 35; // Adjusted height to accommodate label backgrounds
        const minSpacing = 50; // Minimum spacing between hands to avoid overlap

        // Calculate if hands would overlap
        const distance = Math.abs(rightPos - leftPos);
        const handsWouldOverlap = distance < minSpacing;

        // Left pointing hand
        ctx.save();

        // Position directly above the left number
        let leftHandX = leftPos;
        if (handsWouldOverlap) {
            // Offset to the left to avoid overlap
            leftHandX = leftPos - 25;
        }

        ctx.translate(leftHandX, handY);

        // Draw label background above hand
        const leftLabelText = 'LEFT';
        ctx.font = 'bold 14px "Roboto", sans-serif';
        const leftTextWidth = ctx.measureText(leftLabelText).width;
        const boxPadding = 8;
        const boxWidth = leftTextWidth + (boxPadding * 2);
        const boxHeight = 22;
        const boxY = -45;

        // Background box for LEFT label
        ctx.fillStyle = '#fecdd3';
        ctx.fillRect(-boxWidth/2, boxY, boxWidth, boxHeight);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-boxWidth/2, boxY, boxWidth, boxHeight);

        // Add label text
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(leftLabelText, 0, boxY + boxHeight/2);

        // No rotation - point straight down
        ctx.font = 'bold 36px sans-serif';

        // Draw shadow first
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText('👇', 3, 3);

        // Draw hand
        ctx.fillStyle = '#fb7185';
        ctx.fillText('👇', 0, 0);

        ctx.restore();

        // Right pointing hand
        ctx.save();

        // Position directly above the right number
        let rightHandX = rightPos;
        if (handsWouldOverlap) {
            // Offset to the right to avoid overlap
            rightHandX = rightPos + 25;
        }

        ctx.translate(rightHandX, handY);

        // Draw label background above hand
        const rightLabelText = 'RIGHT';
        ctx.font = 'bold 14px "Roboto", sans-serif';
        const rightTextWidth = ctx.measureText(rightLabelText).width;
        const rightBoxWidth = rightTextWidth + (boxPadding * 2);

        // Background box for RIGHT label
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(-rightBoxWidth/2, boxY, rightBoxWidth, boxHeight);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-rightBoxWidth/2, boxY, rightBoxWidth, boxHeight);

        // Add label text
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rightLabelText, 0, boxY + boxHeight/2);

        // No rotation - point straight down
        ctx.font = 'bold 36px sans-serif';

        // Draw shadow first
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText('👇', 3, 3);

        // Draw hand
        ctx.fillStyle = '#10b981';
        ctx.fillText('👇', 0, 0);

        ctx.restore();

        // Draw connecting lines from hands to markers if they're offset
        if (handsWouldOverlap) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);

            // Left hand line
            ctx.beginPath();
            ctx.moveTo(leftHandX, handY + 15);
            ctx.lineTo(leftPos, lineY - 20);
            ctx.stroke();

            // Right hand line
            ctx.beginPath();
            ctx.moveTo(rightHandX, handY + 15);
            ctx.lineTo(rightPos, lineY - 20);
            ctx.stroke();

            ctx.setLineDash([]); // Reset dash
        }
    }
}

customElements.define('number-line', NumberLine);
