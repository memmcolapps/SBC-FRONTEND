import axios, { type AxiosError } from "axios";
import { env } from "@/env";

const AUTH_API_URL = env.NEXT_PUBLIC_BASE_URL;
const CUSTOM_HEADER = env.NEXT_PUBLIC_CUSTOM_HEADER;

interface LoginResponseData {
  access_token: string;
  user_info: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    contact: string;
    ustate: boolean;
    permission: boolean;
    active: boolean;
    roleId: number;
    hierarchy: number;
    roles: Array<{
      roleId: number;
      operatorRole: string;
    }>;
    nodes: Array<{
      id: number;
      name: string;
      parent_id: number | null;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

interface LoginResponse {
  responsecode: string;
  responsedesc: string;
  responsedata: LoginResponseData;
}

export async function loginApi(
  email: string,
  password: string,
): Promise<LoginResponseData> {
  try {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    const response = await axios.post<LoginResponse>(
      `${AUTH_API_URL}/authentication/api/admin/login`,
      formData,
      {
        headers: {
          custom: CUSTOM_HEADER,
        },
      },
    );

    // Check if the response indicates success
    if (response.data.responsecode !== "001") {
      throw new Error(response.data.responsedesc || "Login failed");
    }

    return response.data.responsedata;
  } catch (error: unknown) {
    let errorMessage = "Login failed";

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<LoginResponse>;

      if (axiosError.response) {
        // Server responded with a status other than 2xx
        errorMessage =
          axiosError.response.data.responsedesc ||
          `Login failed with status: ${axiosError.response.status}`;
      } else if (axiosError.request) {
        // Request was made but no response was received
        errorMessage = "No response received";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Request setup failed: ${axiosError.message}`;
      }
    } else if (error instanceof Error) {
      // Handle other Error instances
      errorMessage = `An unexpected error occurred: ${error.message}`;
    } else {
      // Handle other types of errors (e.g., strings, numbers)
      errorMessage = `An unexpected error occurred: ${String(error)}`;
    }

    console.error("Login API error:", errorMessage);
    throw new Error(errorMessage);
  }
}
