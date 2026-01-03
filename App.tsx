
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Question } from './types';
import { TIMER_MAX, TICK_RATE } from './constants';
import { generateQuestion } from './utils/mathUtils';
import { getEncouragement } from './services/geminiService';
import { TimerBar } from './components/TimerBar';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('quickmath_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [timeLeft, setTimeLeft] = useState(TIMER_MAX);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState('');
  const [gameOverReason, setGameOverReason] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Use ReturnType<typeof setInterval> to avoid environment-specific "NodeJS" namespace issues
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sound effects logic (optional placeholders)
  const playSound = (type: 'correct' | 'wrong' | 'tick') => {
    // In a real environment we'd use new Audio(...)
  };

  const endGame = useCallback(async (reason: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('GAMEOVER');
    setGameOverReason(reason);
    
    // Fetch AI feedback
    const msg = await getEncouragement(score, reason);
    setAiMessage(msg);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('quickmath_highscore', score.toString());
    }
  }, [score, highScore]);

  const nextRound = useCallback(() => {
    const q = generateQuestion(score);
    setCurrentQuestion(q);
    setTimeLeft(TIMER_MAX);
    setUserInput('');
    if (inputRef.current) inputRef.current.focus();
  }, [score]);

  const startGame = () => {
    setScore(0);
    setStatus('PLAYING');
    setGameOverReason('');
    setAiMessage('');
    nextRound();
  };

  // Timer logic
  useEffect(() => {
    if (status === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            endGame('Waktu habis!');
            return 0;
          }
          return prev - (TICK_RATE / 1000);
        });
      }, TICK_RATE);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, endGame]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^-?\d*$/.test(val)) {
      setUserInput(val);
      
      // Auto-check if the answer is potentially correct
      // We check length to avoid premature failures for numbers like "12" when answer is "123"
      // But for fast math, most people hit enter. Let's stick to Enter key or exact match if single digit
      if (currentQuestion && parseInt(val, 10) === currentQuestion.answer) {
        setScore(prev => prev + 1);
        nextRound();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;

    if (parseInt(userInput, 10) === currentQuestion.answer) {
      setScore(prev => prev + 1);
      nextRound();
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      endGame('Jawaban salah!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0f172a]">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 w-full max-w-md">
        {status === 'IDLE' && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-blue-600">
              QUICK<span className="text-white">MATH</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Siap menguji kecepatan otakmu? <br/>
              Kamu hanya punya <span className="text-cyan-400 font-bold">10 detik</span> per soal!
            </p>
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl">
              <p className="text-sm uppercase tracking-widest text-slate-500 mb-1">High Score</p>
              <p className="text-4xl font-bold text-white">{highScore}</p>
            </div>
            <button 
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xl rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-cyan-500/20"
            >
              MULAI PERMAINAN
            </button>
          </div>
        )}

        {status === 'PLAYING' && currentQuestion && (
          <div className={`space-y-8 ${isShaking ? 'animate-shake' : ''}`}>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-slate-500">Score</p>
                <p className="text-3xl font-bold text-cyan-400">{score}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-xs uppercase tracking-widest text-slate-500">High Score</p>
                <p className="text-xl font-semibold text-slate-300">{highScore}</p>
              </div>
            </div>

            <TimerBar timeLeft={timeLeft} />

            <div className="bg-slate-800/80 border-2 border-slate-700/50 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
              <div className="text-7xl font-black mb-10 tracking-tight text-white select-none">
                {currentQuestion.text}
              </div>

              <form onSubmit={handleSubmit} className="w-full">
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="?"
                  className="w-full bg-slate-900 border-2 border-slate-600 focus:border-cyan-500 text-center text-5xl py-4 rounded-2xl outline-none transition-all font-bold text-white"
                />
              </form>
            </div>
            
            <p className="text-center text-slate-500 text-sm animate-pulse">
              Ketik jawaban dan tekan Enter atau tunggu auto-submit
            </p>
          </div>
        )}

        {status === 'GAMEOVER' && (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="relative">
              <h2 className="text-5xl font-black text-rose-500 mb-2">GAME OVER</h2>
              <p className="text-slate-300 font-medium">{gameOverReason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Skor Kamu</p>
                <p className="text-4xl font-bold text-white">{score}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">High Score</p>
                <p className="text-4xl font-bold text-white">{highScore}</p>
              </div>
            </div>

            {aiMessage && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl italic text-cyan-200">
                "{aiMessage}"
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={startGame}
                className="w-full py-4 bg-white text-slate-900 font-bold text-xl rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
              >
                MAIN LAGI
              </button>
              <button 
                onClick={() => setStatus('IDLE')}
                className="w-full py-4 bg-slate-800 text-white font-bold text-lg rounded-2xl transition-all hover:bg-slate-700"
              >
                MENU UTAMA
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="mt-12 text-slate-600 text-xs font-medium tracking-widest uppercase">
        QuickMath Pro &bull; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
