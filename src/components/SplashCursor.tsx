"use client";
import { useEffect, useRef, useState } from "react";

type SplashCursorProps = {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLORFUL?: boolean;
  COLOR_UPDATE_SPEED?: number;
  PAUSED?: boolean;
  BACK_COLOR?: {r: number, g: number, b: number} | number[];
  TRANSPARENT?: boolean;
  BLOOM?: boolean;
  BLOOM_ITERATIONS?: number;
  BLOOM_RESOLUTION?: number;
  BLOOM_INTENSITY?: number;
  BLOOM_THRESHOLD?: number;
  BLOOM_SOFT_KNEE?: number;
  COLOR?: number[];
  containerId?: string;
};

function SplashCursor({
  // Add whatever props you like for customization
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
  containerId,
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    try {
      console.log('SplashCursor: Initializing component');
      
      // Skip initialization if in fallback mode
      if (fallbackMode) {
        console.log('SplashCursor: Using fallback mode, skipping WebGL initialization');
        return;
      }
      
      const canvas = canvasRef.current;
      if (!canvas) {
        console.warn('SplashCursor: Canvas reference not found');
        setFallbackMode(true);
        return;
      }

      // Create container reference
      const container = containerId ? document.getElementById(containerId) : document.body;
      if (!container) {
        console.warn('SplashCursor: Container not found', { containerId });
        setFallbackMode(true);
        return;
      }

      // Add event listeners for hover
      const handleMouseEnter = () => {
        activeRef.current = true;
      };

      const handleMouseLeave = () => {
        activeRef.current = false;
      };

      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      function pointerPrototype() {
        this.id = -1;
        this.texcoordX = 0;
        this.texcoordY = 0;
        this.prevTexcoordX = 0;
        this.prevTexcoordY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.down = false;
        this.moved = false;
        this.color = [0, 0, 0];
      }

      // Normalize BACK_COLOR to ensure it's in the right format
      const normalizedBackColor = Array.isArray(BACK_COLOR) 
        ? { r: BACK_COLOR[0] || 0, g: BACK_COLOR[1] || 0, b: BACK_COLOR[2] || 0 }
        : BACK_COLOR;

      let config = {
        SIM_RESOLUTION,
        DYE_RESOLUTION,
        CAPTURE_RESOLUTION,
        DENSITY_DISSIPATION,
        VELOCITY_DISSIPATION,
        PRESSURE,
        PRESSURE_ITERATIONS,
        CURL,
        SPLAT_RADIUS,
        SPLAT_FORCE,
        SHADING,
        COLOR_UPDATE_SPEED,
        PAUSED: false,
        BACK_COLOR: normalizedBackColor,
        TRANSPARENT,
      };

      // Rest of your initialization code...
      // ... existing code ...

    } catch (error) {
      console.error('SplashCursor: Error in useEffect hook', error);
      setFallbackMode(true);
    }
    
    return () => {
      try {
        console.log('SplashCursor: Cleaning up');
        if (fallbackMode) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = containerId ? document.getElementById(containerId) : document.body;
        if (!container) return;

        // Rest of your cleanup code...
        // ... existing cleanup code ...
        
      } catch (cleanupError) {
        console.error('SplashCursor: Error in cleanup function', cleanupError);
      }
    };
  }, [containerId, SIM_RESOLUTION, DYE_RESOLUTION, DENSITY_DISSIPATION, VELOCITY_DISSIPATION, 
      PRESSURE, PRESSURE_ITERATIONS, CURL, SPLAT_RADIUS, SPLAT_FORCE, SHADING, 
      COLOR_UPDATE_SPEED, TRANSPARENT, fallbackMode]);

  // If in fallback mode, render a simple gradient background
  if (fallbackMode) {
    return (
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(120deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.1))'
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none', // Ensure it doesn't interfere with interactions
      }}
    />
  );
}

export default SplashCursor;
