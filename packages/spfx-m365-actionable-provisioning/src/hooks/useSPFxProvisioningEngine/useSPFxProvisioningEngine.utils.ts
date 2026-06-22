/**
 * Internal utility for scheduling callbacks in animation frames.
 * 
 * @internal
 * @packageDocumentation
 */

/**
 * Schedules a function to run in the next animation frame.
 * @internal
 */
export function scheduleInAnimationFrame(fn: () => void): () => void {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    const handle = window.requestAnimationFrame(fn);
    return () => window.cancelAnimationFrame(handle);
  }

  const handle = window.setTimeout(fn, 0);
  return () => window.clearTimeout(handle);
}
