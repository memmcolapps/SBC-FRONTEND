"use client";

import { useMemo, useState } from "react";
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
import { useBreakers } from "@/hooks/use-breakers";
import { Skeleton } from "@/components/ui/skeleton";
import { type Breaker } from "@/types/breakers";
import React from "react";

// The status property here must match the capitalization in the Breaker interface
interface ExpandedBreaker extends Breaker {
  isExpanded: boolean;
  buttons: Record<string, boolean>;
  lastAction?: string;
  status: "ACTIVE" | "INACTIVE"; // Corrected capitalization
}

export function BreakerManagementTable() {
  const [selectedBreakers, setSelectedBreakers] = useState<string[]>([]);
  const [localModifications, setLocalModifications] = useState<
    Record<string, Partial<ExpandedBreaker>>
  >({});
  const {
    data = [],
    isLoading,
    isError,
  } = useBreakers({
    page: 0,
    size: 10,
  });

  // Combine API data with local modifications
  const breakers = useMemo(() => {
    return data.map((breaker) => {
      const localData = localModifications[breaker.id] ?? {};
      return {
        ...breaker,
        isExpanded: localData.isExpanded ?? false,
        // Default status is now correctly capitalized to "INACTIVE"
        status: localData.status ?? "INACTIVE",
        lastAction: localData.lastAction ?? "No recent actions",
        buttons: localData.buttons ?? {
          B1: false,
          B2: false,
          B3: false,
          B4: false,
          // Correctly checks breakerCount for buttons B5 and B6
          B5: breaker.breakerCount > 4,
          B6: breaker.breakerCount > 5,
        },
      };
    });
  }, [data, localModifications]);

  const toggleBreaker = (id: string) => {
    setSelectedBreakers((prev) =>
      prev.includes(id)
        ? prev.filter((breakerId) => breakerId !== id)
        : [...prev, id],
    );
  };

  const toggleExpandBreaker = (id: string) => {
    setLocalModifications((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isExpanded: !(prev[id]?.isExpanded ?? false),
      },
    }));
  };

  const toggleButton = (id: string, buttonId: string) => {
    setLocalModifications((prev) => {
      const current = prev[id] ?? {};
      const newButtonState = !(current.buttons?.[buttonId] ?? false);

      return {
        ...prev,
        [id]: {
          ...current,
          // Corrected status to use "ACTIVE" or "INACTIVE"
          status: newButtonState ? "ACTIVE" : "INACTIVE",
          lastAction: `Button ${buttonId} turned ${newButtonState ? "ON" : "OFF"} (just now)`,
          buttons: {
            // Retain existing button states, but update the selected one
            ...(current.buttons ?? {}),
            [buttonId]: newButtonState,
          },
        },
      };
    });
  };

  const handleTurnOn = () => {
    setLocalModifications((prev) => {
      const updates: Record<string, Partial<ExpandedBreaker>> = {};
      selectedBreakers.forEach((id) => {
        const breakerData = breakers.find(b => b.id === id);
        if (breakerData) {
          updates[id] = {
            ...prev[id],
            // Corrected status to use "ACTIVE"
            status: "ACTIVE",
            lastAction: "Turned on (just now)",
            buttons: {
              ...breakerData.buttons, // Start with the existing button states
              B1: true,
              B2: true,
              B3: true,
              B4: true,
            },
          };
        }
      });
      return { ...prev, ...updates };
    });
  };

  const handleTurnOff = () => {
    setLocalModifications((prev) => {
      const updates: Record<string, Partial<ExpandedBreaker>> = {};
      selectedBreakers.forEach((id) => {
        const breakerData = breakers.find(b => b.id === id);
        if (breakerData) {
          updates[id] = {
            ...prev[id],
            // Corrected status to use "INACTIVE"
            status: "INACTIVE",
            lastAction: "Turned off (just now)",
            buttons: {
              ...breakerData.buttons,
              B1: false,
              B2: false,
              B3: false,
              B4: false,
            },
          };
        }
      });
      return { ...prev, ...updates };
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Failed to load breakers
      </div>
    );
  }

  if (!breakers.length) {
    return <div className="py-8 text-center">No breakers found</div>;
  }

  return (
    <div className="space-y-4">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>SBC ID</TableHead>
              <TableHead>Asset Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Breaker Count</TableHead>
              <TableHead>Date Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakers.map((breaker) => (
              <React.Fragment key={breaker.id}>
                <TableRow
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpandBreaker(breaker.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedBreakers.includes(breaker.id)}
                      onCheckedChange={() => toggleBreaker(breaker.id)}
                    />
                  </TableCell>
                  <TableCell>{breaker.sbcId}</TableCell>
                  <TableCell>{breaker.assetId}</TableCell>
                  <TableCell>{breaker.name}</TableCell>
                  <TableCell>
                    {breaker.city}, {breaker.state}, {breaker.streetName}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${breaker.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {breaker.status}
                    </span>
                  </TableCell>
                  <TableCell>{breaker.breakerCount}</TableCell>
                  <TableCell>
                    {new Date(breaker.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
                {breaker.isExpanded && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={7}>
                      <div className="flex justify-end gap-2 p-2">
                        {Object.entries(breaker.buttons)
                          .filter(([_, show]) => show)
                          .map(([btnId, isActive]) => (
                            <Button
                              key={btnId}
                              variant={isActive ? "default" : "outline"}
                              className={
                                isActive
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "hover:bg-gray-200"
                              }
                              onClick={() => toggleButton(breaker.id, btnId)}
                            >
                              {btnId}
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
