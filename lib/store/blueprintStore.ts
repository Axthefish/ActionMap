import { create } from 'zustand';
import {
  BlueprintDefinition,
  ActionLine,
  InfoCardData,
  SessionState,
} from '@/lib/types';

interface BlueprintStore {
  // Session data
  sessionId: string | null;
  sessionState: SessionState | null;
  
  // Blueprint structure
  blueprintDefinition: BlueprintDefinition | null;
  
  // Dynamic state
  currentPosition: number;
  activeCycleIndex: number;
  actionLines: ActionLine[];
  
  // UI state
  isLoading: boolean;
  narrative: string;
  selectedActionLineId: string | null;
  infoCardData: InfoCardData | null;
  
  // Actions
  setSessionId: (id: string) => void;
  setSessionState: (state: SessionState) => void;
  setBlueprintDefinition: (definition: BlueprintDefinition) => void;
  updatePosition: (position: number) => void;
  setActionLines: (lines: ActionLine[]) => void;
  setIsLoading: (loading: boolean) => void;
  setNarrative: (text: string) => void;
  setSelectedActionLineId: (id: string | null) => void;
  setInfoCardData: (data: InfoCardData | null) => void;
  incrementCycleIndex: () => void;
  resetSession: () => void;
}

export const useBlueprintStore = create<BlueprintStore>((set) => ({
  // Initial state
  sessionId: null,
  sessionState: null,
  blueprintDefinition: null,
  currentPosition: 0.0,
  activeCycleIndex: 0,
  actionLines: [],
  isLoading: false,
  narrative: '',
  selectedActionLineId: null,
  infoCardData: null,
  
  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  
  setSessionState: (state) => set({
    sessionState: state,
    blueprintDefinition: state.blueprint_definition,
    currentPosition: state.current_position,
    activeCycleIndex: state.active_cycle_index,
  }),
  
  setBlueprintDefinition: (definition) => set({ blueprintDefinition: definition }),
  
  updatePosition: (position) => set({ currentPosition: position }),
  
  setActionLines: (lines) => set({ actionLines: lines }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setNarrative: (text) => set({ narrative: text }),
  
  setSelectedActionLineId: (id) => set({ selectedActionLineId: id }),
  
  setInfoCardData: (data) => set({ infoCardData: data }),
  
  incrementCycleIndex: () => set((state) => ({ 
    activeCycleIndex: state.activeCycleIndex + 1 
  })),
  
  resetSession: () => set({
    sessionId: null,
    sessionState: null,
    blueprintDefinition: null,
    currentPosition: 0.0,
    activeCycleIndex: 0,
    actionLines: [],
    isLoading: false,
    narrative: '',
    selectedActionLineId: null,
    infoCardData: null,
  }),
}));

