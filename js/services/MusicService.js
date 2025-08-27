// Check if service already exists on window
if (typeof window.__MusicServiceClass === 'undefined') {
    // Only define the class once
    window.__MusicServiceClass = class MusicService {
        constructor() {
            console.log('MusicService constructor called');
            this._enabled = localStorage.getItem('backgroundMusicEnabled') === 'true' || false;
            this._audio = window.__globalAudio || null; // Reuse existing audio
            this._playlist = ['img/bg_music_1.mp3', 'img/bg_music_2.mp3'];
            
            // Restore or initialize play order
            this._playOrder = window.__musicPlayOrder || [];
            this._currentIndex = window.__musicCurrentIndex || 0;
            this._listeners = new Set();
            
            this.initializePlaylist();
            
            // Only auto-start on very first creation
            if (this._enabled && !window.__musicAlreadyStarted) {
                window.__musicAlreadyStarted = true;
                setTimeout(() => this.startMusic(), 100);
            } else if (this._enabled && this._audio) {
                // Reattach listeners to existing audio
                console.log('Reattaching to existing audio');
                if (!this._boundOnTrackEnded) {
                    this._boundOnTrackEnded = () => this.onTrackEnded();
                    this._audio.addEventListener('ended', this._boundOnTrackEnded);
                }
            }
        }
        
        initializePlaylist() {
            if (this._playOrder.length === 0) {
                const firstIndex = Math.floor(Math.random() * this._playlist.length);
                const secondIndex = firstIndex === 0 ? 1 : 0;
                this._playOrder = [firstIndex, secondIndex];
                this._currentIndex = 0;
                
                // Save to window
                window.__musicPlayOrder = this._playOrder;
                window.__musicCurrentIndex = this._currentIndex;
            }
        }
        
        get enabled() {
            return this._enabled;
        }
        
        set enabled(value) {
            console.log('MusicService.enabled setter called with:', value, 'current:', this._enabled);
            // Always update, don't check if equal since getter might be out of sync
            this._enabled = value;
            localStorage.setItem('backgroundMusicEnabled', value.toString());
            
            if (value) {
                this.startMusic();
            } else {
                this.stopMusic();
            }
            
            console.log('Notifying', this._listeners.size, 'listeners');
            this._listeners.forEach(callback => callback(this._enabled));
        }
        
        addListener(callback) {
            this._listeners.add(callback);
        }
        
        removeListener(callback) {
            this._listeners.delete(callback);
        }
        
        startMusic() {
            console.log('startMusic called');
            
            // Use global audio if it exists and is playing
            if (window.__globalAudio && !window.__globalAudio.paused && !window.__globalAudio.ended) {
                console.log('Global audio already playing, using it');
                this._audio = window.__globalAudio;
                
                // Re-attach ended listener if needed
                if (!this._boundOnTrackEnded) {
                    this._boundOnTrackEnded = () => this.onTrackEnded();
                    this._audio.addEventListener('ended', this._boundOnTrackEnded);
                }
                return;
            }
            
            // If we have audio but it's paused, resume it
            if (this._audio && this._audio.paused && !this._audio.ended) {
                console.log('Resuming paused audio');
                this._audio.play().catch(e => console.log('Could not resume:', e));
                return;
            }
            
            // Only create new audio if needed
            if (!this._audio || this._audio.ended) {
                this.playNextTrack();
            }
        }
        
        stopMusic() {
            if (this._audio) {
                this._audio.pause();
            }
            if (window.__globalAudio) {
                window.__globalAudio.pause();
            }
        }
        
        playNextTrack() {
            console.log('playNextTrack called');
            const trackIndex = this._playOrder[this._currentIndex];
            const trackPath = this._playlist[trackIndex];
            
            // Check if global audio is already playing this track
            if (window.__globalAudio && !window.__globalAudio.paused && !window.__globalAudio.ended) {
                const currentPath = window.__globalAudio.src.split('/').pop();
                const newPath = trackPath.split('/').pop();
                if (currentPath === newPath) {
                    console.log('Track already playing globally, reusing');
                    this._audio = window.__globalAudio;
                    
                    // Re-attach listener
                    if (!this._boundOnTrackEnded) {
                        this._boundOnTrackEnded = () => this.onTrackEnded();
                        this._audio.addEventListener('ended', this._boundOnTrackEnded);
                    }
                    return;
                }
            }
            
            // Clean up old audio
            if (this._audio && this._boundOnTrackEnded) {
                this._audio.removeEventListener('ended', this._boundOnTrackEnded);
            }
            
            // Create new audio
            this._audio = new Audio(trackPath);
            this._audio.volume = 0.2;
            window.__globalAudio = this._audio; // Store globally
            
            this._boundOnTrackEnded = () => this.onTrackEnded();
            this._audio.addEventListener('ended', this._boundOnTrackEnded);
            
            if (this._enabled) {
                this._audio.play().catch(e => console.log('Could not play:', e));
            }
        }
        
        onTrackEnded() {
            console.log('Track ended');
            this._currentIndex++;
            if (this._currentIndex >= this._playOrder.length) {
                this._currentIndex = 0;
            }
            
            // Save state to window
            window.__musicCurrentIndex = this._currentIndex;
            
            this.playNextTrack();
        }
        
        toggle() {
            this.enabled = !this._enabled;
        }
    };
}

// Use the class from window
const MusicService = window.__MusicServiceClass;

// Create singleton instance on window if it doesn't exist
if (!window.__musicServiceInstance) {
    console.log('Creating new MusicService instance');
    window.__musicServiceInstance = new MusicService();
}

// Always export the same instance
const musicService = window.__musicServiceInstance;

export { MusicService };
export default musicService;