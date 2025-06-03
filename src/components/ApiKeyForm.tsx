import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Key } from 'lucide-react';

const ApiKeyForm: React.FC = () => {
  const { apiKey, setApiKey } = useGameStore();
  const [inputKey, setInputKey] = useState(apiKey);
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey);
  };

  return (
    <div className="mb-6 p-4 bg-slate-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Key size={18} className="text-orange-500" />
        <h3 className="font-heading text-lg">OpenRouter API Key</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type={isVisible ? "text" : "password"}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Enter your OpenRouter API key"
            className="form-input pr-24"
          />
          <button 
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
          >
            Save
          </button>
        </div>
        
        <p className="text-xs text-slate-400">
          Your API key is required for AI moves and dialogue. Get one at{' '}
          <a 
            href="https://openrouter.ai/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-orange-400 hover:underline"
          >
            openrouter.ai
          </a>
        </p>
      </form>
    </div>
  );
};

export default ApiKeyForm;