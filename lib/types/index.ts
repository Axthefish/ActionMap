// Core Blueprint Types
export interface PathSegment {
  segment_id: string;
  stage_name: string;
}

export interface MilestoneNodeContent {
  core_objective: string;
  key_signals: string[];
}

export interface MilestoneNode {
  label: string;
  position_on_path: number; // 0.0 to 1.0
  content: MilestoneNodeContent;
}

export interface BlueprintDefinition {
  main_path: PathSegment[];
  milestone_nodes: MilestoneNode[];
}

// Session State
export interface SessionState {
  session_id: string;
  blueprint_definition: BlueprintDefinition;
  current_position: number; // 0.0 to 1.0
  active_cycle_index: number;
  last_assessment_narrative: string | null;
}

// Action Lines
export interface ActionLine {
  line_id: string;
  label: string;
  style: 'suggestion' | 'urgent' | 'experimental';
  content: string;
}

// Visual Engine Commands
export interface CreateBlueprintPayload {
  blueprint_definition: BlueprintDefinition;
  initial_hypothesis: {
    suggested_stage_name: string;
    suggested_position_on_path: number;
  };
}

export interface UpdateBlueprintPayload {
  new_arrow_position: number;
  new_action_lines_to_draw: ActionLine[];
}

export interface VisualEngineCommand {
  action: 'CREATE_BLUEPRINT' | 'UPDATE_BLUEPRINT';
  payload: CreateBlueprintPayload | UpdateBlueprintPayload;
}

// API Request/Response Types
export interface InitRequest {
  userGoal: string;
}

export interface InitResponse {
  visual_engine_commands: {
    action: 'CREATE_BLUEPRINT';
    payload: CreateBlueprintPayload;
  };
  narrative: string;
  session_id: string;
}

export interface CalibrateRequest {
  session_id: string;
  calibration_feedback: string;
}

export interface CalibrateResponse {
  visual_engine_commands: {
    action: 'UPDATE_BLUEPRINT';
    payload: UpdateBlueprintPayload;
  };
  narrative: string;
}

export interface CycleRequest {
  session_id: string;
  user_observations: string;
}

export interface CycleResponse {
  visual_engine_commands: {
    action: 'UPDATE_BLUEPRINT';
    payload: UpdateBlueprintPayload;
  };
  narrative: string;
}

// UI State Types
export interface InfoCardData {
  label: string;
  content: MilestoneNodeContent;
  position: [number, number, number];
}

export interface SelectedActionLine extends ActionLine {
  isSelected: boolean;
}

