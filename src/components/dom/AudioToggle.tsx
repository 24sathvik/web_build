"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const initAudio = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.1; // Low ambient volume
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Create a deep futuristic drone
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55; // Deep bass
    
    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = 110; 

    // LFO for slow pulsation
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.1; // 10 second cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    
    lfo.connect(lfoGain.gain);
    
    osc1.connect(lfoGain);
    osc2.connect(lfoGain);
    lfoGain.connect(masterGain);

    osc1.start();
    osc2.start();
    lfo.start();
  };

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initAudio();
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      audioCtxRef.current.suspend();
    } else {
      audioCtxRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleAudio}
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 p-4 rounded-full bg-[#050505]/50 backdrop-blur-md border border-[#BFC7D5]/20 text-[#BFC7D5] hover:text-[#00D9FF] transition-colors pointer-events-auto"
      aria-label="Toggle Audio"
    >
      {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
    </button>
  );
}
