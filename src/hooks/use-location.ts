// src/hooks/use-location.ts

import { useQuery } from "@tanstack/react-query";
import {
    fetchNigerianStates,
    fetchNigerianCitiesByState,
} from "@/services/location-service";
import { type NigerianState, type NigerianCity } from "@/types/location";

export const useNigerianStates = () => {
    return useQuery<NigerianState[], Error>({
        queryKey: ["nigerianStates"],
        queryFn: fetchNigerianStates,
        staleTime: Infinity, // States rarely change, so can be very stale
        gcTime: Infinity,
    });
};

export const useNigerianCities = (stateId?: string) => {
    return useQuery<NigerianCity[], Error>({
        queryKey: ["nigerianCities", stateId],
        queryFn: () => fetchNigerianCitiesByState(stateId!), // stateId is guaranteed to be defined if enabled
        enabled: !!stateId, // Only run this query if a stateId is provided
        staleTime: 1000 * 60 * 60, // Cities change infrequently, can be stale for an hour
        gcTime: 1000 * 60 * 60 * 24,
    });
};
