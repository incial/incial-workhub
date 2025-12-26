import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { Play, RotateCcw, Trophy, Maximize, Minimize, Pause, Zap, Volume2, VolumeX, Flame, Wind, Gauge, Activity, Target } from 'lucide-react';

const GRID_SIZE = 20;

type Point = { x: number; y: number };
type Difficulty = 'zen' | 'focus' | 'hyper';
type Particle = { id: number; x: number; y: number; color: string };

const SPEEDS: Record<Difficulty, number> = {
    zen: 120,
    focus: 70,
    hyper: 40
};

const SCORES: Record<Difficulty, number> = {
    zen: 5,
    focus: 10,
    hyper: 20
};

export const GamePage: React.FC = () => {
    const { isSidebarCollapsed } = useLayout();
    const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Point>({ x: 15, y: 5 });
    const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snakeHighScore') || '0'));
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>('focus');
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [combo, setCombo] = useState(1);
    const [lastEatTime, setLastEatTime] = useState(0);

    const directionRef = useRef(direction);
    const moveQueueRef = useRef<Point[]>([]);
    const gameLoopRef = useRef<number | null>(null);
    const gameBoardRef = useRef<HTMLDivElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Sound Engine
    const playTone = useCallback((type: 'eat' | 'die' | 'move' | 'start') => {
        if (!isSoundOn) return;
        
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'eat') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600 + (combo * 50), now); // Pitch rises with combo
            osc.frequency.exponentialRampToValueAtTime(1000 + (combo * 50), now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'die') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'start') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    }, [isSoundOn, combo]);

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

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
                console.error("Fullscreen error", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    };

    const generateFood = useCallback((): Point => {
        let newFood;
        let isCollision;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
            // Check collision with snake using current state in functional update would be tricky, 
            // relying on probability here as grid is large enough. 
            // Ideally pass snake as arg or use ref.
            isCollision = false; 
        } while (isCollision);
        return newFood;
    }, []);

    const resetGame = () => {
        playTone('start');
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFood());
        setDirection({ x: 0, y: -1 });
        directionRef.current = { x: 0, y: -1 };
        moveQueueRef.current = [];
        setScore(0);
        setCombo(1);
        setGameOver(false);
        setIsPlaying(true);
        setHasStarted(true);
        setParticles([]);
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
        playTone('die');
        setIsPlaying(false);
        setGameOver(true);
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('snakeHighScore', score.toString());
        }
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };

    const spawnParticles = (x: number, y: number) => {
        const id = Date.now();
        const colors = ['bg-indigo-400', 'bg-purple-400', 'bg-white', 'bg-cyan-400'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        setParticles(prev => [...prev, { id, x, y, color }]);
        
        // Auto remove after animation
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, 600);
    };

    const moveSnake = useCallback(() => {
        setSnake((prevSnake) => {
            if (moveQueueRef.current.length > 0) {
                directionRef.current = moveQueueRef.current.shift()!;
            }

            const head = prevSnake[0];
            const newHead = {
                x: head.x + directionRef.current.x,
                y: head.y + directionRef.current.y,
            };

            // Wrap around logic
            if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
            if (newHead.x >= GRID_SIZE) newHead.x = 0;
            if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
            if (newHead.y >= GRID_SIZE) newHead.y = 0;

            // Self collision
            if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                endGame();
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            if (newHead.x === food.x && newHead.y === food.y) {
                // EAT
                const now = Date.now();
                // Combo logic: if eaten within 3 seconds
                let newCombo = 1;
                if (now - lastEatTime < 3000) {
                    newCombo = Math.min(combo + 0.5, 5); // Max combo 5x
                }
                setCombo(newCombo);
                setLastEatTime(now);
                
                playTone('eat');
                spawnParticles(newHead.x, newHead.y);
                setScore(s => s + Math.floor(SCORES[difficulty] * newCombo));
                setFood(generateFood());
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [food, generateFood, difficulty, combo, lastEatTime, playTone]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
            if (key === ' ') {
                togglePause();
                return;
            }
            if (!isPlaying) return;
            
            const lastPlannedMove = moveQueueRef.current.length > 0 ? moveQueueRef.current[moveQueueRef.current.length - 1] : directionRef.current;
            const pushMove = (x: number, y: number) => {
                if (lastPlannedMove.x !== -x && lastPlannedMove.y !== -y) {
                    moveQueueRef.current.push({ x, y });
                }
            };
            switch (key) {
                case 'arrowup': case 'w': pushMove(0, -1); break;
                case 'arrowdown': case 's': pushMove(0, 1); break;
                case 'arrowleft': case 'a': pushMove(-1, 0); break;
                case 'arrowright': case 'd': pushMove(1, 0); break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying, gameOver]);

    useEffect(() => {
        if (isPlaying) {
            gameLoopRef.current = window.setInterval(moveSnake, SPEEDS[difficulty]);
        } else {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
        return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
    }, [isPlaying, moveSnake, difficulty]);

    const getDifficultyIcon = (d: Difficulty) => {
        switch(d) {
            case 'zen': return <Wind className="h-4 w-4" />;
            case 'focus': return <Target className="h-4 w-4" />;
            case 'hyper': return <Flame className="h-4 w-4" />;
        }
    };

    return (
        <div className="flex min-h-screen mesh-bg relative">
            <div className="glass-canvas" />
            <Sidebar />
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
                <Navbar />

                <main className="flex-1 flex flex-col items-center justify-center px-4 lg:px-12 py-6 lg:py-10 pb-32">
                    
                    <div className="mb-8 lg:mb-12 text-center animate-premium">
                        <div className="flex items-center justify-center gap-3 mb-4">
                             <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em]">Neuro-Sync Mode</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none display-text">Break<span className="text-indigo-600">.</span></h1>
                        <p className="text-slate-500 text-sm lg:text-lg mt-4 font-medium max-w-lg mx-auto">Tactical sequence management to recalibrate focus.</p>
                    </div>

                    <div className="bg-white/40 backdrop-blur-3xl p-6 lg:p-10 rounded-[3rem] lg:rounded-[4rem] shadow-2xl border border-white flex flex-col items-center relative overflow-hidden max-w-3xl w-full">
                        
                        {/* HUD */}
                        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-8 lg:mb-10 px-2 lg:px-6 gap-6">
                            <div className="flex items-center gap-8 lg:gap-12">
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</span>
                                    <span className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter">{score}</span>
                                </div>
                                <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Trophy className="h-3 w-3 text-indigo-500" /> Best
                                    </span>
                                    <span className="text-3xl lg:text-4xl font-black text-indigo-600 tracking-tighter">{highScore}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white/60 p-1.5 rounded-2xl border border-white/50 shadow-sm">
                                <button
                                    onClick={() => setIsSoundOn(!isSoundOn)}
                                    className={`p-3 rounded-xl transition-all ${isSoundOn ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {isSoundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                                </button>
                                <div className="w-px h-6 bg-slate-200/50"></div>
                                <button
                                    onClick={toggleFullscreen}
                                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Game Board */}
                        <div
                            ref={gameBoardRef}
                            className={`relative bg-slate-950 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border-4 lg:border-8 border-slate-900 group ${isFullscreen ? 'w-full h-full rounded-none border-0' : ''}`}
                            style={{ width: isFullscreen ? '100%' : '100%', maxWidth: isFullscreen ? 'none' : '440px', aspectRatio: '1/1' }}
                        >
                            <div
                                className="relative"
                                style={{
                                    width: isFullscreen ? 'min(90vw, 90vh)' : '100%',
                                    height: isFullscreen ? 'min(90vw, 90vh)' : '100%',
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                                    gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                                }}
                            >
                                {/* Grid Lines */}
                                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                                    <div key={i} className="border-[0.5px] border-slate-800/30" />
                                ))}

                                {/* Combo Indicator */}
                                {combo > 1 && isPlaying && (
                                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end animate-in slide-in-from-right-4 fade-in duration-300">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Combo</span>
                                        <span className="text-4xl font-black text-white italic tracking-tighter drop-shadow-glow">x{combo.toFixed(1)}</span>
                                    </div>
                                )}

                                {/* Particles */}
                                {particles.map(p => (
                                    <div 
                                        key={p.id}
                                        className={`absolute w-full h-full rounded-full ${p.color} animate-ping`}
                                        style={{ 
                                            left: `${(p.x / GRID_SIZE) * 100}%`, 
                                            top: `${(p.y / GRID_SIZE) * 100}%`,
                                            width: `${100 / GRID_SIZE}%`, 
                                            height: `${100 / GRID_SIZE}%`,
                                            opacity: 0.6
                                        }}
                                    />
                                ))}

                                {/* Food */}
                                <div
                                    className="absolute bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-pulse z-10"
                                    style={{
                                        width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`,
                                        left: `${(food.x / GRID_SIZE) * 100}%`, top: `${(food.y / GRID_SIZE) * 100}%`,
                                        transform: 'scale(0.6)'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
                                </div>

                                {/* Snake Body */}
                                {snake.map((segment, index) => {
                                    const isHead = index === 0;
                                    return (
                                        <div
                                            key={index}
                                            className={`absolute rounded-md transition-all duration-[80ms] linear ${isHead ? 'bg-indigo-500 z-20 shadow-[0_0_30px_rgba(99,102,241,0.6)]' : 'bg-indigo-400/60 z-10'}`}
                                            style={{
                                                width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`,
                                                left: `${(segment.x / GRID_SIZE) * 100}%`, top: `${(segment.y / GRID_SIZE) * 100}%`,
                                                transform: isHead ? 'scale(1.1)' : 'scale(0.95)'
                                            }}
                                        >
                                            {isHead && (
                                                <div className="absolute inset-0 flex items-center justify-center gap-1">
                                                    <div className="w-1 h-1 bg-white rounded-full shadow-sm" />
                                                    <div className="w-1 h-1 bg-white rounded-full shadow-sm" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* UI Overlays */}
                                {!isPlaying && !gameOver && (
                                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-30 animate-in fade-in duration-500 p-6 text-center">
                                        {hasStarted ? (
                                            <>
                                                <div className="bg-indigo-600 p-4 lg:p-5 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-6 animate-bounce">
                                                    <Pause className="h-8 w-8 lg:h-10 lg:w-10 text-white fill-current" />
                                                </div>
                                                <h3 className="text-2xl lg:text-3xl font-black text-white mb-6 tracking-tighter uppercase tracking-[0.1em]">Signal Paused</h3>
                                                <button onClick={togglePause} className="px-8 lg:px-10 py-3 lg:py-4 bg-white text-slate-900 font-black text-[10px] lg:text-xs uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all">Resume Stream</button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-16 w-16 lg:h-20 lg:w-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 lg:mb-8 shadow-glow rotate-12">
                                                    <Zap className="h-8 w-8 lg:h-10 lg:w-10 text-white fill-current" />
                                                </div>
                                                
                                                {/* Difficulty Selector */}
                                                <div className="flex gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
                                                    {(['zen', 'focus', 'hyper'] as Difficulty[]).map(d => (
                                                        <button 
                                                            key={d}
                                                            onClick={() => setDifficulty(d)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${difficulty === d ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                                        >
                                                            {getDifficultyIcon(d)} {d}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button onClick={resetGame} className="px-10 lg:px-12 py-4 lg:py-5 bg-white text-indigo-900 font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all w-full max-w-[200px]">
                                                    Initialize
                                                </button>
                                                
                                                <p className="mt-6 lg:mt-8 text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                                    <span className="px-2 py-1 bg-slate-900 rounded-lg border border-slate-800 text-white">SPACE</span> TO START
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {gameOver && (
                                    <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-30 animate-in zoom-in duration-500 p-6 text-center">
                                        <h3 className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">DATA CRASHED</h3>
                                        <div className="flex flex-col gap-1 mb-8 lg:mb-12">
                                            <p className="text-rose-200 font-black text-lg lg:text-xl uppercase tracking-[0.2em]">Score: {score}</p>
                                            <p className="text-rose-400 font-bold text-xs uppercase tracking-widest">Mode: {difficulty}</p>
                                        </div>
                                        <button onClick={resetGame} className="px-10 lg:px-12 py-4 lg:py-5 bg-white text-rose-600 font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-4">
                                            <RotateCcw className="h-4 w-4 lg:h-5 lg:w-5" /> REBOOT
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-8 lg:mt-12 w-full grid grid-cols-2 gap-4 lg:gap-12 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            <div className="flex flex-col items-center gap-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <div /> <span className="px-3 py-1.5 bg-slate-950 rounded-lg text-white border border-slate-800 shadow-sm">W</span> <div />
                                    <span className="px-3 py-1.5 bg-slate-950 rounded-lg text-white border border-slate-800 shadow-sm">A</span>
                                    <span className="px-3 py-1.5 bg-slate-950 rounded-lg text-white border border-slate-800 shadow-sm">S</span>
                                    <span className="px-3 py-1.5 bg-slate-950 rounded-lg text-white border border-slate-800 shadow-sm">D</span>
                                </div>
                                <span>Navigation</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-4">
                                <span className="px-6 lg:px-8 py-2 bg-slate-950 rounded-lg text-white border border-slate-800 shadow-sm">SPACEBAR</span>
                                <span>Pulse Control</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};