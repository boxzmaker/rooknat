import axios, { AxiosError } from 'axios';
import { ModelType, ChessMove, OpenRouterResponse } from '../types';
import { Chess } from 'chess.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper function to parse AI's response for a valid chess move and dialogue
const parseAiResponse = (content: string, chess: Chess): { move: ChessMove | null; dialogue: string | null } => {
  // Default result
  const result = { move: null, dialogue: null };
  
  // Try to find a SAN notation move in the content (e.g., e4, Nf3, O-O)
  const sanMovePattern = /\b([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[+#]?|O-O(?:-O)?[+#]?)\b/;
  const sanMatch = content.match(sanMovePattern);
  
  if (sanMatch && sanMatch[1]) {
    // Find any potential dialogue in the response
    // Anything that's not the chess move could be dialogue
    const movePart = sanMatch[1];
    const contentWithoutMove = content.replace(movePart, '').trim();
    
    if (contentWithoutMove) {
      result.dialogue = contentWithoutMove;
    }
    
    try {
      // Use the provided chess instance to validate and parse the move
      const moveObj = chess.move(movePart, { sloppy: true });
      if (moveObj) {
        // Undo the move since we're just validating
        chess.undo();
        
        result.move = {
          from: moveObj.from,
          to: moveObj.to,
          promotion: moveObj.promotion
        };
      }
    } catch (error) {
      console.error('Error parsing AI move:', error);
    }
  } else {
    // If no clear move is found, the entire response could be dialogue
    result.dialogue = content;
  }
  
  return result;
};

export const getAiMove = async (
  apiKey: string, 
  model: ModelType, 
  chess: Chess,
  color: 'w' | 'b',
  previousMove: string | null
): Promise<{ move: ChessMove | null; dialogue: string | null }> => {
  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  try {
    // Construct the prompt for the AI
    const colorName = color === 'w' ? 'White' : 'Black';
    let prompt = `You are playing chess as ${colorName}. Current board position in FEN: ${chess.fen()}.`;
    
    if (previousMove) {
      prompt += ` Your opponent's last move was: ${previousMove}.`;
    }
    
    prompt += ` What is your next legal chess move in SAN format (e.g., "e4", "Nf3", "O-O")? Also provide a brief commentary about the current position or your strategic thinking.`;

    // Make the API request
    const response = await axios.post<OpenRouterResponse>(
      OPENROUTER_API_URL,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI playing chess. Respond with a valid chess move in Standard Algebraic Notation (SAN) followed by a brief commentary, analysis, or trash talk.'
          },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the AI's response
    const content = response.data.choices[0]?.message?.content || '';
    
    // Parse the response to extract the move and dialogue
    return parseAiResponse(content, chess);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        throw new Error('OpenRouter API rate limit exceeded. Please wait a moment before making another move.');
      } else {
        const statusCode = axiosError.response?.status;
        const message = axiosError.response?.data?.error?.message || axiosError.message;
        throw new Error(`OpenRouter API error (${statusCode}): ${message}`);
      }
    }
    console.error('Error calling OpenRouter API:', error);
    throw new Error('Unexpected error while calling OpenRouter API');
  }
};