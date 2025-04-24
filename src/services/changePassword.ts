import axios, { type AxiosError, type AxiosResponse } from "axios";
import { env } from "@/env";

const AUTH_API_URL = env.NEXT_PUBLIC_BASE_URL;

interface ChangePasswordResponse {
    responsecode: string;
    responsedesc: string;
    responsedata?: Record<string, unknown>;
    success?: boolean;
    message?: string;
    error?: {
        code?: string;
        message?: string;
    };
}

export const changeUserPasswordApi = async (
    email: string,
    newPassword: string,
    confirmPassword: string,
    token: string,
    otp?: string
): Promise<ChangePasswordResponse> => {
    try {
        // Validate inputs
        if (!email || !newPassword || !confirmPassword || !token) {
            throw new Error("Missing required parameters");
        }

        // Create form data
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', newPassword);
        formData.append('retype_password', confirmPassword);
        if (otp) {
            formData.append('otp', otp);
        }

        console.log("Request data:", {
            email,
            password: "****",
            retype_password: "****",
            otp: otp ? "****" : undefined
        });

        const response: AxiosResponse<ChangePasswordResponse> = await axios.post(
            `${AUTH_API_URL}/organization/operator/api/update/change-password`,
            formData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        // First check if the response indicates success
        if (response.data.responsecode === "000") {
            return response.data;
        }

        // If not successful, construct an error object
        const errorData: ChangePasswordResponse = {
            responsecode: response.data.responsecode || "999",
            responsedesc: response.data.responsedesc || "Password change failed",
            message: response.data.responsedesc || "Password change failed",
            error: {
                code: response.data.error?.code,
                message: response.data.responsedesc
            }
        };
        throw new Error(errorData.message);
    } catch (error: unknown) {
        let errorMessage = "Failed to change password";
        let errorCode: string | undefined;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ChangePasswordResponse>;

            if (axiosError.response) {
                // Use the server's error message if available
                errorMessage = axiosError.response.data?.responsedesc ??
                    axiosError.response.data?.message ??
                    `Server error: ${axiosError.response.status}`;
                errorCode = axiosError.response.data?.error?.code;

                if (axiosError.response.status === 401) {
                    errorCode = "TOKEN_EXPIRED";
                    errorMessage = "Session expired. Please login again.";
                }
            } else if (axiosError.request) {
                errorMessage = "No response received from server";
            } else {
                errorMessage = axiosError.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        console.error("Password change failed:", {
            message: errorMessage,
            code: errorCode,
            error
        });

        // Construct and throw a more informative error object
        throw new Error(errorMessage);
    }
};