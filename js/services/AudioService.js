export class AudioService {
    // Cache for hover sound to enable cloning
    static hoverAudioCache = null;
    static currentHoverAudio = null;

    static isTTSEnabled() {
        // Check if text-to-speech is enabled in localStorage
        return localStorage.getItem('textToSpeechEnabled') === 'true';
    }

    static playSound(audioFile, volume = 0.75) {
        const audio = new Audio(audioFile);
        audio.volume = volume;
        return audio.play().catch(e => console.log('Could not play sound:', e));
    }

    static playHoverSound() {
        // Stop any currently playing hover sound
        if (this.currentHoverAudio && !this.currentHoverAudio.paused) {
            this.currentHoverAudio.pause();
            this.currentHoverAudio.currentTime = 0;
        }

        // Create or clone the hover audio
        if (!this.hoverAudioCache) {
            this.hoverAudioCache = new Audio('img/click.mp3');
            this.hoverAudioCache.volume = 0.3;
        }

        // Clone the audio for overlapping plays
        this.currentHoverAudio = this.hoverAudioCache.cloneNode();
        this.currentHoverAudio.volume = 0.3;
        
        return this.currentHoverAudio.play().catch(e => {
            // Silently fail if can't play (e.g., no user interaction yet)
            console.log('Hover sound not played:', e.message);
        });
    }

    static playWinSound() {
        return this.playSound('img/win_horns.mp3', 0.75);
    }

    static playFailSound() {
        return this.playSound('img/fail_horns.mp3', 0.75);
    }

    static speak(text, rate = 0.8, pitch = 1.1, volume = 0.8) {
        // Only speak if TTS is enabled
        if (!this.isTTSEnabled()) {
            return;
        }
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.volume = volume;
            speechSynthesis.speak(utterance);
        }
    }

    static speakProblem(leftNumber, rightNumber, mode = 'greater') {
        // Only speak if TTS is enabled
        if (!this.isTTSEnabled()) {
            return;
        }
        
        const operator = mode === 'greater' ? 'is greater than' : 'is less than';
        this.speak(`${leftNumber} ${operator} ${rightNumber}. True or false?`);
    }

    static speakExplanation(leftNumber, rightNumber, mode = 'greater') {
        // Only speak if TTS is enabled
        if (!this.isTTSEnabled()) {
            return;
        }
        
        let explanation = "";
        if (mode === 'greater') {
            if (leftNumber > rightNumber) {
                explanation = `${leftNumber} is greater than ${rightNumber}, so the statement is true.`;
            } else if (leftNumber < rightNumber) {
                explanation = `${leftNumber} is less than ${rightNumber}, so the statement is false.`;
            } else {
                explanation = `${leftNumber} equals ${rightNumber}, so the statement is false.`;
            }
        } else { // less than mode
            if (leftNumber < rightNumber) {
                explanation = `${leftNumber} is less than ${rightNumber}, so the statement is true.`;
            } else if (leftNumber > rightNumber) {
                explanation = `${leftNumber} is greater than ${rightNumber}, so the statement is false.`;
            } else {
                explanation = `${leftNumber} equals ${rightNumber}, so the statement is false.`;
            }
        }
        this.speak(explanation);
    }
}