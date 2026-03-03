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
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-medium">Change Password</CardTitle>
          <Button
            className="bg-[#16085F] hover:bg-[#1e0f7a]"
            size="sm"
            disabled={generatingOtp}
            onClick={handleGenerateOtp}
          >
            {generatingOtp ? "Sending OTP..." : "Send OTP"}
          </Button>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
