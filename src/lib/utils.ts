/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the original function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function(this: any, ...args: Parameters<T>) {
    // Save the context and arguments for the latest call
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    lastArgs = args;
    
    // Function to execute after delay
    const later = () => {
      timeout = null;
      if (lastArgs) {
        func.apply(context, lastArgs);
        lastArgs = null;
      }
    };
    
    // Clear existing timeout and set a new one
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}