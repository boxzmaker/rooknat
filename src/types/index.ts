export interface ChessPiece {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
}

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface SquareStyles {
  [key: string]: React.CSSProperties;
}

export interface GameState {
  fen: string;
  history: string[];
  status: GameStatus;
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  moveCount: number;
}

export type GameStatus = 'waiting' | 'playing' | 'ended';

export type GameMode = 'playerVsAi' | 'aiVsAi';

export type ModelType = 'mistralai/devstral-small:free' | 'deepseek/deepseek-prover-v2:free' | 'meta-llama/llama-3.3-8b-instruct:free';

export interface AIPlayer {
  color: 'w' | 'b';
  model: ModelType;
  name: string;
}

export interface DialogMessage {
  id: string;
  sender: 'white' | 'black' | 'system';
  content: string;
  timestamp: Date;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}