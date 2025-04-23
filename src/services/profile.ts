// src/services/userService.ts
import axios, { type AxiosError, type AxiosResponse } from "axios";
import { env } from "@/env";

const USER_API_URL = env.NEXT_PUBLIC_BASE_URL;

interface UpdateUserPayload {
    operator: {
        firstname?: string;
        lastname?: string;
        email?: string;
        contact?: string;
        hierarchy?: number;
    };
    role: {
        roleId?: number;
        operatorRole?: string;
    };
}

interface UpdateUserResponseData {
    operator: {
        firstname: string;
        lastname: string;
        email: string;
        contact: string;
        hierarchy: number;
    };
    role: {
        roleId: number;
        operatorRole: string;
    };
    updatedAt: string; // Example field from the backend response
}

interface UpdateUserResponse {
    responsecode: string;
    responsedesc: string;
    responsedata: UpdateUserResponseData;
}

export async function updateUser(
    payload: UpdateUserPayload,
    token: string,
): Promise<UpdateUserResponseData> {
    try {
        const response: AxiosResponse<UpdateUserResponse> = await axios.put(
            `${USER_API_URL}/organization/operator/api/update`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (response.data.responsecode !== "000") {
            throw new Error(
                response.data.responsedesc || "Failed to update user record",
            );
        }

        return response.data.responsedata;
    } catch (error: unknown) {
        let errorMessage = "Failed to update user record";

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<UpdateUserResponse>;

            if (axiosError.response) {
                errorMessage =
                    axiosError.response.data.responsedesc ||
                    `Failed to update user record with status: ${axiosError.response.status}`;
            } else if (axiosError.request) {
                errorMessage = "No response received while updating user record";
            } else {
                errorMessage = `Request setup failed: ${axiosError.message}`;
            }
        } else if (error instanceof Error) {
            errorMessage = `An unexpected error occurred: ${error.message}`;
        } else {
            errorMessage = `An unexpected error occurred: ${String(error)}`;
        }

        console.error("Update User API error:", errorMessage);
        throw new Error(errorMessage);
    }
}