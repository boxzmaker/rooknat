import { create } from 'zustand';
import { Chess } from 'chess.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameMode, GameState, AIPlayer, ModelType, DialogMessage, ChessMove 
} from '../types';
import { getAiMove } from '../services/openRouterService';

interface GameStore {
  // Game state
  chess: Chess;
  gameState: GameState;
  gameMode: GameMode;
  isPlayerTurn: boolean;
  pendingMove: boolean;
  
  // AI configuration
  apiKey: string;
  whiteAi: AIPlayer;
  blackAi: AIPlayer;
  
  // AI vs AI settings
  aiVsAiSpeed: number;
  aiVsAiPaused: boolean;
  
  // Dialog
  dialogHistory: DialogMessage[];
  
  // Actions
  setApiKey: (key: string) => void;
  setGameMode: (mode: GameMode) => void;
  setWhiteAiModel: (model: ModelType) => void;
  setBlackAiModel: (model: ModelType) => void;
  startNewGame: () => void;
  makeMove: (move: ChessMove) => Promise<void>;
  requestAiMove: () => Promise<void>;
  addDialogMessage: (sender: 'white' | 'black' | 'system', content: string) => void;
  setAiVsAiSpeed: (speed: number) => void;
  toggleAiVsAiPaused: () => void;
  resetGame: () => void;
}

const DEFAULT_WHITE_AI: AIPlayer = {
  color: 'w',
  model: 'meta-llama/llama-3.3-8b-instruct:free',
  name: 'White AI'
};

const DEFAULT_BLACK_AI: AIPlayer = {
  color: 'b',
  model: 'mistralai/devstral-small:free',
  name: 'Black AI'
};

const getDefaultGameState = (): GameState => ({
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  history: [],
  status: 'waiting',
  turn: 'w',
  isCheck: false,
  isCheckmate: false,
  isDraw: false,
  isStalemate: false,
  moveCount: 0
});

