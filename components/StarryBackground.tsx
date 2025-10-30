'use client';

import { useEffect, useRef } from 'react';
import { detectPerformanceTier, getPerformanceConfig } from '@/lib/performance';

interface Star {
  x: number;
  y: number;
  z: number; // Depth layer: 1 (far), 2 (mid), 3 (near)
  size: number;
  opacity: number;
  baseOpacity: number; // Base opacity for twinkling
  twinkleSpeed: number; // How fast the star twinkles
  twinklePhase: number; // Random phase offset for twinkling
  color: string; // Star color
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
      
      // Far stars (smallest, slowest, dimmest)
      for (let i = 0; i < starCounts.far; i++) {
        const baseOpacity = Math.random() * 0.3 + 0.2;
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: 1,
          size: Math.random() * 1.0 + 0.5, // Increased size
          opacity: baseOpacity,
          baseOpacity,
          twinkleSpeed: Math.random() * 0.8 + 0.4, // Faster twinkle
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
      
      // Mid stars
      for (let i = 0; i < starCounts.mid; i++) {
        const baseOpacity = Math.random() * 0.4 + 0.35;
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: 2,
          size: Math.random() * 1.6 + 0.9, // Increased size
          opacity: baseOpacity,
          baseOpacity,
          twinkleSpeed: Math.random() * 1.0 + 0.5, // Faster twinkle
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
      
      // Near stars (largest, fastest, brightest) - fewer of these
      for (let i = 0; i < starCounts.near; i++) {
        const baseOpacity = Math.random() * 0.5 + 0.5;
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: 3,
          size: Math.random() * 2.0 + 1.2, // Increased size
          opacity: baseOpacity,
          baseOpacity,
          twinkleSpeed: Math.random() * 1.5 + 0.8, // Faster twinkle
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
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
      
      // Update rotation (parallax effect) - increased speed for visibility
      if (config.enableStarRotation) {
        rotationRef.current += 0.001 * config.animationSpeed; // 10x faster for noticeable rotation
      }
      
      // Draw stars with twinkling effect
      const currentTime = Date.now() * 0.001; // Convert to seconds
      
      starsRef.current.forEach((star) => {
        // Apply rotation around user (center of screen) with parallax based on depth
        let x = star.x;
        let y = star.y;
        
        if (config.enableStarRotation) {
          const centerX = width / 2;
          const centerY = height / 2;
          const dx = star.x - centerX;
          const dy = star.y - centerY;
          const angle = Math.atan2(dy, dx);
          const distance = Math.sqrt(dx * dx + dy * dy);
          // Stars rotate diagonally around user (center) - parallax effect
          const rotationSpeed = rotationRef.current * (1 / star.z) * 2.0;
          
          // Diagonal rotation: rotate both around center and add diagonal drift
          x = centerX + Math.cos(angle + rotationSpeed) * distance;
          y = centerY + Math.sin(angle + rotationSpeed) * distance;
          
          // Add diagonal movement component
          const diagonalOffset = rotationRef.current * (1 / star.z) * 50;
          x += diagonalOffset;
          y += diagonalOffset;
          
          // Wrap around edges
          if (x < 0) x += width;
          if (x > width) x -= width;
          if (y < 0) y += height;
          if (y > height) y -= height;
        }
        
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
