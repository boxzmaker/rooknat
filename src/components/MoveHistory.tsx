import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { History } from 'lucide-react';

const MoveHistory: React.FC = () => {
  const { gameState } = useGameStore();
  
  // Format moves in pairs (White's move, Black's move)
  const formatMoves = () => {
    const formattedMoves = [];
    const { history } = gameState;
    
    for (let i = 0; i < history.length; i += 2) {
      formattedMoves.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: history[i],
        black: i + 1 < history.length ? history[i + 1] : null
      });
    }
    
    return formattedMoves;
  };
  
  const moves = formatMoves();
  
  if (moves.length === 0) {
    return (
      <div className="p-4 bg-slate-800 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <History size={18} className="text-orange-500" />
          <h3 className="font-heading text-lg">Move History</h3>
        </div>
        <p className="text-slate-400 text-sm italic">No moves yet</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-slate-800 rounded-lg mb-4 max-h-80 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <History size={18} className="text-orange-500" />
        <h3 className="font-heading text-lg">Move History</h3>
      </div>
      
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 text-sm">
        <div className="font-medium text-slate-400">#</div>
        <div className="font-medium text-slate-400">White</div>
        <div className="font-medium text-slate-400">Black</div>
        
        {moves.map((move) => (
          <React.Fragment key={move.moveNumber}>
            <div className="text-slate-500">{move.moveNumber}.</div>
            <div className="font-mono">{move.white}</div>
            <div className="font-mono">{move.black || ''}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MoveHistory;