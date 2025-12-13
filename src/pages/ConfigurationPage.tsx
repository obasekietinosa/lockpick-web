import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Icon } from "@iconify/react";

export const ConfigurationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mode = (location.state as any)?.mode || "single";

    const [name, setName] = useState("");
    const [hintsEnabled, setHintsEnabled] = useState(true);
    const [pinLength, setPinLength] = useState(5);
    const [timerDuration, setTimerDuration] = useState(30);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Config submitted:", { mode, name, hintsEnabled, pinLength, timerDuration });
        // TODO: Navigate to game or lobby
        // For now, just go back to home as a placeholder or stay here.
        // navigate("/game"); 
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-900">
            {/* Background decorations - copied from LandingPage for consistency */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-10 left-10 text-cyan-500/10 animate-bounce delay-700">
                    <Icon icon="mdi:lock-open-variant-outline" width="120" />
                </div>
                <div className="absolute bottom-20 right-20 text-purple-500/10 animate-bounce delay-1000">
                    <Icon icon="mdi:lock-outline" width="150" />
                </div>
            </div>

            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-sm pb-2">
                        {mode === "multiplayer" ? "Multiplayer Setup" : "Game Config"}
                    </h1>
                    <p className="text-gray-400 mt-2">Customize your challenge</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 space-y-6">

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Player Name</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                <Icon icon="mdi:account" width="20" />
                            </span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none text-white transition-all placeholder:text-slate-600"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-600">
                        <div className="flex items-center space-x-3">
                            <Icon icon="mdi:lightbulb-on-outline" className="text-yellow-400" width="24" />
                            <span className="text-sm font-medium text-slate-300">Enable Hints</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setHintsEnabled(!hintsEnabled)}
                            className={`relative w-14 h-7 rounded-full p-1 transition-colors duration-300 ${hintsEnabled ? "bg-cyan-500" : "bg-slate-600"
                                }`}
                        >
                            <div
                                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${hintsEnabled ? "translate-x-7" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Icon icon="mdi:numeric" width="20" /> Pin Length
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[5, 7, 10].map((len) => (
                                <label key={len} className={`
                        cursor-pointer flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200
                        ${pinLength === len
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                        : 'bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500'}
                    `}>
                                    <input
                                        type="radio"
                                        name="pinLength"
                                        value={len}
                                        checked={pinLength === len}
                                        onChange={() => setPinLength(len)}
                                        className="sr-only"
                                    />
                                    <span className="text-xl font-bold">{len}</span>
                                    <span className="text-xs">digits</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Icon icon="mdi:timer-outline" width="20" /> Timer
                        </label>
                        <select
                            value={timerDuration}
                            onChange={(e) => setTimerDuration(Number(e.target.value))}
                            className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-600 focus:border-cyan-400 focus:outline-none text-white transition-all appearance-none"
                            style={{ backgroundImage: 'none' }} // Remove default arrow if needed, or keeping it simple
                        >
                            <option value={0}>No Timer (Relaxed)</option>
                            <option value={30}>30 Seconds (Blitz)</option>
                            <option value={60}>1 Minute (Standard)</option>
                            <option value={180}>3 Minutes (Strategic)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-bold hover:bg-slate-800 transition-all"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-cyan-500/20 transform transition hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Start Game
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
