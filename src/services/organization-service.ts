// src/services/organizationService.ts
import axios, { type AxiosError } from "axios";
import { env } from "@/env";
import type {
  OrganizationNode,
  OrganizationTreeResponse,
  OrganizationNodeResponse,
  OrganizationErrorResponse,
} from "@/types";

const ORGANIZATION_API_URL = `${env.NEXT_PUBLIC_BASE_URL}/organization/api`;

export async function fetchOrganizationTree(
  token: string,
): Promise<OrganizationNode[]> {
  try {
    const response = await axios.get<OrganizationTreeResponse>(
      `${ORGANIZATION_API_URL}/get-nodes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data.responsecode !== "000") {
      throw new Error(
        response.data.responsedesc || "Failed to fetch organization tree",
      );
    }

    if (!response.data.responsedata) {
      throw new Error("Invalid organization tree response");
    }

    return response.data.responsedata;
  } catch (error: unknown) {
    handleOrganizationError(error);
  }
}

export async function saveOrganizationTree(
  treeData: OrganizationNode,
  token: string,
): Promise<OrganizationNode[]> {
  try {
    const response = await axios.post<OrganizationTreeResponse>(
      `${ORGANIZATION_API_URL}/create-nodes`,
      treeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data.responsecode !== "000") {
      throw new Error(
        response.data.responsedesc || "Failed to save organization tree",
      );
    }

    return response.data.responsedata;
  } catch (error: unknown) {
    handleOrganizationError(error);
  }
}

export async function updateSingleNode(
  node: OrganizationNode,
  token: string,
): Promise<OrganizationNode> {
  try {
    const response = await axios.patch<OrganizationNodeResponse>(
      `${ORGANIZATION_API_URL}/update-single-node`,
      node,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data.responsecode !== "000") {
      throw new Error(
        response.data.responsedesc || "Failed to update organization node",
      );
    }

    return response.data.responsedata.node;
  } catch (error: unknown) {
    handleOrganizationError(error);
  }
}

export async function createSingleNode(
  newNode: Omit<OrganizationNode, "id">,
  token: string,
): Promise<boolean> {
  try {
    const response = await axios.post<OrganizationNodeResponse>(
      `${ORGANIZATION_API_URL}/create-single-node`,
      newNode,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.responsecode !== "000") {
      throw new Error(
        response.data.responsedesc || "Failed to create organization node",
      );
    }

    // Return true if the creation was successful
    return true;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errData = error.response.data as OrganizationErrorResponse;
      if (errData.responsedesc) {
        throw new Error(errData.responsedesc);
      }
    }
    throw error;
  }
}

export async function deleteOrganizationNode(
  nodeId: number | string,
  token: string,
): Promise<void> {
  try {
    console.log("Deleting node with id:", nodeId);
  } catch (error: unknown) {
    handleOrganizationError(error);
  }
}

function handleOrganizationError(error: unknown): never {
  let errorMessage = "An error occurred while processing organization data";

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<OrganizationErrorResponse>;

    if (axiosError.response) {
      errorMessage =
        axiosError.response.data.responsedesc ||
        `Request failed with status ${axiosError.response.status}`;
    } else if (axiosError.request) {
      errorMessage = "No response received from organization service";
    } else {
      errorMessage = `Request setup error: ${axiosError.message}`;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  console.error("Organization Service Error:", errorMessage);
  throw new Error(errorMessage);
}
