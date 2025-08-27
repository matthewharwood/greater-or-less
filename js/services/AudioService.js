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

    static applyHallEffect() {
        // Add hall reverb effect without ducking volume
        if (window.__globalAudio && !window.__globalAudio.paused) {
            const holdTime = 1500; // Time to hold the effect
            const releaseTime = 500; // Time to release back to original
            
            // Create Web Audio API context if not exists
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Create or reuse nodes
            if (!this.musicSource) {
                this.musicSource = this.audioContext.createMediaElementSource(window.__globalAudio);
                this.gainNode = this.audioContext.createGain();
                this.convolver = this.audioContext.createConvolver();
                this.wetGain = this.audioContext.createGain();
                this.dryGain = this.audioContext.createGain();
                
                // Create impulse response for hall reverb
                const sampleRate = this.audioContext.sampleRate;
                const length = sampleRate * 2; // 2 second reverb tail
                const impulse = this.audioContext.createBuffer(2, length, sampleRate);
                
                for (let channel = 0; channel < 2; channel++) {
                    const channelData = impulse.getChannelData(channel);
                    for (let i = 0; i < length; i++) {
                        // Create exponentially decaying noise for reverb
                        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
                    }
                }
                
                this.convolver.buffer = impulse;
                
                // Set up routing: source -> gain -> split into wet/dry -> output
                this.musicSource.connect(this.gainNode);
                this.gainNode.connect(this.dryGain);
                this.gainNode.connect(this.convolver);
                this.convolver.connect(this.wetGain);
                this.dryGain.connect(this.audioContext.destination);
                this.wetGain.connect(this.audioContext.destination);
                
                // Initialize as dry signal
                this.dryGain.gain.value = 1;
                this.wetGain.gain.value = 0;
                this.gainNode.gain.value = 1; // Keep full volume
            }
            
            // Apply hall effect without volume change
            window.__globalAudio.volume = 0.2; // Keep original volume
            this.gainNode.gain.value = 1; // No volume reduction
            
            // Fade in reverb (wet signal) for hall effect
            this.dryGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            this.wetGain.gain.setValueAtTime(0.7, this.audioContext.currentTime);
            
            // Hold the effect
            setTimeout(() => {
                // Fade back to original (dry signal)
                const startTime = this.audioContext.currentTime;
                this.dryGain.gain.linearRampToValueAtTime(1, startTime + releaseTime / 1000);
                this.wetGain.gain.linearRampToValueAtTime(0, startTime + releaseTime / 1000);
            }, holdTime);
        }
    }

    static playWinSound() {
        this.applyHallEffect();
        return this.playSound('img/win_horns.mp3', 0.33); // Reduced from 0.5 to 0.33 (another 33% reduction)
    }

    static playFailSound() {
        this.applyHallEffect();
        return this.playSound('img/fail_horns.mp3', 0.33); // Reduced from 0.5 to 0.33 (another 33% reduction)
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