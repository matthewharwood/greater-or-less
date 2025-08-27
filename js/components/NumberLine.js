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
                    margin-top: 30px;
                    position: relative;
                    z-index: 10;
                    transform: rotate(0.5deg);
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
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                    position: relative;
                }
                
                canvas:hover {
                    transform: translate(-2px, -2px);
                    box-shadow: 12px 12px 0px #000;
                }
            </style>
            <canvas width="800" height="180"></canvas>
        `;
    }

    setupCanvas() {
        this._canvas = this.shadowRoot.querySelector('canvas');
        this._ctx = this._canvas.getContext('2d');
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
        // SMALLER label with brutal style
        ctx.save();
        ctx.translate(padding + (lineWidth * 0.15), lineY + 60);
        ctx.rotate(-Math.PI / 36);
        
        // Background
        ctx.fillStyle = '#fb7185';
        ctx.fillRect(-50, -20, 100, 40);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(-50, -20, 100, 40);
        
        // Text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px "Roboto", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SMALLER', 0, 0);
        ctx.restore();
        
        // Left arrow with brutal style
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(padding + 30, lineY + 65);
        ctx.lineTo(padding, lineY + 65);
        ctx.stroke();
        
        // Arrow head as triangle
        ctx.beginPath();
        ctx.moveTo(padding, lineY + 65);
        ctx.lineTo(padding + 15, lineY + 55);
        ctx.lineTo(padding + 15, lineY + 75);
        ctx.closePath();
        ctx.fill();
        
        // BIGGER label with brutal style
        ctx.save();
        ctx.translate(width - padding - (lineWidth * 0.15), lineY + 60);
        ctx.rotate(Math.PI / 36);
        
        // Background
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-45, -20, 90, 40);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(-45, -20, 90, 40);
        
        // Text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px "Roboto", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BIGGER', 0, 0);
        ctx.restore();
        
        // Right arrow with brutal style
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(width - padding - 30, lineY + 65);
        ctx.lineTo(width - padding, lineY + 65);
        ctx.stroke();
        
        // Arrow head as triangle
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(width - padding, lineY + 65);
        ctx.lineTo(width - padding - 15, lineY + 55);
        ctx.lineTo(width - padding - 15, lineY + 75);
        ctx.closePath();
        ctx.fill();
    }

    drawArrows(ctx, leftPos, rightPos, lineY) {
        // Skip curved arrows for cleaner brutal aesthetic
        // Add bold pointing hands instead
        
        // Left pointing hand
        ctx.save();
        ctx.translate(leftPos - 60, 20);
        ctx.rotate(Math.PI / 6);
        
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👇', 0, 0);
        
        // Add shadow
        ctx.fillStyle = '#000';
        ctx.fillText('👇', 2, 2);
        ctx.restore();
        
        // Right pointing hand
        ctx.save();
        ctx.translate(rightPos + 60, 20);
        ctx.rotate(-Math.PI / 6);
        
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👇', 0, 0);
        
        // Add shadow
        ctx.fillStyle = '#000';
        ctx.fillText('👇', 2, 2);
        ctx.restore();
    }
}

customElements.define('number-line', NumberLine);