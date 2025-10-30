import { pgTable, text, timestamp, real, jsonb, serial, integer } from 'drizzle-orm/pg-core';

// Sessions table - stores the overall session state
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  currentPosition: real('current_position').notNull().default(0.0),
  activeCycleIndex: integer('active_cycle_index').notNull().default(0),
  lastAssessmentNarrative: text('last_assessment_narrative'),
  blueprintId: text('blueprint_id'),
});

// Blueprints table - stores the blueprint definition
export const blueprints = pgTable('blueprints', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  mainPath: jsonb('main_path').notNull(), // Array of segments
  milestoneNodes: jsonb('milestone_nodes').notNull(), // Array of milestone node objects
  initialHypothesis: jsonb('initial_hypothesis'), // Initial position hypothesis
});

// Action cycles table - stores each strategic cycle record
export const actionCycles = pgTable('action_cycles', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id).notNull(),
  cycleIndex: integer('cycle_index').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userObservations: text('user_observations').notNull(),
  assessmentNarrative: text('assessment_narrative').notNull(),
  previousPosition: real('previous_position').notNull(),
  newPosition: real('new_position').notNull(),
  actionLines: jsonb('action_lines').notNull(), // Array of action line objects
});

// Type exports for TypeScript
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type Blueprint = typeof blueprints.$inferSelect;
export type InsertBlueprint = typeof blueprints.$inferInsert;
export type ActionCycle = typeof actionCycles.$inferSelect;
export type InsertActionCycle = typeof actionCycles.$inferInsert;
