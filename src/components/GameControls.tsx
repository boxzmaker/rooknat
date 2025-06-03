import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Play, Pause, RotateCw, UserRound, Bot } from 'lucide-react';

const GameControls: React.FC = () => {
  const { 
    gameState, gameMode, setGameMode, 
    startNewGame, aiVsAiPaused, toggleAiVsAiPaused,
    aiVsAiSpeed, setAiVsAiSpeed, pendingMove
  } = useGameStore();
  
  const handleGameModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGameMode(e.target.value as 'playerVsAi' | 'aiVsAi');
  };
  
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiVsAiSpeed(Number(e.target.value));
  };
  
  const getMoveSpeedLabel = (speed: number) => {
    if (speed <= 500) return 'Fast';
    if (speed <= 1500) return 'Normal';
    if (speed <= 3000) return 'Slow';
    return 'Very Slow';
  };
  
  return (
    <div className="space-y-4 mb-4 p-4 bg-slate-800 rounded-lg">
      <div>
        <h3 className="font-heading text-lg mb-2">Game Settings</h3>
        
        <div className="mb-3">
          <label className="block mb-1 text-sm">Game Mode</label>
          <div className="flex gap-3">
            <button 
              onClick={() => setGameMode('playerVsAi')}
              className={`btn flex-1 flex justify-center items-center gap-2 ${
                gameMode === 'playerVsAi' 
                  ? 'btn-primary' 
                  : 'btn-secondary'
              }`}
            >
              <UserRound size={16} />
              <span>Player vs AI</span>
            </button>
            
            <button 
              onClick={() => setGameMode('aiVsAi')}
              className={`btn flex-1 flex justify-center items-center gap-2 ${
                gameMode === 'aiVsAi' 
                  ? 'btn-primary' 
                  : 'btn-secondary'
              }`}
            >
              <Bot size={16} />
              <span>AI vs AI</span>
            </button>
          </div>
        </div>
        
        {gameMode === 'aiVsAi' && (
          <div className="mb-3">
            <label className="block mb-1 text-sm">Move Speed: {getMoveSpeedLabel(aiVsAiSpeed)}</label>
            <input 
              type="range" 
              min="300" 
              max="5000" 
              step="100" 
              value={aiVsAiSpeed}
              onChange={handleSpeedChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={startNewGame}
            className="btn btn-primary flex-1 flex justify-center items-center gap-2"
          >
            <RotateCw size={16} />
            <span>New Game</span>
          </button>
          
          {gameMode === 'aiVsAi' && gameState.status === 'playing' && (
            <button
              onClick={toggleAiVsAiPaused}
              disabled={pendingMove}
              className={`btn flex-1 flex justify-center items-center gap-2 ${
                aiVsAiPaused 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-amber-600 hover:bg-amber-700'
              } text-white`}
            >
              {aiVsAiPaused ? (
                <>
                  <Play size={16} />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause size={16} />
                  <span>Pause</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="font-heading text-lg mb-1">Game Status</h3>
        <div className="p-2 bg-slate-700 rounded text-sm">
          {gameState.status === 'waiting' && <p>Ready to start a new game</p>}
          
          {gameState.status === 'playing' && (
            <div>
              <p>
                Turn: <span className="font-bold">{gameState.turn === 'w' ? 'White' : 'Black'}</span>
                {pendingMove && <span className="ml-2 text-orange-400">(thinking...)</span>}
              </p>
              {gameState.isCheck && <p className="text-red-400">Check!</p>}
            </div>
          )}
          
          {gameState.status === 'ended' && (
            <div className="text-orange-400 font-bold">
              {gameState.isCheckmate && (
                <p>Checkmate! {gameState.turn === 'w' ? 'Black' : 'White'} wins!</p>
              )}
              {gameState.isDraw && <p>Draw!</p>}
              {gameState.isStalemate && <p>Stalemate! Game is a draw.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameControls;