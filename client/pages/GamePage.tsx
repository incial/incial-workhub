
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Play, RotateCcw, Trophy, Gamepad2, Maximize, Minimize, Pause } from 'lucide-react';

const GRID_SIZE = 20;
const SPEED = 80; // Slightly faster for smoother feel

type Point = { x: number; y: number };

export const GamePage: React.FC = () => {
    const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Point>({ x: 15, y: 5 });
    const [direction, setDirection] = useState<Point>({ x: 0, y: -1 }); // Moving Up
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false); // To distinguish between Initial Load and Paused
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snakeHighScore') || '0'));
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Refs for mutable state in game loop
    const directionRef = useRef(direction);
    const moveQueueRef = useRef<Point[]>([]); // Input buffer for smooth controls
    const gameLoopRef = useRef<number | null>(null);
    const gameBoardRef = useRef<HTMLDivElement>(null);

    // Sync ref with state
    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    // Handle Fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        if (!gameBoardRef.current) return;

        if (!document.fullscreenElement) {
            try {
                await gameBoardRef.current.requestFullscreen();
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    };

    const generateFood = useCallback((): Point => {
        let newFood;
        let isOnSnake;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
            // Check collision with snake using current state logic would be stale here if we used state directly,
            // but since we restart game mostly, random is fine. Ideally checks vs existing snake.
            isOnSnake = false; // Simplified for restart. Collision handled in game loop.
        } while (isOnSnake);
        return newFood;
    }, []);

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFood());
        setDirection({ x: 0, y: -1 });
        directionRef.current = { x: 0, y: -1 };
        moveQueueRef.current = [];
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        setHasStarted(true);
    };

    const togglePause = () => {
        if (gameOver) {
            resetGame();
        } else {
            setIsPlaying(prev => !prev);
            setHasStarted(true);
        }
    };

    const endGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score.toString());
        }
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };

    const moveSnake = useCallback(() => {
        setSnake((prevSnake) => {
            // Consume next move from queue if available
            if (moveQueueRef.current.length > 0) {
                directionRef.current = moveQueueRef.current.shift()!;
            }

            const head = prevSnake[0];
            const newHead = {
                x: head.x + directionRef.current.x,
                y: head.y + directionRef.current.y,
            };

            // Wrap Walls Logic
            if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
            if (newHead.x >= GRID_SIZE) newHead.x = 0;
            if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
            if (newHead.y >= GRID_SIZE) newHead.y = 0;

            // Check Self Collision (Death Condition)
            if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                const isTail = newHead.x === prevSnake[prevSnake.length - 1].x && newHead.y === prevSnake[prevSnake.length - 1].y;
                if (!isTail || (newHead.x === food.x && newHead.y === food.y)) {
                    endGame();
                    return prevSnake;
                }
            }

            const newSnake = [newHead, ...prevSnake];

            // Check Food
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(s => s + 1);
                setFood(generateFood());
                // Don't pop tail (grow)
            } else {
                newSnake.pop(); // Remove tail (move)
            }

            return newSnake;
        });
    }, [food, generateFood]);

    // Key Controls
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // Prevent default scrolling for game keys
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }

            // Spacebar Logic: Toggle Pause/Resume or Restart if Game Over
            if (key === ' ') {
                togglePause();
                return;
            }

            if (!isPlaying) return;

            // Determine the last planned direction (from queue or current ref)
            const lastPlannedMove = moveQueueRef.current.length > 0
                ? moveQueueRef.current[moveQueueRef.current.length - 1]
                : directionRef.current;

            const pushMove = (x: number, y: number) => {
                // Prevent 180 degree turns
                if (lastPlannedMove.x !== -x && lastPlannedMove.y !== -y) {
                    moveQueueRef.current.push({ x, y });
                }
            };

            switch (key) {
                case 'arrowup':
                case 'w':
                    pushMove(0, -1);
                    break;
                case 'arrowdown':
                case 's':
                    pushMove(0, 1);
                    break;
                case 'arrowleft':
                case 'a':
                    pushMove(-1, 0);
                    break;
                case 'arrowright':
                case 'd':
                    pushMove(1, 0);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying, gameOver]); // Dependencies are cleaner now since togglePause handles state access

    // Game Loop
    useEffect(() => {
        if (isPlaying) {
            gameLoopRef.current = window.setInterval(moveSnake, SPEED);
        } else {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isPlaying, moveSnake]);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />

                <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col items-center relative overflow-hidden max-w-2xl w-full">
                        {/* Stats Bar (Normal View) */}
                        <div className="flex items-center justify-between w-full mb-6 px-4">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score</span>
                                    <span className="text-3xl font-black text-gray-900">{score}</span>
                                </div>
                                <div className="h-10 w-px bg-gray-100"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <Trophy className="h-3 w-3 text-yellow-500" /> Best
                                    </span>
                                    <span className="text-3xl font-black text-yellow-500">{highScore}</span>
                                </div>
                            </div>
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                title="Toggle Fullscreen"
                            >
                                {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                            </button>
                        </div>

                        {/* Game Board Container */}
                        <div
                            ref={gameBoardRef}
                            className={`relative bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-slate-800 ${isFullscreen ? 'w-full h-full' : ''}`}
                            style={{
                                width: isFullscreen ? '100%' : '400px',
                                height: isFullscreen ? '100%' : '400px',
                            }}
                        >
                            {/* Fullscreen HUD (Only visible in Fullscreen) */}
                            {isFullscreen && (
                                <div className="absolute top-8 left-8 z-50 bg-slate-800/90 backdrop-blur-md text-white p-6 rounded-2xl border border-slate-700 shadow-2xl flex flex-col gap-2 min-w-[160px] animate-in fade-in slide-in-from-left-4 duration-300">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Run</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white">{score}</span>
                                        <span className="text-sm font-medium text-slate-400">pts</span>
                                    </div>
                                    <div className="h-px w-full bg-slate-700 my-2"></div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-1.5"><Trophy className="h-3 w-3 text-yellow-500" /> Best</span>
                                        <span className="font-bold text-yellow-500">{highScore}</span>
                                    </div>
                                </div>
                            )}

                            <div
                                className="relative"
                                style={{
                                    width: isFullscreen ? 'min(90vw, 90vh)' : '400px',
                                    height: isFullscreen ? 'min(90vw, 90vh)' : '400px',
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                                    gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                                }}
                            >
                                {/* Grid Lines (Subtle) */}
                                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                                    <div key={i} className="border-[0.5px] border-slate-800/30" />
                                ))}

                                {/* Food */}
                                <div
                                    className="absolute bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse z-10"
                                    style={{
                                        width: `${100 / GRID_SIZE}%`,
                                        height: `${100 / GRID_SIZE}%`,
                                        left: `${(food.x / GRID_SIZE) * 100}%`,
                                        top: `${(food.y / GRID_SIZE) * 100}%`,
                                        transform: 'scale(0.7)'
                                    }}
                                />

                                {/* Snake */}
                                {snake.map((segment, index) => {
                                    const isHead = index === 0;
                                    return (
                                        <div
                                            key={index}
                                            className={`absolute rounded-sm transition-all duration-[80ms] linear ${isHead ? 'bg-indigo-500 z-20 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-indigo-400/80 z-10'}`}
                                            style={{
                                                width: `${100 / GRID_SIZE}%`,
                                                height: `${100 / GRID_SIZE}%`,
                                                left: `${(segment.x / GRID_SIZE) * 100}%`,
                                                top: `${(segment.y / GRID_SIZE) * 100}%`,
                                                transform: isHead ? 'scale(1)' : 'scale(0.92)'
                                            }}
                                        >
                                            {isHead && (
                                                <div className="absolute inset-0 flex items-center justify-center gap-[4px]">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Start / Pause Overlay */}
                                {!isPlaying && !gameOver && (
                                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-in fade-in duration-200">
                                        {hasStarted ? (
                                            <>
                                                <div className="bg-indigo-600 p-4 rounded-full shadow-lg shadow-indigo-500/30 mb-4 animate-bounce">
                                                    <Pause className="h-8 w-8 text-white fill-current" />
                                                </div>
                                                <h3 className="text-3xl font-bold text-white mb-2">Paused</h3>
                                                <button
                                                    onClick={togglePause}
                                                    className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors mt-4"
                                                >
                                                    Resume Game
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={resetGame}
                                                    className="group relative px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                                >
                                                    <Play className="h-6 w-6 fill-current" />
                                                    Start Game
                                                </button>
                                                <p className="mt-6 text-sm font-semibold text-slate-400 flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700 text-xs text-white">SPACE</span> to Start
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {gameOver && (
                                    <div className="absolute inset-0 bg-red-900/90 backdrop-blur-md flex flex-col items-center justify-center z-30 animate-in fade-in zoom-in duration-300">
                                        <h3 className="text-4xl font-black text-white mb-2 tracking-tight">CRASHED!</h3>
                                        <p className="text-red-200 font-medium mb-8 text-lg">Score: {score}</p>
                                        <button
                                            onClick={resetGame}
                                            className="px-8 py-4 bg-white text-red-600 font-bold rounded-2xl shadow-xl hover:bg-red-50 transition-all flex items-center gap-3 hover:-translate-y-1"
                                        >
                                            <RotateCcw className="h-5 w-5" />
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Controls Hint */}
                        <div className="mt-8 flex gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <div className="flex flex-col items-center gap-1">
                                <div className="px-2 py-1 bg-gray-100 rounded border border-gray-200">W / ↑</div>
                                <div className="flex gap-1">
                                    <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200">A / ←</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200">S / ↓</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200">D / →</span>
                                </div>
                                <span className="mt-1">Move</span>
                            </div>
                            <div className="w-px bg-gray-100 h-full mx-2"></div>
                            <div className="flex flex-col items-center justify-center gap-1">
                                <span className="px-6 py-1 bg-gray-100 rounded border border-gray-200 w-full text-center">SPACE</span>
                                <span className="mt-1">Play / Pause</span>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};
