/**
 * Performance tier detection for adaptive rendering
 */

export type PerformanceTier = 'high' | 'medium' | 'low';

export interface PerformanceConfig {
  tier: PerformanceTier;
  starCount: number;
  pixelRatio: number;
  animationSpeed: number;
  enableParticles: boolean;
  enableStarRotation: boolean;
}

/**
 * Detect hardware capabilities and user preferences
 */
export function detectPerformanceTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'medium';
  
  // Check for reduced motion preference (accessibility)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return 'low';
  
  // Get hardware info
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4; // GB
  
  // Tier classification
  if (cores >= 8 && memory >= 8) {
    return 'high';
  } else if (cores >= 4 && memory >= 4) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Get performance configuration based on tier
 */
export function getPerformanceConfig(tier: PerformanceTier): PerformanceConfig {
  switch (tier) {
    case 'high':
      return {
        tier,
        starCount: 2600, // denser galaxy for desktop
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        animationSpeed: 1.0,
        enableParticles: true,
        enableStarRotation: true,
      };
    
    case 'medium':
      return {
        tier,
        starCount: 1400,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        animationSpeed: 0.7,
        enableParticles: true,
        enableStarRotation: true,
      };
    
    case 'low':
      return {
        tier,
        starCount: 520,
        pixelRatio: 1,
        animationSpeed: 0.4,
        enableParticles: false,
        enableStarRotation: false,
      };
  }
}

/**
 * FPS monitor for auto-degradation
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();
  private readonly maxSamples = 60;
  
  update(): number {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    const fps = 1000 / delta;
    this.frames.push(fps);
    
    if (this.frames.length > this.maxSamples) {
      this.frames.shift();
    }
    
    return fps;
  }
  
  getAverageFPS(): number {
    if (this.frames.length === 0) return 60;
    return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
  }
  
  shouldDegrade(threshold = 30): boolean {
    return this.getAverageFPS() < threshold && this.frames.length >= 30;
  }
}
