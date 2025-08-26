export class AudioService {
    static playSound(audioFile, volume = 0.75) {
        const audio = new Audio(audioFile);
        audio.volume = volume;
        return audio.play().catch(e => console.log('Could not play sound:', e));
    }

    static playWinSound() {
        return this.playSound('img/win_horns.mp3', 0.75);
    }

    static playFailSound() {
        return this.playSound('img/fail_horns.mp3', 0.75);
    }

    static speak(text, rate = 0.8, pitch = 1.1, volume = 0.8) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.volume = volume;
            speechSynthesis.speak(utterance);
        }
    }

    static speakProblem(leftNumber, rightNumber) {
        this.speak(`${leftNumber} is greater than ${rightNumber}. True or false?`);
    }

    static speakExplanation(leftNumber, rightNumber) {
        let explanation = "";
        if (leftNumber > rightNumber) {
            explanation = `${leftNumber} is greater than ${rightNumber}, so the statement is true.`;
        } else if (leftNumber < rightNumber) {
            explanation = `${leftNumber} is less than ${rightNumber}, so the statement is false.`;
        } else {
            explanation = `${leftNumber} equals ${rightNumber}, so the statement is false.`;
        }
        this.speak(explanation);
    }
}