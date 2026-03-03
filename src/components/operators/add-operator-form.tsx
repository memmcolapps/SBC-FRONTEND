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
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-sm text-gray-600">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstname}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstname: e.target.value }))}
            placeholder="Enter first name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-sm text-gray-600">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastname}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastname: e.target.value }))}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm text-gray-600">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm text-gray-600">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Enter password"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact" className="text-sm text-gray-600">Phone Number</Label>
          <Input
            id="contact"
            value={formData.phoneNumber}
            onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="position" className="text-sm text-gray-600">Position</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value.toUpperCase() }))}
            placeholder="Enter position"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-sm text-gray-600">Location (State)</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
                "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
                "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
                "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
                "Yobe", "Zamfara"
              ].map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-sm text-gray-600">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
          >
            <SelectTrigger id="role">
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="permission" className="text-sm text-gray-600">Permission</Label>
        <Select
          value={formData.permission ? "true" : "false"}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, permission: value === "true" }))}
        >
          <SelectTrigger id="permission">
            <SelectValue placeholder="Select permission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Enabled</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="bg-[#16085F] hover:bg-[#1e0f7a]"
          disabled={isPending || !isFormValid}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Creating..." : "Create Operator"}
        </Button>
      </div>
    </form>
  );
}
