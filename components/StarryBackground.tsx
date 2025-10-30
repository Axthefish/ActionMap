'use client';

import { useEffect, useRef } from 'react';
import { detectPerformanceTier, getPerformanceConfig } from '@/lib/performance';

interface Star {
  x: number;
  y: number;
  z: number; // Depth layer: 1 (far), 2 (mid), 3 (near)
  size: number;
  opacity: number;
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
    
    // Initialize stars with three depth layers
    const initStars = () => {
      starsRef.current = [];
      const starCounts = {
        far: Math.floor(config.starCount * 0.5),    // 50% far
        mid: Math.floor(config.starCount * 0.3),    // 30% mid
        near: Math.floor(config.starCount * 0.2),   // 20% near
      };
      
      // Far stars (smallest, slowest)
      for (let i = 0; i < starCounts.far; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: 1,
          size: Math.random() * 1 + 0.5,
          opacity: Math.random() * 0.3 + 0.2,
        });
      }
      
      // Mid stars
      for (let i = 0; i < starCounts.mid; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: 2,
          size: Math.random() * 1.5 + 1,
          opacity: Math.random() * 0.4 + 0.3,
        });
      }
      
      // Near stars (largest, fastest)
      for (let i = 0; i < starCounts.near; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: 3,
          size: Math.random() * 2 + 1.5,
          opacity: Math.random() * 0.5 + 0.4,
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
      
      // Update rotation (parallax effect)
      if (config.enableStarRotation) {
        rotationRef.current += 0.0001 * config.animationSpeed;
      }
      
      // Draw stars
      starsRef.current.forEach((star) => {
        // Apply parallax rotation based on depth
        let x = star.x;
        let y = star.y;
        
        if (config.enableStarRotation) {
          const centerX = width / 2;
          const centerY = height / 2;
          const dx = star.x - centerX;
          const dy = star.y - centerY;
          const angle = Math.atan2(dy, dx);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const rotationSpeed = rotationRef.current * star.z * 0.3;
          
          x = centerX + Math.cos(angle + rotationSpeed) * distance;
          y = centerY + Math.sin(angle + rotationSpeed) * distance;
          
          // Wrap around edges
          if (x < 0) x += width;
          if (x > width) x -= width;
          if (y < 0) y += height;
          if (y > height) y -= height;
        }
        
        // Draw star as circle
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // Add glow for larger stars
        if (star.size > 2 && star.z === 3) {
          ctx.beginPath();
          ctx.arc(x, y, star.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(135, 206, 235, ${star.opacity * 0.2})`;
          ctx.fill();
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

