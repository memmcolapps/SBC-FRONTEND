// src/services/location-service.ts

import axios from "axios";
import { type NigerianState, type NigerianCity } from "@/types/location";

// Base URL for the static GeoJSON data
const NIGERIA_LOC_GEOJSON_BASE_URL = "https://temikeezy.github.io/nigeria-geojson-data/data";

interface GeoJSONState {
    state: string;
    lgas: { name: string }[]; // Assuming LGAs are nested within the state object
}

// Function to fetch Nigerian states from the GeoJSON data
export const fetchNigerianStates = async (): Promise<NigerianState[]> => {
    try {
        // Fetch the full.json which contains states and their LGAs
        const response = await axios.get<GeoJSONState[]>(`${NIGERIA_LOC_GEOJSON_BASE_URL}/full.json`);

        // Map the data to your NigerianState type
        return response.data
            .map((item: GeoJSONState) => ({
                // Using state name as ID, you might want to create a more robust ID if available
                id: item.state.toLowerCase().replace(/\s+/g, '-'),
                name: item.state,
            }))
            // Filter out any potential duplicates or invalid entries if necessary,
            // though the GeoJSON data is expected to be clean.
            .filter(state => state.id.trim() !== '' && state.name.trim() !== '');
    } catch (error: any) {
        console.error("Error fetching Nigerian states from GeoJSON:", error);
        // Provide a more specific error message
        throw new Error("Failed to fetch states from GeoJSON data. Please check the URL or your network connection.");
    }
};

// Function to fetch Nigerian cities (LGAs) by state from the GeoJSON data
export const fetchNigerianCitiesByState = async (
    stateId: string,
): Promise<NigerianCity[]> => {
    try {
        // Fetch the full.json which contains states and their LGAs
        const response = await axios.get<GeoJSONState[]>(`${NIGERIA_LOC_GEOJSON_BASE_URL}/full.json`);

        // Find the specific state by its ID (which is the lowercased, hyphenated name)
        const selectedState = response.data.find(
            (item: GeoJSONState) => item.state.toLowerCase().replace(/\s+/g, '-') === stateId
        );

        if (!selectedState) {
            return []; // Return empty array if state not found
        }

        // Map the LGAs of the found state to your NigerianCity type
        return selectedState.lgas
            .map((lga: { name: string }) => ({
                id: lga.name.toLowerCase().replace(/\s+/g, '-'),
                name: lga.name,
                stateId: stateId, // Use the passed stateId
            }))
            .filter(city => city.id.trim() !== '' && city.name.trim() !== '');
    } catch (error: any) {
        console.error(`Error fetching cities for state ${stateId} from GeoJSON:`, error);
        // Provide a more specific error message
        throw new Error(`Failed to fetch cities for state ${stateId} from GeoJSON data. Please check the URL or your network connection.`);
    }
};
