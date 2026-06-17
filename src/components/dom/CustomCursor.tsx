"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import clsx from "clsx";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Hide default cursor globally
    document.body.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      // Instant small dot
      if (dotRef.current) {
        gsap.to(dotRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0,
        });
      }
      
      // Trailing tech ring
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.6,
          ease: "expo.out",
        });
      }
    };

    const onMouseDown = () => {
      if (cursorRef.current) gsap.to(cursorRef.current, { scale: 0.5, duration: 0.2 });
      if (dotRef.current) gsap.to(dotRef.current, { scale: 2, duration: 0.2 });
    };

    const onMouseUp = () => {
      if (cursorRef.current) gsap.to(cursorRef.current, { scale: isHovering ? 1.5 : 1, duration: 0.2 });
      if (dotRef.current) gsap.to(dotRef.current, { scale: 1, duration: 0.2 });
    };

    // Detect hover on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, [role="button"]')) {
        setIsHovering(true);
        if (cursorRef.current) gsap.to(cursorRef.current, { scale: 1.5, backgroundColor: "rgba(0, 217, 255, 0.1)", borderColor: "rgba(0, 217, 255, 0.5)", duration: 0.3 });
      } else {
        setIsHovering(false);
        if (cursorRef.current) gsap.to(cursorRef.current, { scale: 1, backgroundColor: "transparent", borderColor: "rgba(255, 255, 255, 0.2)", duration: 0.3 });
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    // Continuous rotation for the outer tech ring
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        rotation: 360,
        duration: 10,
        repeat: -1,
        ease: "linear"
      });
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = 'auto';
    };
  }, [isHovering]);

  return (
    <>
      {/* Outer Quantum Lens */}
      <div 
        ref={cursorRef} 
        className={clsx(
          "fixed top-0 left-0 w-12 h-12 rounded-full border border-white/20 backdrop-blur-[2px] pointer-events-none z-[100] hidden md:flex items-center justify-center transition-opacity duration-300",
          "origin-center -translate-x-1/2 -translate-y-1/2"
        )}
      >
        {/* Tech crosshair markings */}
        <div className="absolute top-0 w-[2px] h-2 bg-[#00D9FF]" />
        <div className="absolute bottom-0 w-[2px] h-2 bg-[#00D9FF]" />
        <div className="absolute left-0 w-2 h-[2px] bg-[#00D9FF]" />
        <div className="absolute right-0 w-2 h-[2px] bg-[#00D9FF]" />
      </div>

      {/* Inner precise dot */}
      <div 
        ref={dotRef} 
        className={clsx(
          "fixed top-0 left-0 w-1.5 h-1.5 pointer-events-none z-[100] hidden md:block",
          "origin-center -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
        )}
      >
        <div className={clsx("w-full h-full rotate-45 transition-colors duration-300", isHovering ? "bg-[#6E5BFF]" : "bg-[#00D9FF]")} />
      </div>
    </>
  );
}
