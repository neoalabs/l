import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";

function Logo({ className, ...props }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);
  
  // Occasional random blinking
  useEffect(() => {
    if (!mouseOver) {
      const blinkInterval = setInterval(() => {
        const shouldBlink = Math.random() > 0.7;
        if (shouldBlink) {
          setBlinking(true);
          setTimeout(() => setBlinking(false), 200);
        }
      }, 3000);
      
      return () => clearInterval(blinkInterval);
    }
  }, [mouseOver]);

  const handleMouseEnter = () => {
    setMouseOver(true);
    setIsAnimating(true);
  };

  const handleMouseLeave = () => {
    setMouseOver(false);
    setIsAnimating(false);
  };

  const handleClick = () => {
    setIsAnimating(prev => !prev);
  };

  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6 cursor-pointer transition-all", 
        isAnimating ? "animate-bounce" : "", 
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    >
      {/* Background gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210, 100%, 50%)" />
          <stop offset="100%" stopColor="hsl(270, 100%, 50%)" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Main circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="11" 
        fill="url(#logoGradient)" 
        filter="url(#glow)"
        stroke="white"
        strokeWidth="0.5"
        className="transition-all duration-300"
        style={{
          transform: isAnimating ? "scale(1.05)" : "scale(1)",
        }}
      />
      
      {/* Eyes */}
      <g className="transition-all duration-300">
        {/* Left eye */}
        <circle 
          cx="8" 
          cy="11" 
          r={blinking ? "0.1" : "1.5"} 
          fill="white" 
          className="transition-all duration-150"
        />
        
        {/* Right eye */}
        <circle 
          cx="16" 
          cy="11" 
          r={blinking ? "0.1" : "1.5"} 
          fill="white" 
          className="transition-all duration-150"
        />
      </g>
      
      {/* Smile */}
      <path 
        d={isAnimating 
          ? "M 8 15 Q 12 18, 16 15" 
          : "M 8 15 Q 12 16, 16 15"} 
        stroke="white" 
        strokeWidth="1.5" 
        fill="transparent"
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    </svg>
  );
}

export { Logo };