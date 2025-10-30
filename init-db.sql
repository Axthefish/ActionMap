-- ActionMap Database Schema Initialization
-- Run this SQL in your Vercel Postgres database

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  current_position REAL DEFAULT 0.0 NOT NULL,
  active_cycle_index INTEGER DEFAULT 0 NOT NULL,
  last_assessment_narrative TEXT,
  blueprint_id TEXT
);

-- Create blueprints table
CREATE TABLE IF NOT EXISTS blueprints (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  main_path JSONB NOT NULL,
  milestone_nodes JSONB NOT NULL,
  initial_hypothesis JSONB
);

-- Create action_cycles table
CREATE TABLE IF NOT EXISTS action_cycles (
  id SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id) NOT NULL,
  cycle_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_observations TEXT NOT NULL,
  assessment_narrative TEXT NOT NULL,
  previous_position REAL NOT NULL,
  new_position REAL NOT NULL,
  action_lines JSONB NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_blueprint_id ON sessions(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_session_id ON blueprints(session_id);
CREATE INDEX IF NOT EXISTS idx_action_cycles_session_id ON action_cycles(session_id);

