import { useEffect, useState } from 'react';

export function useDebouncedValue<TValue>(value: TValue, delayMs: number): TValue {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return (): void => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
