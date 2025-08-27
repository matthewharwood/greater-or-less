import { TranslationService } from '../services/TranslationService.js';

export class LanguageSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._isOpen = false;
        this._languages = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'ko', name: '한국어', flag: '🇰🇷' },
            { code: 'ja', name: '日本語', flag: '🇯🇵' }
        ];
        this._currentLanguage = TranslationService.getCurrentLanguage();
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    disconnectedCallback() {
        // Clean up event listeners if needed
    }

    attachEventListeners() {
        const toggle = this.shadowRoot.querySelector('.language-toggle');
        const options = this.shadowRoot.querySelectorAll('.language-option');
        
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown();
            });
            
            toggle.addEventListener('mouseenter', () => {
                import('../services/AudioService.js').then(module => {
                    module.AudioService.playHoverSound();
                });
            });
        }
        
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const langCode = option.dataset.lang;
                this.selectLanguage(langCode);
            });
            
            option.addEventListener('mouseenter', () => {
                import('../services/AudioService.js').then(module => {
                    module.AudioService.playHoverSound();
                });
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target) && this._isOpen) {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        this._isOpen = !this._isOpen;
        const dropdown = this.shadowRoot.querySelector('.language-dropdown');
        const toggle = this.shadowRoot.querySelector('.language-toggle');
        
        if (dropdown) {
            if (this._isOpen) {
                dropdown.classList.add('open');
                toggle.classList.add('active');
            } else {
                dropdown.classList.remove('open');
                toggle.classList.remove('active');
            }
        }
    }

    closeDropdown() {
        this._isOpen = false;
        const dropdown = this.shadowRoot.querySelector('.language-dropdown');
        const toggle = this.shadowRoot.querySelector('.language-toggle');
        
        if (dropdown) {
            dropdown.classList.remove('open');
            toggle.classList.remove('active');
        }
    }

    selectLanguage(langCode) {
        if (langCode !== this._currentLanguage) {
            this._currentLanguage = langCode;
            TranslationService.setLanguage(langCode);
            this.render();
            this.attachEventListeners();
            
            // Play sound effect
            import('../services/AudioService.js').then(module => {
                module.AudioService.playHoverSound();
            });
        }
        this.closeDropdown();
    }

    getCurrentLanguage() {
        return this._languages.find(lang => lang.code === this._currentLanguage) || this._languages[0];
    }

    render() {
        const currentLang = this.getCurrentLanguage();
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;
                    top: 130px;
                    left: 30px;
                    z-index: 20;
                }
                
                .language-container {
                    position: relative;
                    transform: rotate(-3deg);
                    animation: brutal-language-entrance 0.5s ease-out;
                }
                
                @keyframes brutal-language-entrance {
                    from {
                        opacity: 0;
                        transform: translateX(-50px) rotate(-3deg) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) rotate(-3deg) scale(1);
                    }
                }
                
                .language-toggle {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    background: #818cf8;
                    border: 5px solid #000;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: 900;
                    font-family: 'Roboto', sans-serif;
                    letter-spacing: 0.05em;
                    box-shadow: 6px 6px 0px #000;
                    transition: all 0.1s ease;
                    position: relative;
                    min-width: 160px;
                    color: #000;
                    text-transform: uppercase;
                }
                
                .language-toggle:hover {
                    transform: translateY(-2px);
                    box-shadow: 8px 8px 0px #000;
                    background: #a78bfa;
                }
                
                .language-toggle:active {
                    transform: translateY(1px);
                    box-shadow: 4px 4px 0px #000;
                }
                
                .language-toggle.active {
                    background: #c4b5fd;
                    transform: translateY(1px);
                    box-shadow: 4px 4px 0px #000;
                }
                
                .flag {
                    font-size: 24px;
                    filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3));
                }
                
                .arrow {
                    margin-left: auto;
                    font-size: 20px;
                    font-weight: 900;
                    transition: transform 0.2s ease;
                }
                
                .language-toggle.active .arrow {
                    transform: rotate(180deg);
                }
                
                .language-dropdown {
                    position: absolute;
                    top: calc(100% + 10px);
                    left: 0;
                    right: 0;
                    background: #fff;
                    border: 5px solid #000;
                    box-shadow: 8px 8px 0px #000;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px) scale(0.95);
                    transition: all 0.2s ease;
                    z-index: 100;
                    overflow: hidden;
                }
                
                .language-dropdown.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0) scale(1);
                    animation: brutal-dropdown-bounce 0.3s ease-out;
                }
                
                @keyframes brutal-dropdown-bounce {
                    0% {
                        transform: translateY(-10px) scale(0.95);
                    }
                    60% {
                        transform: translateY(5px) scale(1.02);
                    }
                    100% {
                        transform: translateY(0) scale(1);
                    }
                }
                
                .language-option {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px 20px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 700;
                    font-family: 'Roboto', sans-serif;
                    color: #000;
                    background: #fef3c7;
                    border-bottom: 4px solid #000;
                    transition: all 0.1s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .language-option:last-child {
                    border-bottom: none;
                }
                
                .language-option::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(251, 113, 133, 0.3) 50%, 
                        transparent 100%);
                    transition: left 0.3s ease;
                }
                
                .language-option:hover {
                    background: #fbbf24;
                    padding-left: 30px;
                    border-color: #000;
                }
                
                .language-option:hover::before {
                    left: 100%;
                }
                
                .language-option.selected {
                    background: #10b981;
                    font-weight: 900;
                    padding-left: 30px;
                }
                
                .language-option.selected::after {
                    content: '✓';
                    position: absolute;
                    left: 8px;
                    font-size: 20px;
                    font-weight: 900;
                    color: #000;
                    animation: brutal-check-pop 0.3s ease-out;
                }
                
                @keyframes brutal-check-pop {
                    0% {
                        transform: scale(0) rotate(-180deg);
                    }
                    60% {
                        transform: scale(1.2) rotate(10deg);
                    }
                    100% {
                        transform: scale(1) rotate(0deg);
                    }
                }
                
                .language-name {
                    flex: 1;
                    text-align: left;
                }
                
                /* Mobile responsive */
                @media (max-width: 480px) {
                    :host {
                        left: 20px;
                        top: 160px;
                    }
                    
                    .language-container {
                        transform: rotate(-2deg) scale(0.9);
                    }
                }
            </style>
            
            <div class="language-container">
                <div class="language-toggle">
                    <span class="flag">${currentLang.flag}</span>
                    <span class="language-name">${currentLang.name}</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="language-dropdown">
                    ${this._languages.map(lang => `
                        <div class="language-option ${lang.code === this._currentLanguage ? 'selected' : ''}" 
                             data-lang="${lang.code}">
                            <span class="flag">${lang.flag}</span>
                            <span class="language-name">${lang.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

customElements.define('language-selector', LanguageSelector);