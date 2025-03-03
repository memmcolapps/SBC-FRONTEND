"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormData {
  sbcId: string;
  location: string;
  sbcName: string;
  numberOfBreakers: string;
  position: string;
  operator: string;
}

const numberOfBreakersOptions = ["1", "2", "3", "4", "5", "6"];
const positionOptions = ["Manager", "Supervisor", "Operator"];
const operatorOptions = ["John Doe", "Jane Smith", "Mike Johnson"];

export function CreateBreakerForm() {
  const [formData, setFormData] = useState<FormData>({
    sbcId: "",
    location: "",
    sbcName: "",
    numberOfBreakers: "",
    position: "",
    operator: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Label htmlFor="sbcId" className="text-lg">
          SBC ID
        </Label>
        <Input
          id="sbcId"
          value={formData.sbcId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, sbcId: e.target.value }))
          }
          placeholder="Enter SBC ID"
          required
          className="text-lg"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="location" className="text-lg">
          Location
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, location: e.target.value }))
          }
          placeholder="Enter location"
          required
          className="text-lg"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="sbcName" className="text-lg">
          SBC Name
        </Label>
        <Input
          id="sbcName"
          value={formData.sbcName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, sbcName: e.target.value }))
          }
          placeholder="Enter SBC name"
          required
          className="text-lg"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="numberOfBreakers" className="text-lg">
          Number Of Breakers
        </Label>
        <Select
          value={formData.numberOfBreakers}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, numberOfBreakers: value }))
          }
        >
          <SelectTrigger id="numberOfBreakers">
            <SelectValue placeholder="Select number of breakers" />
          </SelectTrigger>
          <SelectContent>
            {numberOfBreakersOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="position" className="text-lg">
          Select Position In Organization
        </Label>
        <Select
          value={formData.position}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, position: value }))
          }
        >
          <SelectTrigger id="position">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            {positionOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="operator" className="text-lg">
          Assigned Operator
        </Label>
        <Select
          value={formData.operator}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, operator: value }))
          }
        >
          <SelectTrigger id="operator">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {operatorOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
        Create Breaker
      </Button>
    </form>
  );
}
