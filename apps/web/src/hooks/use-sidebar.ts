import { useState, useEffect, useCallback, useRef } from 'react';

const BREAKPOINT = 768; // md breakpoint in pixels

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isOpenRef = useRef(false);

  // Keep the ref in sync with state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < BREAKPOINT);
      // Close sidebar on resize to desktop
      if (window.innerWidth >= BREAKPOINT && isOpenRef.current) {
        setIsOpen(false);
      }
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const open = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const close = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    isMobile,
    open,
    close,
    toggle,
  };
}
