import React, { useState, useEffect } from 'react';
import Chessboard from 'chessboardjsx';
import { useGameStore } from '../store/useGameStore';
import { ChessMove, SquareStyles } from '../types';

const ChessBoard: React.FC = () => {
  const { 
    chess, gameState, gameMode, isPlayerTurn, makeMove 
  } = useGameStore();
  
  const [boardSize, setBoardSize] = useState(480);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [squareStyles, setSquareStyles] = useState<SquareStyles>({});
  
  // Resize board based on window size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBoardSize(Math.min(width - 32, 350));
      } else {
        setBoardSize(Math.min(width * 0.4, 480));
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate possible moves for the selected piece
  useEffect(() => {
    if (!selectedSquare) {
      setSquareStyles({});
      return;
    }
    
    const styles: SquareStyles = { [selectedSquare]: { backgroundColor: 'rgba(255, 170, 0, 0.3)' } };
    
    try {
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      
      if (moves.length > 0) {
        moves.forEach(move => {
          styles[move.to] = {
            background: 'radial-gradient(circle, rgba(0,128,0,0.3) 25%, transparent 25%)',
            cursor: 'pointer'
          };
        });
      }
      
      setSquareStyles(styles);
    } catch (error) {
      console.error('Error calculating moves:', error);
      setSquareStyles({});
    }
  }, [selectedSquare, chess]);
  
  const handleSquareClick = (square: string) => {
    // Only allow moves if it's the player's turn in Player vs AI mode
    if (gameMode === 'playerVsAi' && !isPlayerTurn) {
      return;
    }
    
    // If no square is selected, select this square if it has a piece
    if (!selectedSquare) {
      const piece = chess.get(square);
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
      }
      return;
    }
    
    // If the same square is clicked again, deselect it
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }
    
    // Try to move the piece
    try {
      const moveObj: ChessMove = {
        from: selectedSquare,
        to: square,
      };
      
      // Check if it's a pawn promotion
      const piece = chess.get(selectedSquare);
      if (
        piece && 
        piece.type === 'p' && 
        ((piece.color === 'w' && square[1] === '8') || 
         (piece.color === 'b' && square[1] === '1'))
      ) {
        moveObj.promotion = 'q'; // Auto-promote to queen
      }
      
      makeMove(moveObj);
      setSelectedSquare(null);
    } catch (error) {
      console.error('Invalid move:', error);
      
      // Check if the clicked square has a piece of the same color
      const piece = chess.get(square);
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    }
  };
  
  return (
    <div className="board-container mx-auto">
      <Chessboard
        position={gameState.fen}
        width={boardSize}
        onSquareClick={handleSquareClick}
        squareStyles={squareStyles}
        boardStyle={{
          borderRadius: '4px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          marginTop: '10px'
        }}
        lightSquareStyle={{ backgroundColor: 'rgb(var(--color-board-light))' }}
        darkSquareStyle={{ backgroundColor: 'rgb(var(--color-board-dark))' }}
        dropOffBoard="snapback"
        transitionDuration={300}
      />
    </div>
  );
};

export default ChessBoard;