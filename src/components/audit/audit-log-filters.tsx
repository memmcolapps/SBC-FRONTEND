/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface DatePickerProps {
  id: string;
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  onClear: () => void;
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  onClear,
}: DatePickerProps) {
  return (
    <div className="relative flex items-center gap-4">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2" size={15} />
            {value ? format(value, "PPP") : <span>Choose Date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {value && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
}

export function AuditLogFilters() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const handleExport = () => {
    // Implement your export logic here
    console.log("Exporting logs...");
  };

  return (
    <div className="mb-4 flex items-center justify-between p-4">
      <div className="flex gap-8">
        <DatePicker
          id="dateFrom"
          label="From"
          value={dateFrom}
          onChange={setDateFrom}
          onClear={() => setDateFrom(undefined)}
        />
        <DatePicker
          id="dateTo"
          label="To"
          value={dateTo}
          onChange={setDateTo}
          onClear={() => setDateTo(undefined)}
        />
      </div>
      <Button onClick={handleExport}>Export Logs</Button>
    </div>
  );
}
