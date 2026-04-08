"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "dermahub_onboarding_completed";
const TOUR_STATE_KEY = "dermahub_tour_state";

export interface TourState {
  pageIndex: number;
  active: boolean;
}

function getSavedTourState(): TourState | null {
  try {
    const raw = localStorage.getItem(TOUR_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TourState;
  } catch {
    return null;
  }
}

function saveTourState(state: TourState | null) {
  if (state) {
    localStorage.setItem(TOUR_STATE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(TOUR_STATE_KEY);
  }
}

export function useOnboarding() {
  const [tourState, setTourState] = useState<TourState | null>(null);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);

  useEffect(() => {
    const saved = getSavedTourState();
    if (saved?.active) {
      setTourState(saved);
    } else {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        setShouldAutoStart(true);
      }
    }
  }, []);

  const startTour = useCallback((pageIndex = 0) => {
    const state: TourState = { pageIndex, active: true };
    saveTourState(state);
    setTourState(state);
    setShouldAutoStart(false);
  }, []);

  const advancePage = useCallback((nextPageIndex: number) => {
    const state: TourState = { pageIndex: nextPageIndex, active: true };
    saveTourState(state);
    setTourState(state);
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    saveTourState(null);
    setTourState(null);
  }, []);

  const cancelTour = useCallback(() => {
    saveTourState(null);
    setTourState(null);
  }, []);

  return {
    tourState,
    shouldAutoStart,
    startTour,
    advancePage,
    completeTour,
    cancelTour,
  };
}
