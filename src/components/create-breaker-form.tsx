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

interface CreateBreakerFormProps {
  operators: { id: string; name: string; hierarchyPosition: string }[];
  onCreateBreaker: (breaker: {
    breakerId: string;
    location: string;
    name: string;
    operator: string;
  }) => Promise<void>;
}

export function CreateBreakerForm({
  operators,
  onCreateBreaker,
}: CreateBreakerFormProps) {
  const [breakerId, setBreakerId] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [operator, setOperator] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (breakerId && location && name && operator) {
      try {
        await onCreateBreaker({ breakerId, location, name, operator });
        setBreakerId("");
        setLocation("");
        setName("");
        setOperator("");
        setError(null);
      } catch (err) {
        console.error("Error creating breaker:", err);
        setError("Failed to create breaker. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <Label htmlFor="breaker-id">Breaker ID</Label>
        <Input
          id="breaker-id"
          value={breakerId}
          onChange={(e) => setBreakerId(e.target.value)}
          placeholder="Enter breaker ID"
          required
        />
      </div>
      <div>
        <Label htmlFor="breaker-location">Location</Label>
        <Input
          id="breaker-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter breaker location"
          required
        />
      </div>
      <div>
        <Label htmlFor="breaker-name">Breaker Name</Label>
        <Input
          id="breaker-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter breaker name"
          required
        />
      </div>
      <div>
        <Label htmlFor="breaker-operator">Assigned Operator</Label>
        <Select value={operator} onValueChange={setOperator} required>
          <SelectTrigger id="breaker-operator">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op.id} value={op.id}>
                {op.name} ({op.hierarchyPosition})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Create Breaker</Button>
    </form>
  );
}
