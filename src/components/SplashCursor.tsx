import React from 'react';

interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE_ITERATIONS?: number;
  SPLAT_RADIUS?: number;
  COLOR?: [number, number, number];
  BACK_COLOR?: { r: number; g: number; b: number } | [number, number, number];
  containerId?: string;
}

const SplashCursor: React.FC<SplashCursorProps> = (props) => {
  // Use a simple gradient background instead of WebGL for better compatibility
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, rgba(131,58,180,0.2) 0%, rgba(29,75,253,0.2) 50%, rgba(252,176,69,0.2) 100%)',
        opacity: 0.8
      }}
      aria-hidden="true"
    />
  );
};

export default SplashCursor;
