'use client';

import { useEffect, useRef } from 'react';
import { detectPerformanceTier, getPerformanceConfig } from '@/lib/performance';

interface Star {
  // Static color/appearance
  z: number; // 1 (far), 2 (mid), 3 (near)
  size: number;
  opacity: number;
  baseOpacity: number; // for twinkling
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  // Galaxy-band motion (in a frame rotated -45deg)
  u0: number; // initial longitudinal coord (px)
  bandOffset: number; // transverse offset (px)
  bandSpeed: number; // px/sec along band
  curveAmp: number; // amplitude of arc (px)
  curveFreq: number; // radians per px
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rotationRef = useRef(0);
  const isVisibleRef = useRef(true);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Detect performance tier
    const tier = detectPerformanceTier();
    const config = getPerformanceConfig(tier);
    
    // Setup canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * config.pixelRatio;
      canvas.height = window.innerHeight * config.pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(config.pixelRatio, config.pixelRatio);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Star color palette - realistic star colors
    const starColors = [
      'rgba(255, 255, 255, 1)',      // White (most common)
      'rgba(255, 255, 255, 1)',      // White
      'rgba(255, 255, 255, 1)',      // White
      'rgba(245, 245, 255, 1)',      // Cool white
      'rgba(255, 248, 240, 1)',      // Warm white
      'rgba(200, 220, 255, 1)',      // Blue tint
      'rgba(255, 240, 220, 1)',      // Yellow tint
    ];
    
    // Initialize stars with three depth layers
    const initStars = () => {
      starsRef.current = [];
      const starCounts = {
        far: Math.floor(config.starCount * 0.5),    // 50% far
        mid: Math.floor(config.starCount * 0.3),    // 30% mid
        near: Math.floor(config.starCount * 0.2),   // 20% near
      };
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const bandWidth = Math.max(canvas.width, canvas.height);
      
      // Far stars (smallest, slowest, dimmest)
      for (let i = 0; i < starCounts.far; i++) {
        const baseOpacity = Math.random() * 0.3 + 0.2;
        starsRef.current.push({
          z: 1,
          size: Math.random() * 1.0 + 0.5,
          opacity: baseOpacity,
          baseOpacity,
          twinkleSpeed: Math.random() * 0.8 + 0.4,
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          u0: (Math.random() - 0.5) * bandWidth * 2,
          bandOffset: (Math.random() - 0.5) * (canvas.height * 0.3),
          bandSpeed: 20 + Math.random() * 20,
          curveAmp: 20 + Math.random() * 20,
          curveFreq: 0.01 + Math.random() * 0.02,
        });
      }

      // Add scattered stars on both sides but moving with same direction
      const addScattered = (count: number, z: number) => {
        for (let i = 0; i < count; i++) {
          const baseOpacity = Math.random() * 0.25 + 0.15;
          starsRef.current.push({
            z,
            size: (z === 3 ? (Math.random() * 1.6 + 0.8) : (Math.random() * 1.0 + 0.4)),
            opacity: baseOpacity,
            baseOpacity,
            twinkleSpeed: Math.random() * 1.0 + 0.4,
            twinklePhase: Math.random() * Math.PI * 2,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            u0: (Math.random() - 0.5) * bandWidth * 2.5,
            bandOffset: (Math.random() - 0.5) * (canvas.height * 0.6),
            bandSpeed: 30 + Math.random() * 30,
            curveAmp: 16 + Math.random() * 24,
            curveFreq: 0.01 + Math.random() * 0.02,
          });
        }
      };

      addScattered(Math.floor(starCounts.far * 0.15), 1);
      addScattered(Math.floor(starCounts.mid * 0.15), 2);
      addScattered(Math.floor(starCounts.near * 0.15), 3);

      // Corner clusters: top-right and bottom-left with same flow direction
      const addCornerCluster = (count: number, sign: 1 | -1, z: number) => {
        for (let i = 0; i < count; i++) {
          const baseOpacity = Math.random() * 0.35 + 0.25;
          starsRef.current.push({
            z,
            size: Math.random() * (z === 3 ? 2.0 : 1.4) + (z === 3 ? 1.0 : 0.6),
            opacity: baseOpacity,
            baseOpacity,
            twinkleSpeed: Math.random() * 1.2 + 0.5,
            twinklePhase: Math.random() * Math.PI * 2,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            // u0 biased near extremes to emphasize corners
            u0: (sign * (bandWidth * (1.2 + Math.random() * 0.6))),
            bandOffset: (Math.random() - 0.5) * (canvas.height * 0.25),
            bandSpeed: 40 + Math.random() * 25,
            curveAmp: 20 + Math.random() * 24,
            curveFreq: 0.012 + Math.random() * 0.02,
          });
        }
      };

      addCornerCluster(Math.floor(starCounts.mid * 0.12), +1, 2); // top-right more dense
      addCornerCluster(Math.floor(starCounts.mid * 0.12), -1, 2); // bottom-left more dense

      // Side bands near left/right edges to avoid emptiness
      const addSideBand = (side: 'left' | 'right', count: number) => {
        const sideSign = side === 'left' ? -1 : 1;
        for (let i = 0; i < count; i++) {
          const z = [1,2,3][Math.floor(Math.random()*3)] as 1|2|3;
          const baseOpacity = Math.random() * 0.3 + 0.2;
          starsRef.current.push({
            z,
            size: (z === 3 ? Math.random() * 1.6 + 0.8 : Math.random() * 1.2 + 0.6),
            opacity: baseOpacity,
            baseOpacity,
            twinkleSpeed: Math.random() * 1.0 + 0.5,
            twinklePhase: Math.random() * Math.PI * 2,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            u0: sideSign * (bandWidth * (0.9 + Math.random() * 0.3)),
            bandOffset: (Math.random() - 0.5) * (canvas.height * 0.8),
            bandSpeed: 35 + Math.random() * 30,
            curveAmp: 18 + Math.random() * 26,
            curveFreq: 0.012 + Math.random() * 0.02,
          });
        }
      };

      addSideBand('left', Math.floor(config.starCount * 0.08));
      addSideBand('right', Math.floor(config.starCount * 0.08));
      
      // Mid stars
      for (let i = 0; i < starCounts.mid; i++) {
        const baseOpacity = Math.random() * 0.4 + 0.35;
        starsRef.current.push({
          z: 2,
          size: Math.random() * 1.6 + 0.9,
          opacity: baseOpacity,
          baseOpacity,
          twinkleSpeed: Math.random() * 1.0 + 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          u0: (Math.random() - 0.5) * bandWidth * 2,
          bandOffset: (Math.random() - 0.5) * (canvas.height * 0.35),
          bandSpeed: 35 + Math.random() * 25,
          curveAmp: 26 + Math.random() * 28,
          curveFreq: 0.012 + Math.random() * 0.025,
        });
      }
      
      // Near stars (largest, fastest, brightest) - fewer of these
      for (let i = 0; i < starCounts.near; i++) {
        const baseOpacity = Math.random() * 0.5 + 0.5;
        starsRef.current.push({
          z: 3,
          size: Math.random() * 2.0 + 1.2,
          opacity: baseOpacity,
          baseOpacity,
          twinkleSpeed: Math.random() * 1.5 + 0.8,
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          u0: (Math.random() - 0.5) * bandWidth * 2,
          bandOffset: (Math.random() - 0.5) * (canvas.height * 0.4),
          bandSpeed: 50 + Math.random() * 30,
          curveAmp: 32 + Math.random() * 32,
          curveFreq: 0.015 + Math.random() * 0.03,
        });
      }
    };
    
