import { nanoid } from 'nanoid';

// Generate unique session ID
export function generateSessionId(): string {
  return nanoid();
}

// Generate unique blueprint ID
export function generateBlueprintId(): string {
  return nanoid();
}

// Easing functions for animations
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

