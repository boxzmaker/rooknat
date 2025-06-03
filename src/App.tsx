import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGameStore } from './store/useGameStore';
import ChessBoard from './components/ChessBoard';
import GameControls from './components/GameControls';
import MoveHistory from './components/MoveHistory';
import DialogBox from './components/DialogBox';
import ApiKeyForm from './components/ApiKeyForm';
import ModelSelector from './components/ModelSelector';
import { Crown } from 'lucide-react';

function App() {
  const { gameState, apiKey, startNewGame, pendingMove } = useGameStore();

  // Show a toast when API key is missing and game starts
  useEffect(() => {
    if (gameState.status === 'playing' && !apiKey && !pendingMove) {
      toast.warning('Please enter your OpenRouter API key to use AI features.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  }, [gameState.status, apiKey, pendingMove]);

  // Start a new game when the component mounts
  useEffect(() => {
    if (gameState.status === 'waiting') {
      startNewGame();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-200">
      <ToastContainer 
        position="top-right"
        theme="dark"
      />
      
      <header className="py-4 px-6 border-b border-slate-700">
        <div className="container mx-auto flex justify-center items-center">
          <Crown className="text-orange-500 mr-2" size={32} />
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-center text-orange-500">
            RookNet
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Controls and settings */}
          <div className="lg:col-span-1 space-y-4">
            <div className="mb-4">
              <h2 className="font-heading text-2xl mb-4">Game Setup</h2>
              <ApiKeyForm />
              <ModelSelector color="b" />
              <ModelSelector color="w" />
            </div>
            
            <GameControls />
            
            <div className="lg:hidden">
              <MoveHistory />
            </div>
          </div>
          
          {/* Center column - Chess Board */}
          <div className="lg:col-span-1 flex flex-col items-center justify-start">
            <h2 className="font-heading text-2xl mb-4">Chess Board</h2>
            <ChessBoard />
            <p className="mt-4 text-center text-sm text-slate-400">
              {gameState.status === 'playing' && !pendingMove && (
                gameState.turn === 'w' 
                  ? "White's turn to move" 
                  : "Black's turn to move"
              )}
              {pendingMove && "AI is thinking..."}
            </p>
          </div>
          
          {/* Right column - Game Info */}
          <div className="lg:col-span-1">
            <h2 className="font-heading text-2xl mb-4">Game Information</h2>
            
            <div className="hidden lg:block">
              <MoveHistory />
            </div>
            
            <DialogBox />
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-slate-400 text-sm border-t border-slate-700">
        <div className="container mx-auto">
          <p>RookNet Chess Game &copy; 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;