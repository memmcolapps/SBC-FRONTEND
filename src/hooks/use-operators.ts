/* eslint-disable @typescript-eslint/no-unused-vars */
import { type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchOperators,
    updateOperatorStatus,
    createOperator,
    editOperator,
    type PaginatedOperators,
    type OperatorForUI,
    type CreateOperatorPayload,
    type FetchOperatorsParams,
} from "@/services/operator-service";
import { useAuth } from "@/context/auth-context";

// Fix: Changed `hierarchyId` from number to string to match the `FetchOperatorsParams` type.
// This resolves the type incompatibility error.
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
        // The `queryFn` now directly uses the `queryArgs` without casting.
        queryFn: async () => {
            if (!token) {
                throw new Error("Authentication token is missing.");
            }
            // Fix: The type of `hierarchyId` now matches the `FetchOperatorsParams` interface.
            return fetchOperators({ ...queryArgs, token });
        },
        enabled: !!token,
        staleTime: 1000 * 60,
    });
}

interface UpdateOperatorStatusMutationArgs {
    id: string;
    status: "ACTIVE" | "INACTIVE";
}

export function useUpdateOperatorStatus(): UseMutationResult<
    OperatorForUI,
    Error,
    UpdateOperatorStatusMutationArgs
> {
    const queryClient = useQueryClient();
    const { getAccessToken } = useAuth();

    return useMutation({
        mutationFn: async ({ id, status }: UpdateOperatorStatusMutationArgs) => {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Authentication token is missing.");
            }
            return updateOperatorStatus(id, status, token);
        },
        onSuccess: (data, variables) => {
            void queryClient.invalidateQueries({ queryKey: ["operators"] });
            queryClient.setQueryData<PaginatedOperators | undefined>(["operators"], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    content: oldData.content.map((op) =>
                        op.id === variables.id ? { ...op, status: data.status } : op,
                    ),
                };
            });
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