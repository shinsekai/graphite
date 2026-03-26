import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSidebar } from './use-sidebar';

describe('useSidebar', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    // Reset to desktop by default
    vi.stubGlobal('innerWidth', 1024);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('innerWidth', originalInnerWidth);
  });

  it('should initialize as closed on desktop', () => {
    vi.stubGlobal('innerWidth', 1024);
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isMobile).toBe(false);
  });

  it('should initialize as closed on mobile', () => {
    vi.stubGlobal('innerWidth', 600);
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isMobile).toBe(true);
  });

  it('should detect mobile viewport (< 768px)', () => {
    vi.stubGlobal('innerWidth', 700);
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isMobile).toBe(true);
  });

  it('should detect desktop viewport (>= 768px)', () => {
    vi.stubGlobal('innerWidth', 800);
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isMobile).toBe(false);
  });

  it('should open sidebar', () => {
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('should close sidebar', () => {
    const { result } = renderHook(() => useSidebar());
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should close sidebar when resizing to desktop', () => {
    vi.stubGlobal('innerWidth', 600);
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isMobile).toBe(true);

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    // Simulate resize to desktop
    act(() => {
      vi.stubGlobal('innerWidth', 1024);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isOpen).toBe(false);
  });

  it('should not close sidebar when resizing within mobile', () => {
    vi.stubGlobal('innerWidth', 400);
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isMobile).toBe(true);

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    // Simulate resize within mobile
    act(() => {
      vi.stubGlobal('innerWidth', 700);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isOpen).toBe(true); // Should stay open
  });

  it('should update isMobile on resize', () => {
    vi.stubGlobal('innerWidth', 1024);
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isMobile).toBe(false);

    act(() => {
      vi.stubGlobal('innerWidth', 600);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(true);

    act(() => {
      vi.stubGlobal('innerWidth', 1024);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(false);
  });

  it('should use exactly 768 as breakpoint', () => {
    // Below breakpoint
    vi.stubGlobal('innerWidth', 767);
    const { result } = renderHook(() => useSidebar());
    expect(result.current.isMobile).toBe(true);

    // At breakpoint - should be desktop
    vi.stubGlobal('innerWidth', 768);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.isMobile).toBe(false);

    // Above breakpoint
    vi.stubGlobal('innerWidth', 769);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.isMobile).toBe(false);
  });
});
