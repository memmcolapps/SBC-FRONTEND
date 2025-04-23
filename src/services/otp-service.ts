/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios, { type AxiosError } from "axios";
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
        const response = await axios.post(
            `${AUTH_API_URL}/organization/operator/api/generate-otp`,
            formData.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        console.log("Email sent to backend:", email);
        if (response.data.responsecode !== "000") {
            throw new Error(response.data.responsedesc || "Failed to generate OTP");
        }
        return response.data;
    } catch (error) {
        let errorMessage = "Failed to generate OTP";

        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.responsedesc || error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error("OTP generation error:", errorMessage);
        throw new Error(errorMessage);
    }
};