export const useGameStore = create<GameStore>((set, get) => ({
  // Initialize state
  chess: new Chess(),
  gameState: getDefaultGameState(),
  gameMode: 'playerVsAi',
  isPlayerTurn: true,
  pendingMove: false,
  
  apiKey: '',
  whiteAi: DEFAULT_WHITE_AI,
  blackAi: DEFAULT_BLACK_AI,
  
  aiVsAiSpeed: 1500, // ms between moves
  aiVsAiPaused: false,
  
  dialogHistory: [],
  
  setApiKey: (key: string) => set({ apiKey: key }),
  
  setGameMode: (mode: GameMode) => set({ 
    gameMode: mode, 
    isPlayerTurn: mode === 'playerVsAi' && get().gameState.turn === 'w'
  }),
  
  setWhiteAiModel: (model: ModelType) => set({ 
    whiteAi: { ...get().whiteAi, model } 
  }),
  
  setBlackAiModel: (model: ModelType) => set({ 
    blackAi: { ...get().blackAi, model } 
  }),
  
  startNewGame: () => {
    const chess = new Chess();
    set({ 
      chess,
      gameState: {
        ...getDefaultGameState(),
        status: 'playing',
      },
      dialogHistory: [],
      pendingMove: false,
      isPlayerTurn: get().gameMode === 'playerVsAi',
    });
    
    // If AI vs AI, start with white's move
    if (get().gameMode === 'aiVsAi' && !get().aiVsAiPaused) {
      setTimeout(() => {
        get().requestAiMove();
      }, 1000);
    }
  },
  
  makeMove: async (move: ChessMove) => {
    const { chess, gameState, gameMode } = get();
    
    try {
      // Attempt the move
      const result = chess.move(move);
      if (!result) return;
      
      // Update game state
      const updatedGameState = {
        ...gameState,
        fen: chess.fen(),
        history: [...gameState.history, result.san],
        turn: chess.turn() as 'w' | 'b',
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw(),
        isStalemate: chess.isStalemate(),
        status: chess.isGameOver() ? 'ended' : 'playing',
        moveCount: gameState.moveCount + 1
      };
      
      const currentColor = updatedGameState.turn === 'w' ? 'b' : 'w';
      const isPlayerColor = gameMode === 'playerVsAi' && currentColor === 'w';
      
      set({ 
        gameState: updatedGameState,
        isPlayerTurn: isPlayerColor,
      });
      
      // If game is over, add a system message
      if (updatedGameState.status === 'ended') {
        let resultMessage = "Game over! ";
        if (updatedGameState.isCheckmate) {
          resultMessage += `${currentColor === 'w' ? 'Black' : 'White'} wins by checkmate!`;
        } else if (updatedGameState.isDraw) {
          resultMessage += "The game is a draw.";
        } else if (updatedGameState.isStalemate) {
          resultMessage += "The game is a draw by stalemate.";
        }
        get().addDialogMessage('system', resultMessage);
        return;
      }
      
      // If it's AI's turn next in player vs AI mode, or it's AI vs AI mode
      if ((gameMode === 'playerVsAi' && !isPlayerColor) || gameMode === 'aiVsAi') {
        if (gameMode === 'aiVsAi' && !get().aiVsAiPaused) {
          setTimeout(() => {
            get().requestAiMove();
          }, get().aiVsAiSpeed);
        } else if (gameMode === 'playerVsAi') {
          get().requestAiMove();
        }
      }
      
    } catch (error) {
      console.error('Invalid move:', error);
    }
  },
  
  requestAiMove: async () => {
    const { chess, gameState, apiKey, whiteAi, blackAi, pendingMove } = get();
    
    // Don't request move if already pending or game ended
    if (pendingMove || gameState.status === 'ended') return;

    // Check if API key is present
    if (!apiKey) {
      get().addDialogMessage('system', 'Please enter your OpenRouter API key in the settings to enable AI moves.');
      return;
    }
    
    set({ pendingMove: true });
    
    const currentTurn = gameState.turn;
    const currentModel = currentTurn === 'w' ? whiteAi.model : blackAi.model;
    
    try {
      // Get previous move for context
      const previousMove = gameState.history.length > 0 
        ? gameState.history[gameState.history.length - 1] 
        : null;
      
      const { move, dialogue } = await getAiMove(
        apiKey,
        currentModel,
        chess,
        currentTurn,
        previousMove
      );
      
      // Add the AI's dialogue
      if (dialogue) {
        get().addDialogMessage(
          currentTurn === 'w' ? 'white' : 'black',
          dialogue
        );
      }
      
      // Make the AI's move
      if (move) {
        await get().makeMove(move);
      } else {
        throw new Error('Invalid or no move returned from AI');
      }
      
    } catch (error) {
      console.error('Error getting AI move:', error);
      get().addDialogMessage('system', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      set({ pendingMove: false });
    }
  },
  
  addDialogMessage: (sender, content) => set(state => ({
    dialogHistory: [
      ...state.dialogHistory,
      {
        id: uuidv4(),
        sender,
        content,
        timestamp: new Date()
      }
    ]
  })),
  
  setAiVsAiSpeed: (speed) => set({ aiVsAiSpeed: speed }),
  
  toggleAiVsAiPaused: () => {
    const { aiVsAiPaused, gameState, gameMode } = get();
    const newPausedState = !aiVsAiPaused;
    
    set({ aiVsAiPaused: newPausedState });
    
    // If unpausing, and it's AI vs AI mode, and the game is not over
    if (!newPausedState && gameMode === 'aiVsAi' && gameState.status === 'playing') {
      get().requestAiMove();
    }
  },
  
  resetGame: () => {
    set({
      chess: new Chess(),
      gameState: getDefaultGameState(),
      dialogHistory: [],
      pendingMove: false,
      isPlayerTurn: true
    });
  }
}));