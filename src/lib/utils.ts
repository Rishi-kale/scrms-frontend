import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { useCallback } from 'react';

export const useSmoothScroll = () => {
  const scrollToTop = useCallback((containerSelector?: string, onComplete?: () => void) => {
    const container = containerSelector
      ? document.querySelector(containerSelector) as HTMLElement
      : null;

    const scrollElement = container || window;
    const isWindow = !container;

    // Get current scroll position
    const startScroll = isWindow
      ? window.pageYOffset || document.documentElement.scrollTop
      : container!.scrollTop;

    if (startScroll === 0) {
      // Already at top
      if (onComplete) onComplete();
      return;
    }

    const startTime = performance.now();
    const duration = 600;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentScroll = startScroll * (1 - easeOutCubic);

      if (isWindow) {
        window.scrollTo(0, currentScroll);
      } else {
        container!.scrollTop = currentScroll;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, []);

};