"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateOperator } from "@/hooks/use-operators";
import { type CreateOperatorPayload } from "@/services/operator-service";
import { toast } from "sonner";

const roles = ["READ", "WRITE", "ADMIN"];

// Define the props interface to accept the onSuccess callback
interface AddOperatorFormProps {
  onSuccess: () => void;
}

export function AddOperatorForm({ onSuccess }: AddOperatorFormProps) {
  const [formData, setFormData] = useState<CreateOperatorPayload>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phoneNumber: "",
    position: "",
    location: "",
    permission: true,
    role: "READ",
  });
  const { mutate: createOperator, isPending } = useCreateOperator();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting operator:", formData);
    createOperator(formData, {
      onSuccess: (data) => {
        console.log("Operator creation successful:", data);
        toast.success("Operator created successfully!");
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          password: "",
          phoneNumber: "",
          position: "",
          location: "",
          permission: true,
          role: "READ",
        });
        // Call the onSuccess callback to signal the parent component to close the dialog
        onSuccess();
      },
      onError: (error) => {
        console.error("Operator creation error:", error.message);
        toast.error(error.message);
      },
    });
  };

  const isFormValid =
    formData.firstname &&
    formData.lastname &&
    formData.email &&
    formData.password &&
    formData.phoneNumber &&
    formData.position;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstname}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstname: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastname}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastname: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact">Contact</Label>
        <Input
          id="contact"
          value={formData.phoneNumber}
          onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value.toUpperCase() }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="permission">Permission</Label>
        <Select
          value={formData.permission ? "true" : "false"}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, permission: value === "true" }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select permission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Enabled</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end items-end">
      <Button type="submit" disabled={isPending || !isFormValid} className="cursor-pointer">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isPending ? "Creating..." : "Create Operator"}
      </Button>
      </div>
    </form>
  );
}