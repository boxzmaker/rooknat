import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { ModelType } from '../types';
import { Bot } from 'lucide-react';

interface ModelSelectorProps {
  color: 'w' | 'b';
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ color }) => {
  const { 
    whiteAi, blackAi, setWhiteAiModel, setBlackAiModel, gameMode 
  } = useGameStore();

  const currentModel = color === 'w' ? whiteAi.model : blackAi.model;
  const setModel = color === 'w' ? setWhiteAiModel : setBlackAiModel;

  // Only show White AI model selector in AI vs AI mode
  if (gameMode === 'playerVsAi' && color === 'w') {
    return null;
  }

  const colorName = color === 'w' ? 'White' : 'Black';
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value as ModelType);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Bot size={18} className="text-orange-500" />
        <label className="font-heading text-slate-200">
          {colorName} AI Model
        </label>
      </div>
      <select 
        value={currentModel}
        onChange={handleChange}
        className="form-select"
      >
        <option value="mistralai/devstral-small:free">Mistral Devstral Small</option>
        <option value="deepseek/deepseek-prover-v2:free">Deepseek Prover v2</option>
        <option value="meta-llama/llama-3.3-8b-instruct:free">Llama 3.3 8B</option>
      </select>
    </div>
  );
};

export default ModelSelector;