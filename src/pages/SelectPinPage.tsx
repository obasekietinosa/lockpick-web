import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Icon } from "@iconify/react";

interface GameState {
    mode: "single" | "multiplayer";
    config: {
        player_name: string;
        hints_enabled: boolean;
        pin_length: number;
        timer_duration: number;
    };
    room_id?: string;
    player_id?: string;
}

export const SelectPinPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as GameState;

    // Redirect if no state or not multiplayer (sanity check)
    useEffect(() => {
        if (!state) {
            navigate("/");
            return;
        }
    }, [state, navigate]);

    const pinLength = state?.config?.pin_length || 5;

    // We need 3 pins (one for each round)
    const [pins, setPins] = useState<string[]>(["", "", ""]);
    const [activeRound, setActiveRound] = useState(0);

    // Auto-focus first input when round changes
    useEffect(() => {
        const firstInput = document.getElementById(`pin-${activeRound}-0`);
        firstInput?.focus();
    }, [activeRound]);

    const handlePinChange = (roundIndex: number, digitIndex: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const currentPin = pins[roundIndex];
        const digits = currentPin.padEnd(pinLength, " ").split("");
        digits[digitIndex] = value;

        const newPin = digits.join("").trim();
        const newPins = [...pins];
        newPins[roundIndex] = newPin;
        setPins(newPins);

        // Auto-advance
        if (value && digitIndex < pinLength - 1) {
            const nextInput = document.getElementById(`pin-${roundIndex}-${digitIndex + 1}`);
            nextInput?.focus();
        }
    };

    const randomizePins = () => {
        const newPins = pins.map(() => {
            let pin = "";
            for (let i = 0; i < pinLength; i++) {
                pin += Math.floor(Math.random() * 10).toString();
            }
            return pin;
        });
        setPins(newPins);
    };

    const isComplete = pins.every(pin => pin.length === pinLength);

    const handleReady = () => {
        if (!isComplete) return;

        // Navigate to game with complete state including pins
        navigate("/game", {
            state: {
                ...state,
                pins
            }
        });
    };

    if (!state) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-900">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-20 left-20 text-cyan-500/10 animate-pulse delay-300">
                    <Icon icon="mdi:form-textbox-password" width="100" />
                </div>
                <div className="absolute bottom-20 right-20 text-purple-500/10 animate-bounce delay-700">
                    <Icon icon="mdi:shield-key-outline" width="120" />
                </div>
            </div>

            <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-sm pb-2">
                        Select Your Pins
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Choose secret pins for all 3 rounds. Don't let your opponent guess them!
                    </p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 space-y-8">

                    {/* Round Tabs */}
                    <div className="flex justify-center space-x-4">
                        {[0, 1, 2].map((i) => (
                            <button
                                key={i}
                                onClick={() => setActiveRound(i)}
                                className={`px-4 py-2 rounded-lg transition-all ${activeRound === i
                                    ? "bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/20"
                                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                                    }`}
                            >
                                Round {i + 1}
                                {pins[i].length === pinLength && (
                                    <Icon icon="mdi:check-circle" className="inline-block ml-2 text-green-400" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Pin Input Area */}
                    <div className="text-center space-y-4 min-h-[120px]">
                        <h3 className="text-xl text-slate-200 font-medium">
                            Round {activeRound + 1} Secret Pin
                        </h3>
                        <div className="flex justify-center gap-2 sm:gap-4">
                            {Array.from({ length: pinLength }).map((_, idx) => (
                                <input
                                    key={idx}
                                    id={`pin-${activeRound}-${idx}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={pins[activeRound][idx] || ""}
                                    onChange={(e) => handlePinChange(activeRound, idx, e.target.value)}
                                    // Handle Backspace to move previous
                                    onKeyDown={(e) => {
                                        if (e.key === "Backspace" && !pins[activeRound][idx] && idx > 0) {
                                            document.getElementById(`pin-${activeRound}-${idx - 1}`)?.focus();
                                        }
                                    }}
                                    className="w-12 h-14 sm:w-16 sm:h-20 text-center text-2xl sm:text-4xl font-bold bg-slate-900 border-2 border-slate-600 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-white transition-all caret-cyan-400"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700/50">
                        <button
                            onClick={randomizePins}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-bold hover:bg-slate-800 transition-all hover:text-white"
                        >
                            <Icon icon="mdi:shuffle-variant" width="20" />
                            Randomize All
                        </button>
                        <button
                            onClick={handleReady}
                            disabled={!isComplete}
                            className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-500/20 transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Icon icon="mdi:check-bold" width="20" />
                            I'm Ready
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
