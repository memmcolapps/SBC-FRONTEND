/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/only-throw-error */
import axios, { type AxiosError } from "axios";
import { env } from "@/env";

const AUTH_API_URL = env.NEXT_PUBLIC_BASE_URL;

interface ChangePasswordResponse {
    responsecode: string;
    responsedesc: string;
    responsedata?: any;
    success?: boolean;
    message?: string;
    error?: {
        code?: string;
        message?: string;
    };
}

export const changeUserPasswordApi = async (
    email: string,
    currentPassword: string,
    newPassword: string,
    token: string,
    otp?: string
): Promise<ChangePasswordResponse> => {
    try {
        // Validate inputs
        if (!email || !currentPassword || !newPassword || !token) {
            throw new Error("Missing required parameters");
        }

        // Create form data with correct parameter names
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', currentPassword); // Note the parameter name change
        formData.append('newPassword', newPassword);
        if (otp) formData.append('otp', otp);

        console.log("Request data:", {
            email,
            password: currentPassword, // Masked in real implementation
            newPassword: newPassword,  // Masked in real implementation
            otp: otp ? "****" : undefined
        });

        const response = await axios.patch(
            `${AUTH_API_URL}/organization/operator/api/update/change-password`,
            formData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.data.responsecode !== "001") {
            throw {
                message: response.data.responsedesc || "Password change failed",
                error: {
                    code: response.data.error?.code,
                    message: response.data.responsedesc
                }
            };
        }

        return response.data;

    } catch (error: unknown) {
        let errorMessage = "Failed to change password";
        let errorCode: string | undefined;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ChangePasswordResponse>;
            
            if (axiosError.response) {
                errorMessage = axiosError.response.data?.responsedesc || 
                             `Server error: ${axiosError.response.status}`;
                errorCode = axiosError.response.data?.error?.code;
                
                if (axiosError.response.status === 401) {
                    errorCode = "TOKEN_EXPIRED";
                    errorMessage = "Session expired. Please login again.";
                }
            }
        }

        console.error("Password change failed:", {
            message: errorMessage,
            code: errorCode,
            error
        });

        throw {
            message: errorMessage,
            error: { code: errorCode }
        };
    }
};