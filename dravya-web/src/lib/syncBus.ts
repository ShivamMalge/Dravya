type SyncEvent = {
    x?: number;
    y?: number;
    sourceId: string;
    isZooming?: boolean;
    xRange?: [number, number];
};

type SyncCallback = (event: SyncEvent) => void;

class CrossPaneSyncBus {
    private listeners: Set<SyncCallback> = new Set();

    subscribe(callback: SyncCallback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    publish(event: SyncEvent) {
        this.listeners.forEach(callback => callback(event));
    }
}

export const crossPaneSyncBus = new CrossPaneSyncBus();
export type { SyncEvent, SyncCallback };
