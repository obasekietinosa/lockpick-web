import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
// import { Icon } from "@iconify/react";
import { socketService } from "../services/socket";
import type { WebSocketMessage } from "../services/socket";

// Reusing some UI components from GamePage or creating new ones inline for now
// to ensure we capture the multiplayer logic correctly.

interface GameState {
    mode: "single" | "multiplayer";
    config: {
        player_name: string;
        hints_enabled: boolean;
        pin_length: number;
        timer_duration: number;
    };
    room_id: string;
    player_id: string;
    pins: string[];
    gameStarted: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialPayload?: any;
}

export const MultiplayerGamePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as GameState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [guesses, setGuesses] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [opponentGuesses, setOpponentGuesses] = useState<any[]>([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [round, setRound] = useState(1);
    const [myScore, setMyScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost" | "draw">("playing");
    // const [turn, setTurn] = useState<"me" | "opponent">("me"); // Or maybe simultaneous?

    useEffect(() => {
        if (!state || state.mode !== "multiplayer" || !state.config) {
            console.error("Invalid game state:", state);
            navigate("/");
            return;
        }

        if (!socketService.isConnected()) {
            socketService.connect();
        }

        const handleMessage = (msg: WebSocketMessage) => {
            console.log("Game Page Recv:", msg);

            // Logic to handle different message types from server
            // Based on reverse engineering or guessing:
            // "guess_result" -> result of my guess
            // "opponent_guess" -> result of opponent guess (for display)
            // "round_end" -> round finished
            // "game_end" -> game finished

            if (msg.type === "guess_result") {
                 // Update my guesses
                 // Payload likely contains: { guess: string, result: string, correct: boolean }
                 setGuesses(prev => [msg.payload, ...prev]);
            } else if (msg.type === "opponent_guess") {
                setOpponentGuesses(prev => [msg.payload, ...prev]);
            } else if (msg.type === "round_end") {
                // handle round transition
                alert(`Round Ended! Winner: ${msg.payload.winner}`);
                setRound(prev => prev + 1);
                setGuesses([]);
                setOpponentGuesses([]);
                // Update scores
                setMyScore(msg.payload.scores[state.player_id]);
                // Need to find opponent ID to set their score, assuming 2 players
                const opponentId = Object.keys(msg.payload.scores).find(id => id !== state.player_id);
                if (opponentId) setOpponentScore(msg.payload.scores[opponentId]);
            } else if (msg.type === "game_end") {
                setGameStatus(msg.payload.winner === state.player_id ? "won" : "lost");
            }
        };

        const unsubscribe = socketService.subscribe(handleMessage);

        return () => {
            unsubscribe();
        };
    }, [state, navigate]);

    // Safety check: if state is invalid, don't render content (useEffect will redirect)
    if (!state || !state.config) {
        return null;
    }

    const handleGuessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentGuess.length !== state.config.pin_length) return;

        // Send guess via WebSocket
        socketService.sendMessage({
            type: "guess",
            room_id: state.room_id,
            player_id: state.player_id,
            payload: {
                guess: currentGuess
            }
        });

        setCurrentGuess("");
    };

    // UI Structure based on Single Player but with Opponent View
    return (
        <div className="min-h-screen bg-slate-900 text-white p-4">
             {/* Header */}
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Round {round}/3</h1>
                    <div className="text-sm text-slate-400">Room: {state.room_id}</div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-cyan-400">{state.config.player_name} (You)</div>
                    <div className="text-2xl">{myScore} - {opponentScore}</div>
                    <div className="font-bold text-pink-400">Opponent</div>
                    {gameStatus !== "playing" && (
                         <div className={`mt-2 font-bold ${gameStatus === "won" ? "text-green-400" : "text-red-400"}`}>
                             {gameStatus.toUpperCase()}
                         </div>
                    )}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* My Board */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold mb-4 text-cyan-400">Your Guesses</h2>

                    <form onSubmit={handleGuessSubmit} className="mb-6 flex gap-2">
                        <input
                            type="text"
                            value={currentGuess}
                            onChange={(e) => setCurrentGuess(e.target.value)}
                            maxLength={state.config.pin_length}
                            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-xl font-mono tracking-widest text-center focus:border-cyan-500 focus:outline-none"
                            placeholder="Enter guess..."
                        />
                        <button
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-lg font-bold transition-colors"
                        >
                            Guess
                        </button>
                    </form>

                    <div className="space-y-2 h-96 overflow-y-auto">
                        {guesses.map((g, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-slate-700">
                                <span className="font-mono text-lg tracking-widest">{g.guess}</span>
                                {/* Render feedback here based on g.feedback or similar */}
                                <span>{JSON.stringify(g.result)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Opponent Board */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 opacity-80">
                    <h2 className="text-xl font-bold mb-4 text-pink-400">Opponent's Activity</h2>
                    <div className="space-y-2 h-[calc(100%-3rem)] overflow-y-auto">
                         {opponentGuesses.map((g, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-slate-700">
                                <span className="font-mono text-lg tracking-widest">****</span>
                                {/* We probably don't see their exact guess? Or maybe we do? Rules say "we will send the most recent of these to the other player" */}
                                {/* "The players guesses (we will send the most recent of these to the other player)" */}
                                {/* Maybe we see the feedback? */}
                                <span>{JSON.stringify(g.result)}</span>
                            </div>
                        ))}
                        {opponentGuesses.length === 0 && (
                            <div className="text-center text-slate-500 mt-10">
                                Waiting for opponent's move...
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};
