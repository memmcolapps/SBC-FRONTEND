/* eslint-disable @typescript-eslint/no-unused-vars */
import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchOperators,
    createOperator,
    editOperator,
    type PaginatedOperators,
    type OperatorForUI,
    type CreateOperatorPayload,
    type FetchOperatorsParams,
} from "@/services/operator-service";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { env } from "@/env";

interface UpdateOperatorStatePayload {
    userId: string;
    state: boolean;
}

// CORRECTED SERVICE FUNCTION
const updateOperatorStatus = async (payload: UpdateOperatorStatePayload, token: string) => {
    // Corrected URL: Removed `/smarte`
    const url = `${env.NEXT_PUBLIC_BASE_URL}/v1/api/operator/service/block?userId=${payload.userId}&state=${payload.state}`;

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responsedesc || 'Failed to update operator status');
    }

    return response.json();
};

interface FetchOperatorsQueryArgs {
    page?: number;
    size?: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    hierarchyId?: string;
}

export function useOperators(
    queryArgs: FetchOperatorsQueryArgs,
): UseQueryResult<PaginatedOperators, Error> {
    const { getAccessToken } = useAuth();
    const token = getAccessToken();

    return useQuery({
        queryKey: ["operators", queryArgs],
        queryFn: async () => {
            if (!token) {
                throw new Error("Authentication token is missing.");
            }
            return fetchOperators({ ...queryArgs, token });
        },
        enabled: !!token,
        staleTime: 1000 * 60,
    });
}

export function useUpdateOperatorStatus(): UseMutationResult<
    OperatorForUI,
    Error,
    UpdateOperatorStatePayload
> {
    const queryClient = useQueryClient();
    const { getAccessToken } = useAuth();

    return useMutation({
        mutationFn: async (payload: UpdateOperatorStatePayload) => {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Authentication token is missing.");
            }
            return updateOperatorStatus(payload, token);
        },
        onSuccess: (data, variables) => {
            // Invalidate the 'operators' query to force a re-fetch and update the UI
            void queryClient.invalidateQueries({ queryKey: ["operators"] });

            // Corrected: Use `data.responsedesc` for the toast message
            toast.success(`${data.responsedesc}`);

            // This is an optional optimistic update, but invalidation above is more reliable
            queryClient.setQueryData<PaginatedOperators | undefined>(["operators"], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    content: oldData.content.map((op) =>
                        // The backend response doesn't provide the new status, so we have to derive it
                        op.id === variables.userId ? { ...op, status: variables.state ? 'BLOCKED' : 'ACTIVE' } : op,
                    ),
                };
            });
        },
        onError: (error) => {
            toast.error(`Failed to update operator status: ${error.message}`);
        },
    });
}

export function useCreateOperator(): UseMutationResult<
    OperatorForUI,
    Error,
    CreateOperatorPayload
> {
    const queryClient = useQueryClient();
    const { getAccessToken } = useAuth();

    return useMutation({
        mutationFn: async (payload: CreateOperatorPayload) => {
            const token = getAccessToken();
            console.log("Create Operator Token:", token);
            console.log("Create Operator Payload:", payload);
            if (!token) {
                throw new Error("Authentication token is missing.");
            }
            return createOperator(payload, token);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["operators"] });
        },
    });
}

export function useEditOperator(): UseMutationResult<
    OperatorForUI,
    Error,
    { id: string; payload: CreateOperatorPayload }
> {
    const queryClient = useQueryClient();
    const { getAccessToken } = useAuth();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: CreateOperatorPayload }) => {
            const token = getAccessToken();
            console.log("Edit Operator Token:", token);
            console.log("Edit Operator Payload:", payload);
            if (!token) {
                throw new Error("Authentication token is missing.");
            }
            return editOperator(id, payload, token);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["operators"] });
        },
    });
}