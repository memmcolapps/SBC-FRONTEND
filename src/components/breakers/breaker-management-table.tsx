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

interface ExpandedBreaker extends Breaker {
  isExpanded: boolean;
  buttons: Record<string, boolean>;
  lastAction?: string;
  status: "Active" | "Inactive";
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
        isExpanded: false,
        status: "Inactive",
        lastAction: "No recent actions",
        buttons: {
          B1: false,
          B2: false,
          B3: false,
          B4: false,
          B5: breaker.breakerCount > 4,
          B6: breaker.breakerCount > 5,
        },
        ...localData,
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
          status: newButtonState ? "Active" : "Inactive",
          lastAction: `Button ${buttonId} turned ${newButtonState ? "ON" : "OFF"} (just now)`,
          buttons: {
            ...(current.buttons ?? {
              B1: false,
              B2: false,
              B3: false,
              B4: false,
              B5: (data.find((b) => b.id === id)?.breakerCount ?? 0) > 4,
              B6: (data.find((b) => b.id === id)?.breakerCount ?? 0) > 5,
            }),
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
        updates[id] = {
          ...prev[id],
          status: "Active",
          lastAction: "Turned on (just now)",
          buttons: Object.fromEntries(
            Object.entries({
              B1: true,
              B2: true,
              B3: true,
              B4: true,
              B5: (data.find((b) => b.id === id)?.breakerCount ?? 0) > 4,
              B6: (data.find((b) => b.id === id)?.breakerCount ?? 0) > 5,
            }).filter(([key]) => key in (prev[id]?.buttons ?? {})),
          ),
        };
      });
      return { ...prev, ...updates };
    });
  };

  const handleTurnOff = () => {
    setLocalModifications((prev) => {
      const updates: Record<string, Partial<ExpandedBreaker>> = {};
      selectedBreakers.forEach((id) => {
        updates[id] = {
          ...prev[id],
          status: "Inactive",
          lastAction: "Turned off (just now)",
          buttons: Object.fromEntries(
            Object.keys(
              prev[id]?.buttons ?? {
                B1: false,
                B2: false,
                B3: false,
                B4: false,
                B5: (data.find((b) => b.id === id)?.breakerCount ?? 0) > 4,
                B6: (data.find((b) => b.id === id)?.breakerCount ?? 0) > 5,
              },
            ).map((key) => [key, false]),
          ),
        };
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
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Breaker Count</TableHead>
              <TableHead>Last Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakers.map((breaker) => (
              <>
                <TableRow
                  key={breaker.id}
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
                  <TableCell>{breaker.name}</TableCell>
                  <TableCell>
                    {breaker.city}, {breaker.state}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        breaker.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {breaker.status}
                    </span>
                  </TableCell>
                  <TableCell>{breaker.breakerCount}</TableCell>
                  <TableCell>
                    {breaker.lastAction || "No recent actions"}
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
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
