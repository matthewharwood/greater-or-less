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
                    margin-top: 20px;
                }
                
                canvas {
                    border: 2px solid #007bff;
                    border-radius: 8px;
                    background: white;
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                }
            </style>
            <canvas width="800" height="120"></canvas>
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
        
        // Draw tick marks
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i * lineWidth / 10);
            const tickHeight = i % 5 === 0 ? 15 : 8;
            
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
        
        // Add directional labels
        this.drawDirectionalLabels(ctx, padding, lineWidth, lineY, width);
        
        // Calculate positions for our numbers
        const leftPos = padding + (this._leftNumber / 1000) * lineWidth;
        const rightPos = padding + (this._rightNumber / 1000) * lineWidth;
        
        // Draw dots for the numbers
        ctx.fillStyle = '#e74c3c'; // Red for left
        ctx.beginPath();
        ctx.arc(leftPos, lineY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#27ae60'; // Green for right
        ctx.beginPath();
        ctx.arc(rightPos, lineY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw connecting line
        ctx.strokeStyle = this._leftNumber > this._rightNumber ? '#e74c3c' : '#27ae60';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(leftPos, lineY);
        ctx.lineTo(rightPos, lineY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Label the numbers
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this._leftNumber.toString(), leftPos, lineY - 20);
        
        ctx.fillStyle = '#27ae60';
        ctx.fillText(this._rightNumber.toString(), rightPos, lineY - 20);
        
        // Draw arrows from above
        this.drawArrows(ctx, leftPos, rightPos, lineY);
    }

    drawDirectionalLabels(ctx, padding, lineWidth, lineY, width) {
        ctx.fillStyle = '#666666';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        
        // SMALLER on left
        ctx.fillText('SMALLER', padding + (lineWidth * 0.15), lineY + 50);
        
        // Left arrow
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding + 20, lineY + 55);
        ctx.lineTo(padding + 5, lineY + 55);
        ctx.stroke();
        
        // Left arrow head
        ctx.beginPath();
        ctx.moveTo(padding + 5, lineY + 55);
        ctx.lineTo(padding + 12, lineY + 50);
        ctx.lineTo(padding + 12, lineY + 60);
        ctx.closePath();
        ctx.fill();
        
        // BIGGER on right
        ctx.fillText('BIGGER', width - padding - (lineWidth * 0.15), lineY + 50);
        
        // Right arrow
        ctx.beginPath();
        ctx.moveTo(width - padding - 20, lineY + 55);
        ctx.lineTo(width - padding - 5, lineY + 55);
        ctx.stroke();
        
        // Right arrow head
        ctx.beginPath();
        ctx.moveTo(width - padding - 5, lineY + 55);
        ctx.lineTo(width - padding - 12, lineY + 50);
        ctx.lineTo(width - padding - 12, lineY + 60);
        ctx.closePath();
        ctx.fill();
    }

    drawArrows(ctx, leftPos, rightPos, lineY) {
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        
        // Left arrow curve
        ctx.beginPath();
        ctx.moveTo(leftPos - 50, 10);
        ctx.quadraticCurveTo(leftPos - 25, lineY - 40, leftPos, lineY - 15);
        ctx.stroke();
        
        // Right arrow curve
        ctx.beginPath();
        ctx.moveTo(rightPos + 50, 10);
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
}

customElements.define('number-line', NumberLine);