
export type GameStatus = 'IDLE' | 'PLAYING' | 'GAMEOVER';

export interface Question {
  text: string;
  answer: number;
  difficulty: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  timeLeft: number;
  currentQuestion: Question | null;
  gameOverReason: string;
  aiMessage: string;
}
