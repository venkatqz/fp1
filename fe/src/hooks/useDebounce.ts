import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * used to delay the processing of a value until a certain amount of time has passed.
 * Common use case: Search inputs to prevent API calls on every keystroke.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
    // State to store the debounced value
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Update the debounced value after the specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function: clears the timeout if the value changes (or component unmounts)
        // before the delay has passed. This effectively resets the timer.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-run if value or delay changes

    return debouncedValue;
}

export default useDebounce;
