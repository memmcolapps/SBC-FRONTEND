"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
}

export function UserProfileForm() {
  const [profile, setProfile] = useState<UserProfile>({
    firstname: "Abdulmujib",
    lastname: "Oyewo",
    email: "oyewoabdulmujib2@gmail.com",
    contact: "+2349017263671",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would typically make an API call to update the profile
      console.log("Updating profile:", profile);
      toast("Profile updated successfully");
    } catch (error) {
      toast("Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstname">Firstname</Label>
          <Input
            id="firstname"
            value={profile.firstname}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, firstname: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastname">Lastname</Label>
          <Input
            id="lastname"
            value={profile.lastname}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, lastname: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={profile.email}
          onChange={(e) =>
            setProfile((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">Contact</Label>
        <Input
          id="contact"
          value={profile.contact}
          onChange={(e) =>
            setProfile((prev) => ({ ...prev, contact: e.target.value }))
          }
          required
        />
      </div>

      <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
        Update profile
      </Button>
    </form>
  );
}
