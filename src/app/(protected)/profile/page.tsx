"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfileForm } from "@/components/profile/user-profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { generateOtpApi } from "@/services";
import { toast } from "sonner";

export default function ProfilePage() {
  const [generatingOtp, setGeneratingOtp] = useState(false);
  const { user, token } = useAuth();

  const handleGenerateOtp = async () => {
    if (!user?.email) {
      toast.error("Email not found in session", {
        description: "Please sign in again to refresh your session.",
      });
      return;
    }

    if (!token) {
      toast.error("Authentication required", {
        description: "Please sign in again to get a valid token.",
      });
      return;
    }

    setGeneratingOtp(true);
    try {
      const response = await generateOtpApi(user.email, token);
      
      toast.success(response.responsedesc || "OTP generated successfully", {
        description: "Check your email for the OTP code.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate OTP";
      toast.error("OTP generation failed", {
        description: errorMessage,
      });
    } finally {
      setGeneratingOtp(false);
    }
  };

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
        <CardHeader className="flex justify-between flex-row-reverse">
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-md"
            disabled={generatingOtp}
            onClick={handleGenerateOtp}
          >
            {generatingOtp ? "Sending OTP..." : "Send OTP"}
          </Button>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}