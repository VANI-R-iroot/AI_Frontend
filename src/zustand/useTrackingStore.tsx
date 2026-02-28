import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TrackingEntry {
  userId: string;
  browserName: string;
  pathname: string;
  [key: string]: any;
}

interface TrackingStore {
  trackingData: TrackingEntry[];
  setTrackingData: (data: TrackingEntry[]) => void;
}

const useTrackingStore = create<TrackingStore>()(
  persist(
    (set) => ({
      trackingData: [],
      setTrackingData: (data) => set({ trackingData: data }),
    }),
    {
      name: "tracking-store",
    }
  )
);

export default useTrackingStore;
