import { GoogleGenAI } from '@google/genai';
import { PROMPT_1_INITIALIZE, PROMPT_2_STRATEGY_CYCLE } from './prompts';
import { InitResponse, CalibrateResponse, CycleResponse, SessionState } from './types';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = 'gemini-2.5-flash-lite-preview-09-2025';

// Cache management
let currentCache: { name: string; sessionId: string } | null = null;

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

// Create or update cache for session state
async function getOrCreateCache(sessionState: SessionState): Promise<string | undefined> {
  try {
    // Check if we already have a cache for this session
    if (currentCache && currentCache.sessionId === sessionState.session_id) {
      console.log('[AI Cache] Using existing cache:', currentCache.name);
      return currentCache.name;
    }
    
    // Create new cache with session state
    const sessionStateJson = JSON.stringify(sessionState, null, 2);
    
    // Only cache if content is large enough (minimum 1024 tokens for 2.5 Flash)
    // Rough estimate: 1 token ≈ 4 characters
    if (sessionStateJson.length < 4096) {
      console.log('[AI Cache] Content too small for explicit caching, using implicit cache');
      return undefined;
    }
    
    console.log('[AI Cache] Creating explicit cache for session:', sessionState.session_id);
    
    const cache = await ai.caches.create({
      model: MODEL_NAME,
      config: {
        displayName: `session-${sessionState.session_id}-cycle-${sessionState.active_cycle_index}`,
        contents: `# CURRENT SESSION STATE (Cached Context):\n${sessionStateJson}`,
        ttl: '3600s', // 1 hour
      },
    });
    
    if (!cache.name) {
      console.log('[AI Cache] Cache created but no name returned, falling back to implicit cache');
      return undefined;
    }
    
    currentCache = {
      name: cache.name,
      sessionId: sessionState.session_id,
    };
    
    console.log('[AI Cache] Cache created:', cache.name);
    return cache.name;
  } catch (error) {
    console.error('[AI Cache] Failed to create cache, falling back to implicit caching:', error);
    return undefined;
  }
}

// Generate initial blueprint (PROMPT 1)
export async function generateBlueprint(userGoal: string): Promise<Omit<InitResponse, 'session_id'>> {
  console.log('[AI] Generating blueprint for goal:', userGoal);
  
  const result = await parseJSONWithRetry<Omit<InitResponse, 'session_id'>>(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: PROMPT_1_INITIALIZE(userGoal),
      config: {
        temperature: 0.4, // Lower temperature for more deterministic JSON output
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

// Run strategy cycle (PROMPT 2) with caching
export async function runStrategyCycle(
  sessionState: SessionState,
  userInput: string,
  isFirstCycle: boolean
): Promise<Omit<CalibrateResponse | CycleResponse, 'session_id'>> {
  console.log('[AI] Running strategy cycle, first cycle:', isFirstCycle);
  
  // Try to use explicit cache
  const cacheName = await getOrCreateCache(sessionState);
  
  const result = await parseJSONWithRetry<Omit<CalibrateResponse | CycleResponse, 'session_id'>>(async () => {
    const promptContent = PROMPT_2_STRATEGY_CYCLE(sessionState, userInput, isFirstCycle);
    
    const config: any = {
      temperature: 0.4, // Lower temperature for more deterministic JSON output
    };
    
    // Use cached content if available
    if (cacheName) {
      config.cachedContent = cacheName;
      console.log('[AI] Using explicit cache for generation');
    }
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: promptContent,
      config,
    });
    
    if (!response.text) {
      throw new Error('No response text from AI');
    }
    
    // Log cache usage metadata if available
    if (response.usageMetadata) {
      console.log('[AI] Usage metadata:', {
        promptTokens: response.usageMetadata.promptTokenCount,
        cachedTokens: response.usageMetadata.cachedContentTokenCount,
        outputTokens: response.usageMetadata.candidatesTokenCount,
      });
    }
    
    return response.text;
  });
  
  console.log('[AI] Strategy cycle completed successfully');
  return result;
}

// Clean up cache when session ends
export async function cleanupCache(sessionId: string) {
  if (currentCache && currentCache.sessionId === sessionId) {
    try {
      await ai.caches.delete({ name: currentCache.name });
      console.log('[AI Cache] Deleted cache:', currentCache.name);
    } catch (error) {
      console.error('[AI Cache] Failed to delete cache:', error);
    }
    currentCache = null;
  }
}

// Error handling wrapper
export function handleAIError(error: unknown): never {
  console.error('[AI Error]', error);
  
  if (error instanceof Error) {
    throw new Error(`AI generation failed: ${error.message}`);
  }
  
  throw new Error('AI generation failed with unknown error');
}
