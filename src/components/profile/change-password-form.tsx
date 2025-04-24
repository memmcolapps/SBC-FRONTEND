import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { changeUserPasswordApi } from "@/services";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
  otp: string;
}

interface BackendError {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
}

export function ChangePasswordForm() {
  const router = useRouter();
  const { getAccessToken, user } = useAuth();
  const [passwords, setPasswords] = useState<PasswordForm>({
    newPassword: "",
    confirmPassword: "",
    otp: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (passwords.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords don't match");
      setIsLoading(false);
      return;
    }

    if (!passwords.otp) {
      setError("OTP is required");
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

      const response = await changeUserPasswordApi(
        user.email,
        passwords.newPassword,
        passwords.confirmPassword,
        token,
        passwords.otp
      );

      if (response.responsecode !== "000") {
        const errorMessage = response.responsedesc ?? "Failed to change password";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      toast.success(response.message ?? "Password changed successfully");
      setPasswords({
        newPassword: "",
        confirmPassword: "",
        otp: ""
      });

    } catch (error: unknown) {
      console.error("Password change failed:", error);
      let errorMessage = "Failed to change password";

      if (error instanceof Error) {
        errorMessage = error.message;
        if ((error as BackendError)?.error?.code === 'TOKEN_EXPIRED') {
          toast.error("Session expired. Please login again.");
          router.push("/login");
          return;
        }
      } else if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
        if (
          'error' in error &&
          typeof (error as BackendError).error === 'object' &&
          (error as BackendError).error !== null &&
          'code' in ((error as BackendError).error ?? {}) &&
          typeof (error as BackendError).error?.code === 'string'
        ) {
          toast.error("Session expired. Please login again.");
          router.push("/login");
          return;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setError(errorMessage);
      toast.error(errorMessage);
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
          <Label htmlFor="otp">OTP</Label>
          <Input
            id="otp"
            type="text"
            value={passwords.otp}
            onChange={(e) =>
              setPasswords(prev => ({
                ...prev,
                otp: e.target.value.replace(/\D/g, '').slice(0, 6),
              }))
            }
            inputMode="numeric"
            required
            placeholder="Enter 6-digit OTP"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword.newPassword ? "text" : "password"}
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords(prev => ({ ...prev, newPassword: e.target.value }))
              }
              required
              minLength={6}
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(prev => ({
                ...prev,
                newPassword: !prev.newPassword
              }))}
            >
              {showPassword.newPassword ? (
                <EyeOff className="text-gray-200" />
              ) : (
                <Eye className="text-gray-200" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPassword.confirmPassword ? "text" : "password"}
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords(prev => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              autoComplete="new-password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(prev => ({
                ...prev,
                confirmPassword: !prev.confirmPassword
              }))}
            >
              {showPassword.confirmPassword ? (
                <EyeOff className="text-gray-200" />
              ) : (
                <Eye className="text-gray-200" />
              )}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Change Password"}
        </Button>
      </form>
    </>
  );
}