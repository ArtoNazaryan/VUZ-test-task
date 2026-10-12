type TObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

const activeObservers = new Set<FakeIntersectionObserver>();

export class FakeIntersectionObserver {
  private readonly callback: TObserverCallback;

  constructor(callback: TObserverCallback) {
    this.callback = callback;
  }

  observe(): void {
    activeObservers.add(this);
  }

  disconnect(): void {
    activeObservers.delete(this);
  }

  unobserve(): void {
    activeObservers.delete(this);
  }

  trigger(): void {
    this.callback([{ isIntersecting: true }]);
  }
}

export function scrollObservedElementsIntoView(): void {
  activeObservers.forEach((observer) => {
    observer.trigger();
  });
}
