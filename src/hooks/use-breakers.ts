"use client";

import { useState } from "react";
import type { Breaker } from "@/types";

const initialBreakers: Breaker[] = [
  {
    id: "1",
    breakerId: "BRK001",
    name: "Breaker A",
    location: "Building 1",
    status: "Active",
    assignedUser: "John Doe",
    lastAction: "Turned on (2 hours ago)",
  },
];

export function useBreakers() {
  const [breakers, setBreakers] = useState<Breaker[]>(initialBreakers);

  const addBreaker = async (
    newBreaker: Omit<Breaker, "id" | "status" | "lastAction">,
  ) => {
    const breaker: Breaker = {
      id: Math.random().toString(36).substr(2, 9),
      ...newBreaker,
      status: "Inactive",
      lastAction: "Created (just now)",
    };
    setBreakers((prev) => [...prev, breaker]);
  };

  const toggleBreakerStatus = async (breakerId: string) => {
    setBreakers((prev) =>
      prev.map((breaker) =>
        breaker.id === breakerId
          ? {
              ...breaker,
              status: breaker.status === "Active" ? "Inactive" : "Active",
              lastAction: `${breaker.status === "Active" ? "Turned off" : "Turned on"} (just now)`,
            }
          : breaker,
      ),
    );
  };

  return {
    breakers,
    addBreaker,
    toggleBreakerStatus,
  };
}
