import { GoogleGenAI } from '@google/genai';
import { PROMPT_1_INITIALIZE, PROMPT_2_STRATEGY_CYCLE } from './prompts';
import { InitResponse, CalibrateResponse, CycleResponse, SessionState } from './types';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = 'gemini-2.5-flash-lite-preview-09-2025';

// Utility: Parse JSON with retry logic
async function parseJSONWithRetry<T>(
  promptFn: () => Promise<string>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await promptFn();
      
      // Try to extract JSON from the response
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        const match = jsonStr.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
        if (match) {
          jsonStr = match[1];
        }
      }
      
      const parsed = JSON.parse(jsonStr);
      return parsed as T;
    } catch (error) {
      console.error(`JSON parse attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to parse JSON after ${maxRetries} attempts: ${error}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Failed to parse JSON');
}

// Generate initial blueprint (PROMPT 1)
export async function generateBlueprint(userGoal: string): Promise<Omit<InitResponse, 'session_id'>> {
  console.log('[AI] Generating blueprint for goal:', userGoal);
  
  const result = await parseJSONWithRetry<Omit<InitResponse, 'session_id'>>(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: PROMPT_1_INITIALIZE(userGoal),
      config: {
        temperature: 0.7,
      },
    });
    
    if (!response.text) {
      throw new Error('No response text from AI');
    }
    
    return response.text;
  });
  
  console.log('[AI] Blueprint generated successfully');
  return result;
}

// Run strategy cycle (PROMPT 2)
export async function runStrategyCycle(
  sessionState: SessionState,
  userInput: string,
  isFirstCycle: boolean
): Promise<Omit<CalibrateResponse | CycleResponse, 'session_id'>> {
  console.log('[AI] Running strategy cycle, first cycle:', isFirstCycle);
  
  const result = await parseJSONWithRetry<Omit<CalibrateResponse | CycleResponse, 'session_id'>>(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: PROMPT_2_STRATEGY_CYCLE(sessionState, userInput, isFirstCycle),
      config: {
        temperature: 0.7,
      },
    });
    
    if (!response.text) {
      throw new Error('No response text from AI');
    }
    
    return response.text;
  });
  
  console.log('[AI] Strategy cycle completed successfully');
  return result;
}

// Error handling wrapper
export function handleAIError(error: unknown): never {
  console.error('[AI Error]', error);
  
  if (error instanceof Error) {
    throw new Error(`AI generation failed: ${error.message}`);
  }
  
  throw new Error('AI generation failed with unknown error');
}
