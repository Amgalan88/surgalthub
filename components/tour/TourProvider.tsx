"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useJoyride, EVENTS } from "react-joyride";
import { getTourForPath } from "@/lib/tours/registry";
import { hasSeenTour, markTourSeen } from "@/lib/tours/storage";

interface TourContextValue {
  hasTour: boolean;
  replay: () => void;
}

const TourContext = createContext<TourContextValue>({
  hasTour: false,
  replay: () => {},
});

export function useTour() {
  return useContext(TourContext);
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tour = useMemo(() => getTourForPath(pathname), [pathname]);
  const steps = useMemo(() => tour?.steps ?? [], [tour]);

  const { controls, on, Tour } = useJoyride({
    steps,
    continuous: true,
    scrollToFirstStep: true,
    options: {
      primaryColor: "#d97706",
      textColor: "#172554",
      backgroundColor: "#ffffff",
      overlayColor: "rgba(23, 37, 84, 0.6)",
      arrowColor: "#ffffff",
      zIndex: 70,
      spotlightRadius: 8,
      showProgress: true,
      spotlightPadding: 6,
      skipBeacon: true,
      buttons: ["back", "close", "primary", "skip"],
      closeButtonAction: "skip",
    },
    locale: {
      back: "Буцах",
      close: "Хаах",
      last: "Дуусгах",
      next: "Дараах",
      skip: "Алгасах",
    },
  });

  useEffect(() => {
    if (!tour) return undefined;
    return on(EVENTS.TOUR_END, () => markTourSeen(tour.id));
  }, [tour, on]);

  useEffect(() => {
    if (!tour || steps.length === 0 || hasSeenTour(tour.id)) return undefined;
    const timer = setTimeout(() => controls.start(0), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour?.id]);

  const replay = useCallback(() => controls.start(0), [controls]);

  const value = useMemo(
    () => ({ hasTour: !!tour, replay }),
    [tour, replay]
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      {Tour}
    </TourContext.Provider>
  );
}
