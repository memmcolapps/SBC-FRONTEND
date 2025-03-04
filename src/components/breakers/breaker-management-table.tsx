"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface BreakerButton {
  id: string;
  isActive: boolean;
}

interface Breaker {
  id: string;
  sbcId: string;
  sbcName: string;
  location: string;
  status: "Active" | "Inactive";
  assignedUser: string;
  lastAction: string;
  isExpanded: boolean;
  buttons: Record<string, boolean>;
}

const initialBreakers: Breaker[] = [
  {
    id: "1",
    sbcId: "201",
    sbcName: "SBC A",
    location: "Location 1",
    status: "Inactive",
    assignedUser: "John Due",
    lastAction: "Turned on (2 hours ago)",
    isExpanded: false,
    buttons: {
      B1: false,
      B2: false,
      B3: false,
      B4: false,
      B5: false,
      B6: false,
    },
  },
  {
    id: "2",
    sbcId: "201",
    sbcName: "SBC A",
    location: "Location 1",
    status: "Inactive",
    assignedUser: "John Due",
    lastAction: "Turned on (2 hours ago)",
    isExpanded: false,
    buttons: {
      B1: false,
      B2: false,
      B3: false,
      B4: false,
      B5: false,
      B6: false,
    },
  },
];

export function BreakerManagementTable() {
  const [breakers, setBreakers] = useState<Breaker[]>(initialBreakers);
  const [selectedBreakers, setSelectedBreakers] = useState<string[]>([]);

  const toggleBreaker = (id: string) => {
    setSelectedBreakers((prev) =>
      prev.includes(id)
        ? prev.filter((breakerId) => breakerId !== id)
        : [...prev, id],
    );
  };

  const toggleExpandBreaker = (id: string) => {
    setBreakers((prev) =>
      prev.map((breaker) =>
        breaker.id === id
          ? { ...breaker, isExpanded: !breaker.isExpanded }
          : breaker,
      ),
    );
  };

  const toggleButton = (breakerId: string, buttonId: string) => {
    setBreakers((prev) =>
      prev.map((breaker) => {
        if (breaker.id === breakerId) {
          const newState = !breaker.buttons[buttonId];
          return {
            ...breaker,
            lastAction: `Button ${buttonId} turned ${newState ? "ON" : "OFF"} (just now)`,
            buttons: {
              ...breaker.buttons,
              [buttonId]: newState,
            },
          };
        }
        return breaker;
      }),
    );
  };

  const handleTurnOn = () => {
    setBreakers((prev) =>
      prev.map((breaker) =>
        selectedBreakers.includes(breaker.id)
          ? { ...breaker, status: "Active", lastAction: "Turned on (just now)" }
          : breaker,
      ),
    );
  };

  const handleTurnOff = () => {
    setBreakers((prev) =>
      prev.map((breaker) =>
        selectedBreakers.includes(breaker.id)
          ? {
              ...breaker,
              status: "Inactive",
              lastAction: "Turned off (just now)",
            }
          : breaker,
      ),
    );
  };

  return (
    <div className="space-y-4 text-lg">
      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Sort</Button>
        </div>
        <div className="space-x-2">
          <Button onClick={handleTurnOn}>Turn On Selected</Button>
          <Button variant="outline" onClick={handleTurnOff}>
            Turn Off Selected
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        {breakers.map((breaker) => (
          <div key={breaker.id} className="border-b last:border-b-0">
            <div
              className={`grid cursor-pointer grid-cols-8 items-center px-4 py-2 hover:bg-gray-50 ${breaker.isExpanded ? "bg-gray-100" : ""}`}
              onClick={() => toggleExpandBreaker(breaker.id)}
            >
              <div
                className="flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedBreakers.includes(breaker.id)}
                  onCheckedChange={() => toggleBreaker(breaker.id)}
                />
              </div>
              <div>{breaker.sbcId}</div>
              <div>{breaker.sbcName}</div>
              <div>{breaker.location}</div>
              <div>{breaker.status}</div>
              <div>{breaker.assignedUser}</div>
              <div>{breaker.lastAction}</div>
            </div>

            {breaker.isExpanded && (
              <div className="flex justify-end border-t bg-gray-50 px-4 py-3">
                <div className="flex gap-2">
                  {Object.entries(breaker.buttons).map(([btnId, isActive]) => (
                    <Button
                      key={btnId}
                      className={
                        isActive
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-300 hover:bg-gray-400"
                      }
                      onClick={() => toggleButton(breaker.id, btnId)}
                    >
                      {btnId}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