    initStars();
    
    // Visibility detection
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Animation loop
    const animate = () => {
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Clear canvas
      ctx.fillStyle = 'hsl(0, 0%, 7%)'; // Match background color
      ctx.fillRect(0, 0, width, height);
      
      rotationRef.current += 0.03 * config.animationSpeed; // drives band movement
      
      // Draw stars with twinkling effect
      const currentTime = Date.now() * 0.001; // Convert to seconds
      
      starsRef.current.forEach((star) => {
        // Galaxy bands: move along u with sine arc on v, then rotate -45deg
        const theta = Math.PI / 4; // diagonal orientation (opposite direction)
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const centerX = width / 2;
        const centerY = height / 2;

        // Reverse flow so stars travel from bottom-left toward top-right
        const u = (star.u0 - rotationRef.current * star.bandSpeed * (1 / star.z)) % (width * 2) - width;
        const v = star.bandOffset + Math.sin(u * star.curveFreq + star.twinklePhase) * star.curveAmp * (1 / star.z);

        // rotate back to screen coords
        const x = centerX + u * cosT - v * sinT;
        const y = centerY + u * sinT + v * cosT;
        
        // Calculate twinkling opacity (gentle sine wave)
        const twinkle = Math.sin(currentTime * star.twinkleSpeed + star.twinklePhase) * 0.2 + 0.8;
        const currentOpacity = star.baseOpacity * twinkle;
        
        // Extract color components from star.color
        const colorMatch = star.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!colorMatch) return;
        const [_, r, g, b] = colorMatch;
        
        // Draw soft glow (larger, more transparent)
        if (star.size > 0.8) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 3);
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.15})`);
          gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.05})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw main star core with gradient for softer edges
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, star.size);
        coreGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentOpacity})`);
        coreGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.6})`);
        coreGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add cross-flare for brighter stars (more visible, like real stars)
        if (star.size > 0.8 && currentOpacity > 0.4) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          // Vertical line
          ctx.moveTo(x, y - star.size * 2.5);
          ctx.lineTo(x, y + star.size * 2.5);
          // Horizontal line
          ctx.moveTo(x - star.size * 2.5, y);
          ctx.lineTo(x + star.size * 2.5, y);
          ctx.stroke();
          
          // Add diagonal flares for brighter stars
          if (star.size > 1.5) {
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity * 0.3})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            // Diagonal lines
            ctx.moveTo(x - star.size * 1.5, y - star.size * 1.5);
            ctx.lineTo(x + star.size * 1.5, y + star.size * 1.5);
            ctx.moveTo(x + star.size * 1.5, y - star.size * 1.5);
            ctx.lineTo(x - star.size * 1.5, y + star.size * 1.5);
            ctx.stroke();
          }
        }
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: 'hsl(0, 0%, 7%)' }}
    />
  );
}
