/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfileForm } from "@/components/profile/user-profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
// import { useAuth } from "@/context/auth-context";
// import { useState } from "react";

export default function ProfilePage() {
  // const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Profile</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
