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
import { useRegisterBreaker } from "@/hooks/use-breakers";
import { toast } from "sonner";

interface FormData {
  sbcId: string;
  state: string;
  name: string;
  breakerCounter: string;
  city: string;
  streetName: string;
  assetId: string;
}

const numberOfBreakersOptions = ["1", "2", "3", "4", "5", "6"];

export function CreateBreakerForm() {
  const [formData, setFormData] = useState<FormData>({
    sbcId: "",
    state: "",
    city: "",
    streetName: "",
    name: "",
    breakerCounter: "",
    assetId: "",
  });

  const { mutate: registerBreakerMutation, isPending } = useRegisterBreaker();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a new payload object that matches backend expectations
    const payloadForApi = {
      sbcId: formData.sbcId,
      name: formData.name,
      assetId: formData.assetId,
      state: formData.state,
      breakerCount: parseInt(formData.breakerCounter, 10), // Convert to number
      streetName: formData.streetName,
      city: formData.city,
    };

    registerBreakerMutation(payloadForApi, { // Pass the adjusted payload
      onSuccess: () => {
        toast.success("Breaker registered successfully!");
        // Optionally reset the form after successful submission
        setFormData({
          sbcId: "",
          state: "",
          city: "",
          streetName: "",
          name: "",
          breakerCounter: "",
          assetId: "",
        });
      },
      onError: (error) => {
        console.error("Error registering breaker:", error); // Log the full error object for more details
        toast.error(`Failed to register breaker: ${error.message}`);
      },
    });
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
        <Label htmlFor="state" className="text-lg">
          State
        </Label>
        <Input
          id="state"
          value={formData.state}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, state: e.target.value }))
          }
          placeholder="Enter State"
          required
          className="text-lg"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="city" className="text-lg">
          City
        </Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, city: e.target.value }))
          }
          placeholder="Enter City"
          required
          className="text-lg"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="streetName" className="text-lg">
          Street Name
        </Label>
        <Input
          id="streetName" // Corrected ID
          value={formData.streetName} // Corrected value
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, streetName: e.target.value }))
          }
          placeholder="Enter The Street Name"
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
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter SBC name"
          required
          className="text-lg"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="numberOfBreaker" className="text-lg">
          Breaker counter
        </Label>
        <Select
          value={formData.breakerCounter}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, breakerCounter: value }))
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
        <Label htmlFor="assetId" className="text-lg">
          Enter the Asset Id
        </Label>
        <Input
          id="assetId"
          value={formData.assetId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, assetId: e.target.value }))
          }
          placeholder="Enter Asset Id"
          required
          className="text-lg"
        />
      </div>

      <Button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700"
        disabled={isPending} // Disable button while the mutation is pending
      >
        {isPending ? "Creating Breaker..." : "Create Breaker"}
      </Button>
    </form>
  );
}