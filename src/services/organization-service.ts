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
): Promise<OrganizationNode> {
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

    return response.data.responsedata;
  } catch (error: unknown) {
    handleOrganizationError(error);
  }
}

export async function saveOrganizationTree(
  treeData: OrganizationNode,
  token: string,
): Promise<OrganizationNode> {
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

export async function addOrganizationNode(
  parentId: number | string,
  newNode: Omit<OrganizationNode, "id">,
  token: string,
): Promise<OrganizationNode> {
  try {
    const response = await axios.post<OrganizationNodeResponse>(
      `${ORGANIZATION_API_URL}/add-node`,
      {
        parentId,
        node: newNode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data.responsecode !== "000") {
      throw new Error(
        response.data.responsedesc || "Failed to add organization node",
      );
    }

    return response.data.responsedata.node;
  } catch (error: unknown) {
    handleOrganizationError(error);
  }
}

export const updateOrganizationNodes = async (
  nodes: OrganizationNode[],
  token: string,
): Promise<OrganizationNodeResponse> => {
  try {
    const response = await axios.put<OrganizationNodeResponse>(
      `${ORGANIZATION_API_URL}/update-nodes`,
      { nodes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    handleOrganizationError(error);
  }
};

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
