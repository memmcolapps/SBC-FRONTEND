/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { changeUserPasswordApi, generateOtpApi, verifyOtpApi } from "@/services";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordForm() {
  const router = useRouter();
  const { getAccessToken, user } = useAuth();
  const [passwords, setPasswords] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [generatingOtp, setGeneratingOtp] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);

  // OTP expiry timer
  useEffect(() => {
    if (!otpExpiry || !otpDialogOpen) return;

    const timer = setInterval(() => {
      if (new Date() > otpExpiry) {
        toast.error("OTP has expired");
        setOtpDialogOpen(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [otpExpiry, otpDialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCurrentPasswordError(null);
    setIsLoading(true);

    // Client-side validation
    if (!passwords.currentPassword) {
      setCurrentPasswordError("Current password is required");
      setIsLoading(false);
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const token = getAccessToken();
      if (!token || !user?.email) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      // First try changing password directly
      const response = await changeUserPasswordApi(
        user.email,
        passwords.currentPassword,
        passwords.newPassword,
        token
      );

      // Handle OTP requirement
      if (response.error?.code === 'OTP_REQUIRED' || response.responsecode === "060") {
        setGeneratingOtp(true);
        try {
          await generateOtpApi(user.email, token);
          setOtpDialogOpen(true);
          setOtpExpiry(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes expiry
          toast.info("OTP sent to your email");
          return;
        } catch (otpError) {
          toast.error("Failed to send OTP");
          return;
        } finally {
          setGeneratingOtp(false);
        }
      }

      // Handle other errors
      if (!response.success) {
        if (response.error?.code === 'INCORRECT_CURRENT_PASSWORD') {
          setCurrentPasswordError(response.message ?? "Current password is incorrect");
        } else {
          setError(response.message ?? "Failed to change password");
        }
        toast.error(response.message ?? "Password change failed");
        return;
      }

      // Success case
      toast.success(response.message ?? "Password changed successfully");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error: any) {
      console.error("Password change failed:", error);

      if (error.error?.code === 'TOKEN_EXPIRED') {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      const errorMessage = error.message || "Failed to change password";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setOtpLoading(true);
    try {
      const token = getAccessToken();
      if (!token || !user?.email) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      // 1. Verify OTP first
      await verifyOtpApi(user.email, otp, token);

      // 2. Change password with verified OTP
      const response = await changeUserPasswordApi(
        user.email,
        passwords.currentPassword,
        passwords.newPassword,
        token,
        otp // Include OTP in final request
      );

      if (!response.success) {
        throw new Error(response.message || "Password change failed after OTP verification");
      }

      // Success
      toast.success("Password changed successfully");
      setOtpDialogOpen(false);
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "OTP verification failed";
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => {
              setPasswords(prev => ({
                ...prev,
                currentPassword: e.target.value,
              }));
              setCurrentPasswordError(null);
            }}
            required
            autoComplete="current-password"
            className={currentPasswordError ? "border-red-500" : ""}
          />
          {currentPasswordError && (
            <p className="text-sm text-red-500">{currentPasswordError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords(prev => ({ ...prev, newPassword: e.target.value }))
            }
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords(prev => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            required
            autoComplete="new-password"
          />
        </div>

        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700"
          disabled={isLoading || generatingOtp}
        >
          {isLoading ? "Processing..." : generatingOtp ? "Sending OTP..." : "Change Password"}
        </Button>
      </form>

      {/* OTP Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setOtp("");
        }
        setOtpDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OTP Verification</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to {user?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
              }}
              inputMode="numeric"
              disabled={otpLoading}
            />

            {otpExpiry && (
              <div className="text-sm text-gray-500">
                OTP expires in: {Math.floor((otpExpiry.getTime() - Date.now()) / 60000)}:
                {String(Math.floor((otpExpiry.getTime() - Date.now()) / 1000 % 60)).padStart(2, '0')}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const token = getAccessToken();
                    if (token && user?.email) {
                      setGeneratingOtp(true);
                      await generateOtpApi(user.email, token);
                      setOtpExpiry(new Date(Date.now() + 10 * 60 * 1000));
                      toast.success("New OTP sent");
                    }
                  } catch (error) {
                    toast.error("Failed to resend OTP");
                  } finally {
                    setGeneratingOtp(false);
                  }
                }}
                disabled={generatingOtp}
              >
                {generatingOtp ? "Sending..." : "Resend OTP"}
              </Button>
              <Button
                onClick={handleOtpSubmit}
                disabled={otpLoading || otp.length < 6}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}