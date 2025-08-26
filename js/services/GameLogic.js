export class GameLogic {
    static generateRandomNumbers() {
        let currentRound = parseInt(localStorage.getItem('gameRound') || '1');
        
        // Every 5th round, make numbers equal
        if (currentRound % 5 === 0) {
            const equalNumber = Math.floor(Math.random() * 1001);
            return [equalNumber, equalNumber];
        }
        
        // For other rounds, generate different numbers
        let rng_range_1 = Math.floor(Math.random() * 1001);
        let rng_range_2 = Math.floor(Math.random() * 1001);
        
        // Ensure they're not accidentally equal
        while (rng_range_1 === rng_range_2) {
            rng_range_2 = Math.floor(Math.random() * 1001);
        }
        
        return [rng_range_1, rng_range_2];
    }

    static evaluateAnswer(leftNumber, rightNumber, answer, mode = 'greater') {
        if (mode === 'greater') {
            // Greater than mode: leftNumber > rightNumber
            if (answer === 'higher' && leftNumber > rightNumber) {
                return true;
            } else if (answer === 'lower' && leftNumber < rightNumber) {
                return true;
            } else if (answer === 'equal' && leftNumber === rightNumber) {
                return true;
            }
        } else if (mode === 'less') {
            // Less than mode: leftNumber < rightNumber
            if (answer === 'higher' && leftNumber < rightNumber) {
                return true;
            } else if (answer === 'lower' && leftNumber > rightNumber) {
                return true;
            } else if (answer === 'equal' && leftNumber === rightNumber) {
                return true;
            }
        }
        return false;
    }

    static getCurrentMode() {
        return localStorage.getItem('gameMode') || 'greater';
    }

    static incrementRound() {
        let currentRound = parseInt(localStorage.getItem('gameRound') || '1');
        localStorage.setItem('gameRound', (currentRound + 1).toString());
    }

    static getCurrentRound() {
        return parseInt(localStorage.getItem('gameRound') || '1');
    }

    static resetRounds() {
        localStorage.setItem('gameRound', '1');
    }
}