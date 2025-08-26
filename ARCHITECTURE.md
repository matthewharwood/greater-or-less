# Web Components Architecture

## Overview
The application has been refactored from a monolithic JavaScript file into modular Web Components using ES6 modules. Each component is self-contained with its own styling, logic, and lifecycle management.

## Directory Structure
```
js/
├── components/
│   ├── GameButton.js       - Reusable button component
│   ├── EquationDisplay.js  - Shows the equation and English text
│   ├── NumberLine.js       - Visual number line representation
│   ├── GameTooltip.js      - Tooltip messages
│   ├── PulseOverlay.js     - Screen pulse effects
│   ├── ConfettiCanvas.js   - Confetti animation
│   ├── ResultScreen.js     - Win/lose result display
│   └── GameContainer.js    - Main game orchestrator
├── services/
│   ├── GameLogic.js        - Game rules and logic
│   └── AudioService.js     - Sound and speech synthesis
└── app-refactored.js       - Application entry point
```

## Components

### GameButton
- **Purpose**: Reusable button with multiple variants
- **Props**: value, disabled, text-color, variant
- **Variants**: primary, number, action
- **Features**: Customizable styling, click handlers, responsive design

### EquationDisplay  
- **Purpose**: Shows the math equation with colored numbers
- **Props**: left-number, right-number
- **Features**: Color-coded numbers (red/green), English translation

### NumberLine
- **Purpose**: Visual representation of number positions
- **Props**: left-number, right-number
- **Features**: Canvas-based drawing, directional indicators, animated dots

### GameTooltip
- **Purpose**: Show helpful messages to user
- **Props**: message, duration
- **Features**: Auto-hide, animated entrance

### PulseOverlay
- **Purpose**: Full-screen color pulse effects
- **Props**: color, duration
- **Features**: Red/green pulses, auto-removal

### ConfettiCanvas
- **Purpose**: Celebratory confetti animation
- **Features**: Physics-based animation, auto-cleanup

### ResultScreen
- **Purpose**: Display win/lose results
- **Props**: won, left-number, right-number
- **Features**: Countdown timer, random messages, explanations

### GameContainer
- **Purpose**: Main game orchestrator
- **Features**: Game state management, component coordination, event handling

## Services

### GameLogic
- Number generation with equal numbers every 5th round
- Answer evaluation
- Round tracking via localStorage

### AudioService
- Sound effect playback
- Text-to-speech for problems and explanations
- Volume and pitch control

## Key Improvements

### Modularity
- Each component is independent and reusable
- Clear separation of concerns
- Easy to test and maintain

### Data Flow
- Props-based communication (no DOM selection)
- Event-driven architecture
- Centralized state in GameContainer

### Performance
- Components only re-render when needed
- Efficient canvas animations
- Automatic cleanup of resources

### Accessibility
- Shadow DOM for style encapsulation
- Semantic HTML elements
- ARIA-friendly structure

## Usage

To use the refactored version:

1. Open `index-refactored.html` in a modern browser
2. The game will automatically initialize
3. All components are loaded as ES6 modules

## Browser Support
- Chrome 63+
- Firefox 67+
- Safari 11.1+
- Edge 79+

All modern browsers with ES6 module and Web Components support.