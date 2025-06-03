import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { MessageSquare } from 'lucide-react';

const DialogBox: React.FC = () => {
  const { dialogHistory } = useGameStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dialogHistory]);
  
  // Format timestamp to a readable string
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg mb-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare size={18} className="text-orange-500" />
        <h3 className="font-heading text-lg">Game Dialogue</h3>
      </div>
      
      <div className="h-72 overflow-y-auto pr-2">
        {dialogHistory.length === 0 ? (
          <div className="text-slate-400 text-sm italic">
            AI dialogue will appear here during the game.
          </div>
        ) : (
          <div className="space-y-2">
            {dialogHistory.map((message) => (
              <div 
                key={message.id} 
                className={`message fade-in ${
                  message.sender === 'system' 
                    ? 'bg-slate-600 text-slate-200' 
                    : message.sender === 'white' 
                      ? 'message-ai bg-orange-900/30' 
                      : 'message-ai bg-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm">
                    {message.sender === 'white' 
                      ? 'White AI' 
                      : message.sender === 'black' 
                        ? 'Black AI' 
                        : 'System'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogBox;