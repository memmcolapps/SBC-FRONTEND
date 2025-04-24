import axios, { type AxiosError, type AxiosResponse } from "axios";
import { env } from "@/env";

const AUTH_API_URL = env.NEXT_PUBLIC_BASE_URL;

interface GenerateOtpResponse {
    responsecode: string;
    responsedesc: string;
    responsedata?: {
        otp?: string;
        expiry?: string;
    };
}

export const generateOtpApi = async (
    email: string,
    token: string
): Promise<GenerateOtpResponse> => {
    try {
        console.log("Email sent to backend:", email);
        const formData = new URLSearchParams();
        formData.append('email', email);
        const response: AxiosResponse<GenerateOtpResponse> = await axios.post(
            `${AUTH_API_URL}/organization/operator/api/generate-otp`,
            formData.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        console.log("OTP generation response:", response.data);
        if (response.data.responsecode !== "000") {
            throw new Error(response.data.responsedesc || "Failed to generate OTP");
        }
        return response.data;
    } catch (error: unknown) {
        let errorMessage = "Failed to generate OTP";

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<GenerateOtpResponse>;
            errorMessage = axiosError.response?.data?.responsedesc ?? axiosError.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error("OTP generation error:", errorMessage);
        throw new Error(errorMessage);
    }
};