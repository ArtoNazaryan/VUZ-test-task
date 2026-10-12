import { type RefObject, useEffect } from 'react';

export function useOnVisible(
  targetRef: RefObject<Element | null>,
  onVisible: () => void,
  isEnabled: boolean,
): void {
  useEffect(() => {
    const target = targetRef.current;

    if (!target || !isEnabled) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onVisible();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(target);

    return (): void => {
      observer.disconnect();
    };
  }, [targetRef, onVisible, isEnabled]);
}
