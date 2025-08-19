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
import { useNigerianCities, useNigerianStates } from "@/hooks/use-location";
import { toast } from "sonner";

interface FormData {
  sbcId: string;
  stateId: string;
  cityId: string;
  streetName: string;
  name: string;
  breakerCounter: string;
  assetId: string;
}

interface CreateSBCFormProps {
  onSuccess: () => void;
}

const numberOfBreakersOptions = [ "4", "6"];

export function CreateBreakerForm({ onSuccess }: CreateSBCFormProps) {
  const [formData, setFormData] = useState<FormData>({
    sbcId: "",
    stateId: "",
    cityId: "",
    streetName: "",
    name: "",
    breakerCounter: "",
    assetId: "",
  });

  const { mutate: registerBreakerMutation, isPending } = useRegisterBreaker();

  // Fetch states
  const { data: states, isLoading: isLoadingStates, isError: isErrorStates } = useNigerianStates();

  // Fetch cities based on selected state
  const {
    data: cities,
    isLoading: isLoadingCities,
    isError: isErrorCities,
  } = useNigerianCities(formData.stateId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payloadForApi = {
      sbcId: formData.sbcId,
      name: formData.name,
      assetId: formData.assetId,
      state: states?.find((s) => s.id === formData.stateId)?.name ?? "",
      city: cities?.find((c) => c.id === formData.cityId)?.name ?? "",
      streetName: formData.streetName,
      breakerCount: parseInt(formData.breakerCounter, 10),
    };

    registerBreakerMutation(payloadForApi, {
      onSuccess: () => {
        toast.success("Breaker registered successfully!");
        setFormData({
          sbcId: "",
          stateId: "",
          cityId: "",
          streetName: "",
          name: "",
          breakerCounter: "",
          assetId: "",
        });
        // Correctly call onSuccess here to close the dialog after a successful API call
        onSuccess();
      },
      onError: (error) => {
        console.error("Error registering breaker:", error);
        toast.error(`Failed to register breaker: ${error.message}`);
      },
    });
  };

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      stateId: value,
      cityId: "", // Reset city when state changes
    }));
  };

  const handleCityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      cityId: value,
    }));
  };

  const isFormValid = formData.sbcId && formData.stateId && formData.cityId && formData.streetName && formData.name && formData.breakerCounter && formData.assetId;

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

      {/* State Dropdown */}
      <div className="space-y-3">
        <Label htmlFor="state" className="text-lg">
          State
        </Label>
        <Select
          value={formData.stateId}
          onValueChange={handleStateChange}
          disabled={isLoadingStates}
          required
        >
          <SelectTrigger id="state">
            <SelectValue placeholder={isLoadingStates ? "Loading states..." : "Select State"} />
          </SelectTrigger>
          <SelectContent>
            {isErrorStates && <SelectItem value="error-states" disabled>Error loading states</SelectItem>}
            {!isLoadingStates && states?.length === 0 && <SelectItem value="no-states-found" disabled>No states found</SelectItem>}
            {states?.map((state) => (
              <SelectItem key={state.id} value={state.id}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Dropdown */}
      <div className="space-y-3">
        <Label htmlFor="city" className="text-lg">
          City
        </Label>
        <Select
          value={formData.cityId}
          onValueChange={handleCityChange}
          disabled={!formData.stateId || isLoadingCities}
          required
        >
          <SelectTrigger id="city">
            <SelectValue
              placeholder={
                isLoadingCities
                  ? "Loading cities..."
                  : formData.stateId
                    ? "Select City"
                    : "Select a state first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {isErrorCities && <SelectItem value="error-cities" disabled>Error loading cities</SelectItem>}
            {!isLoadingCities && cities?.length === 0 && formData.stateId && (
              <SelectItem value="no-cities-found" disabled>No cities found for this state</SelectItem>
            )}
            {cities?.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="streetName" className="text-lg">
          Street Name
        </Label>
        <Input
          id="streetName"
          value={formData.streetName}
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
          required
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
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700"
          disabled={isPending || isLoadingStates || isLoadingCities || !isFormValid}
        >
          {isPending ? "Creating Breaker..." : "Create Breaker"}
        </Button>
      </div>
    </form>
  );
}