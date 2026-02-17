'use client';

import { useEffect, useState, useRef } from 'react';
import { LoadingAnimation } from './LoadingAnimation';

interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  minDisplayTime?: number; // Minimum time to show loading animation in milliseconds
}

/**
 * Wrapper component that ensures loading animation is visible for a minimum duration
 * even if data loads quickly. This prevents the animation from flashing too quickly.
 */
export function LoadingWrapper({ 
  isLoading, 
  children, 
  message = 'Loading your football data...',
  minDisplayTime = 2000 
}: LoadingWrapperProps) {
  const [showLoading, setShowLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const minDisplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Start loading - record the time
      if (loadingStartTimeRef.current === null) {
        loadingStartTimeRef.current = Date.now();
        setShowLoading(true);
        setShowContent(false);
      }
    } else {
      // Data has loaded
      if (loadingStartTimeRef.current !== null) {
        const elapsed = Date.now() - loadingStartTimeRef.current;
        const remaining = minDisplayTime - elapsed;

        if (remaining > 0) {
          // Data loaded too quickly, wait for minimum display time
          minDisplayTimerRef.current = setTimeout(() => {
            setShowLoading(false);
            setShowContent(true);
            loadingStartTimeRef.current = null;
          }, remaining);
        } else {
          // Minimum display time has passed, show content immediately
          setShowLoading(false);
          setShowContent(true);
          loadingStartTimeRef.current = null;
        }
      } else {
        // Not loading, show content
        setShowContent(true);
      }
    }

    return () => {
      if (minDisplayTimerRef.current) {
        clearTimeout(minDisplayTimerRef.current);
      }
    };
  }, [isLoading, minDisplayTime]);

  if (showLoading) {
    return <LoadingAnimation message={message} delay={0} />;
  }

  if (showContent) {
    return <>{children}</>;
  }

  // Initial state - show loading
  return <LoadingAnimation message={message} delay={0} />;
}







