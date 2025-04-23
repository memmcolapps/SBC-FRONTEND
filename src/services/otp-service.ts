/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import axios, { type AxiosError } from "axios";
import { env } from "@/env";

const AUTH_API_URL = env.NEXT_PUBLIC_BASE_URL;

interface OtpResponse {
    responsecode: string;
    responsedesc: string;
    responsedata?: any;
}

export const generateOtpApi = async (email: string, token: string): Promise<OtpResponse> => {
    try {
        const response = await axios.post(
            `${AUTH_API_URL}/organization/operator/api/generate-otp`,
            { email },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<OtpResponse>;
        throw new Error(axiosError.response?.data?.responsedesc || "Failed to generate OTP");
    }
};

export const verifyOtpApi = async (email: string, otp: string, token: string): Promise<OtpResponse> => {
    try {
        const response = await axios.post(
            `${AUTH_API_URL}/organization/operator/api/verify-otp`,
            { email, otp },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<OtpResponse>;
        throw new Error(axiosError.response?.data?.responsedesc || "Invalid OTP");
    }
};