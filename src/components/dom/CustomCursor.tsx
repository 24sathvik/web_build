"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only activate custom cursor on fine pointer (mouse/trackpad) devices
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);
    document.body.style.cursor = "none";

    const onMouseMove = (e: MouseEvent) => {
      if (dotRef.current) {
        gsap.to(dotRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0,
        });
      }
      
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

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, [role="button"]')) {
        setIsHovering(true);
        if (cursorRef.current) {
          gsap.to(cursorRef.current, {
            scale: 1.5,
            backgroundColor: "rgba(0, 217, 255, 0.1)",
            borderColor: "rgba(0, 217, 255, 0.5)",
            duration: 0.3,
          });
        }
      } else {
        setIsHovering(false);
        if (cursorRef.current) {
          gsap.to(cursorRef.current, {
            scale: 1,
            backgroundColor: "transparent",
            borderColor: "rgba(255, 255, 255, 0.2)",
            duration: 0.3,
          });
        }
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    // Continuous rotation for outer tech ring
    let rotateTween: gsap.core.Tween | null = null;
    if (cursorRef.current) {
      rotateTween = gsap.to(cursorRef.current, {
        rotation: 360,
        duration: 10,
        repeat: -1,
        ease: "linear",
      });
    }

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      if (rotateTween) rotateTween.kill();
    };
  }, [isHovering]);

  if (!isEnabled) return null;

  return (
    <>
      {/* Precision Core Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      >
        <div className="w-1.5 h-1.5 bg-[#00D9FF] rounded-full shadow-[0_0_8px_#00D9FF]" />
      </div>

      {/* Outer Tactical Crosshair Ring */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/20 transition-colors duration-200"
        style={{ willChange: "transform" }}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-[#00D9FF]/60" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-[#00D9FF]/60" />
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1 h-[1px] bg-[#00D9FF]/60" />
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1 h-[1px] bg-[#00D9FF]/60" />
      </div>
    </>
  );
}
