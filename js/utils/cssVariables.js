/**
 * CSS Variables utility for JavaScript components
 * Provides access to CSS custom properties from JS
 */

export class CSSVariables {
    static get(variableName) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(`--${variableName}`)
            .trim();
    }

    static set(variableName, value) {
        document.documentElement.style.setProperty(`--${variableName}`, value);
    }

    // Color helpers
    static colors = {
        primary: () => this.get('color-primary'),
        primaryDark: () => this.get('color-primary-dark'),
        success: () => this.get('color-success'),
        error: () => this.get('color-error'),
        warning: () => this.get('color-warning'),
        playerRed: () => this.get('color-player-red'),
        playerGreen: () => this.get('color-player-green'),
        bgPrimary: () => this.get('color-bg-primary'),
        bgSecondary: () => this.get('color-bg-secondary'),
        textPrimary: () => this.get('color-text-primary'),
        textInverse: () => this.get('color-text-inverse')
    };

    // Spacing helpers
    static space = {
        xs: () => this.get('space-xs'),
        sm: () => this.get('space-sm'),
        md: () => this.get('space-md'),
        lg: () => this.get('space-lg'),
        xl: () => this.get('space-xl'),
        '2xl': () => this.get('space-2xl')
    };

    // Animation helpers
    static animation = {
        fast: () => this.get('transition-fast'),
        base: () => this.get('transition-base'),
        slow: () => this.get('transition-slow'),
        durationFast: () => this.get('animation-duration-fast'),
        durationBase: () => this.get('animation-duration-base'),
        durationSlow: () => this.get('animation-duration-slow')
    };

    // Shadow helpers
    static shadow = {
        xs: () => this.get('shadow-xs'),
        sm: () => this.get('shadow-sm'),
        base: () => this.get('shadow-base'),
        md: () => this.get('shadow-md'),
        lg: () => this.get('shadow-lg'),
        xl: () => this.get('shadow-xl'),
        primary: () => this.get('shadow-primary'),
        success: () => this.get('shadow-success'),
        error: () => this.get('shadow-error')
    };

    // Border helpers
    static border = {
        radiusSm: () => this.get('border-radius-sm'),
        radiusBase: () => this.get('border-radius-base'),
        radiusMd: () => this.get('border-radius-md'),
        radiusLg: () => this.get('border-radius-lg'),
        radiusXl: () => this.get('border-radius-xl'),
        radiusPill: () => this.get('border-radius-pill'),
        widthThin: () => this.get('border-width-thin'),
        widthBase: () => this.get('border-width-base'),
        widthThick: () => this.get('border-width-thick')
    };

    // Z-index helpers
    static zIndex = {
        dropdown: () => this.get('z-index-dropdown'),
        sticky: () => this.get('z-index-sticky'),
        overlay: () => this.get('z-index-overlay'),
        modal: () => this.get('z-index-modal'),
        tooltip: () => this.get('z-index-tooltip'),
        notification: () => this.get('z-index-notification')
    };

    // Game-specific variables
    static game = {
        cardWidth: () => this.get('game-card-width'),
        cardPadding: () => this.get('game-card-padding'),
        buttonHeight: () => this.get('game-button-height'),
        buttonMinWidth: () => this.get('game-button-min-width'),
        tooltipDuration: () => parseInt(this.get('game-tooltip-duration')),
        celebrationDuration: () => parseInt(this.get('game-celebration-duration')),
        countdownWin: () => parseInt(this.get('game-countdown-win')),
        countdownLose: () => parseInt(this.get('game-countdown-lose'))
    };
}

// Export as default
export default CSSVariables;