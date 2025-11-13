'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { themeClasses } from '@/lib/theme-classes';
import animationData from '@/assets/football-animation.json';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LoadingAnimationProps {
  message?: string;
  delay?: number; // Initial delay before showing (default: 0 to show immediately)
  minDisplayTime?: number; // Minimum time to display animation in milliseconds (default: 2000ms)
}

export function LoadingAnimation({ 
  message = 'Loading your football data...', 
  delay = 0,
  minDisplayTime = 2000 
}: LoadingAnimationProps) {
  const [showContent, setShowContent] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    startTimeRef.current = startTime;

    const showTimer = setTimeout(() => {
      setShowContent(true);
    }, delay);

    return () => {
      clearTimeout(showTimer);
    };
  }, [delay]);

  // Ensure minimum display time
  useEffect(() => {
    if (showContent && startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = minDisplayTime - elapsed;
      
      if (remaining > 0) {
        const minTimer = setTimeout(() => {
          // Animation has been shown for minimum time
        }, remaining);
        return () => clearTimeout(minTimer);
      }
    }
  }, [showContent, minDisplayTime]);

  if (!showContent) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-64 h-64">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {message && (
        <p className={`text-lg font-medium ${themeClasses.text.primary}`}>
          {message}
        </p>
      )}
    </div>
  );
}

