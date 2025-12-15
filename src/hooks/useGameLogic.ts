import { useState, useEffect, useCallback, useRef } from 'react';

export type GuessFeedback = 'correct' | 'present' | 'absent';

export interface Guess {
    values: string[];
    feedback: GuessFeedback[];
    timestamp: number;
}

export interface GameConfig {
    pinLength: number;
    hintsEnabled: boolean;
    timerDuration: number; // in seconds
    maxRounds: number;
    playerPins?: string[]; // CHANGED: Now accepts array of strings for all rounds
    mode: 'single' | 'multiplayer';
}

export interface RoundResult {
    winner: 'player' | 'opponent' | 'draw' | null;
    reason: 'guessed' | 'timeout' | 'surrender' | null;
    score: number;
}

// SP Bot config
const OPPONENT_GUESS_INTERVAL = 4000;

export const useGameLogic = (config: GameConfig) => {
    // Game State
    const [currentRound, setCurrentRound] = useState(1);
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    // Round State
    const [secretPin, setSecretPin] = useState<string[]>([]);
    const [guesses, setGuesses] = useState<Guess[]>([]);
    const [currentGuess, setCurrentGuess] = useState<string[]>(Array(config.pinLength).fill(''));
    const [timeLeft, setTimeLeft] = useState(config.timerDuration);
    const [isRoundActive, setIsRoundActive] = useState(false);
    const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

    // Opponent State
    const [opponentGuesses, setOpponentGuesses] = useState<Guess[]>([]);

    // Refs
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const opponentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Helpers ---

    const generatePin = useCallback((length: number) => {
        return Array.from({ length }, () => Math.floor(Math.random() * 10).toString());
    }, []);

    const calculateFeedback = useCallback((guess: string[], secret: string[]): GuessFeedback[] => {
        const feedback: GuessFeedback[] = Array(guess.length).fill('absent');
        // Note: This logic assumes digits are '0'-'9'.

        const usedSecretIndices = new Set<number>();
        const usedGuessIndices = new Set<number>();

        // 1. Check for correct positions (Green)
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === secret[i]) {
                feedback[i] = 'correct';
                usedSecretIndices.add(i);
                usedGuessIndices.add(i);
            }
        }

        // 2. Check for present numbers (Orange) - only if hints enabled
        if (config.hintsEnabled) {
            for (let i = 0; i < guess.length; i++) {
                if (!usedGuessIndices.has(i)) {
                    // Look for this digit in secret where it hasn't been matched yet
                    for (let j = 0; j < secret.length; j++) {
                        if (!usedSecretIndices.has(j) && secret[j] === guess[i]) {
                            feedback[i] = 'present';
                            usedSecretIndices.add(j);
                            break;
                        }
                    }
                }
            }
        }

        return feedback;
    }, [config.hintsEnabled]);


    // --- Actions ---

    const startRound = useCallback(() => {
        const newPin = generatePin(config.pinLength);
        setSecretPin(newPin);
        setGuesses([]);
        setOpponentGuesses([]);
        setCurrentGuess(Array(config.pinLength).fill(''));
        setTimeLeft(config.timerDuration);
        setRoundResult(null);
        setIsRoundActive(true);
    }, [config.pinLength, config.timerDuration, generatePin]);

    const submitGuess = useCallback(() => {
        if (!isRoundActive) return;
        if (currentGuess.some(digit => digit === '')) return;

        const feedback = calculateFeedback(currentGuess, secretPin);
        const newGuess: Guess = {
            values: [...currentGuess],
            feedback,
            timestamp: Date.now(),
        };

        setGuesses(prev => [newGuess, ...prev]);
        setCurrentGuess(Array(config.pinLength).fill(''));

        if (feedback.every(f => f === 'correct')) {
            endRound('player', 'guessed');
        }
    }, [isRoundActive, currentGuess, secretPin, calculateFeedback, config.pinLength]);

    const endRound = useCallback((winner: 'player' | 'opponent' | 'draw', reason: 'guessed' | 'timeout' | 'surrender') => {
        setIsRoundActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (opponentTimerRef.current) clearInterval(opponentTimerRef.current);

        setRoundResult({ winner, reason, score: 0 });

        if (winner === 'player') setPlayerScore(s => s + 1);
        if (winner === 'opponent') setOpponentScore(s => s + 1);
    }, []);

    const nextRound = useCallback(() => {
        if (currentRound < config.maxRounds) {
            setCurrentRound(prev => prev + 1);
            startRound();
        } else {
            setIsGameOver(true);
        }
    }, [currentRound, config.maxRounds, startRound]);

    // Opponent Logic
    const opponentMakeGuess = useCallback(() => {
        const currentRoundIndex = currentRound - 1;
        const playerSecretStr = config.playerPins?.[currentRoundIndex];

        if (!playerSecretStr) return; // Should not happen if correctly configured

        const botGuess = generatePin(config.pinLength);
        const playerSecret = playerSecretStr.split('');
        const feedback = calculateFeedback(botGuess, playerSecret);

        const newGuess: Guess = {
            values: botGuess,
            feedback,
            timestamp: Date.now()
        };

        setOpponentGuesses(prev => [newGuess, ...prev]);

        if (feedback.every(f => f === 'correct')) {
            endRound('opponent', 'guessed');
        }
    }, [config.pinLength, config.playerPins, currentRound, calculateFeedback, endRound, generatePin]);


    // --- Effects ---

    // Timer Logic
    useEffect(() => {
        if (isRoundActive && config.timerDuration > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        endRound('draw', 'timeout'); // Draw on timeout? Or loss? README: "In single player mode, if the player runs out of time, they have lost"
                        // But wait, if they have lost, does opponent win?
                        // "A player wins when they win the most rounds."
                        // So if player runs out of time, they lose the round -> Opponent wins round.
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        if (isRoundActive && config.mode === 'single') {
            opponentTimerRef.current = setInterval(() => {
                opponentMakeGuess();
            }, OPPONENT_GUESS_INTERVAL);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (opponentTimerRef.current) clearInterval(opponentTimerRef.current);
        };
    }, [isRoundActive, config.timerDuration, config.mode, endRound, opponentMakeGuess]);

    // Update Round End Logic for Timeout in SP
    // If timer hits 0, and we are in SP, player loses -> Opponent wins.
    useEffect(() => {
        if (timeLeft === 0 && isRoundActive) {
            if (config.mode === 'single') {
                endRound('opponent', 'timeout');
            } else {
                endRound('draw', 'timeout');
            }
        }
    }, [timeLeft, isRoundActive, config.mode, endRound]);


    // Initial Start
    useEffect(() => {
        startRound();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        // State
        currentRound,
        playerScore,
        opponentScore,
        isGameOver,
        timeLeft,
        isRoundActive,
        guesses,
        opponentGuesses,
        currentGuess,
        roundResult,
        secretPin,

        // Actions
        setCurrentGuess,
        submitGuess,
        nextRound,
        startRound
    };
};
