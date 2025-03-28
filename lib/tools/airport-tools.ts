import { z } from "zod";
import { searchAirports, getAirportDetails } from "@/lib/amadeus-helpers";

export const airportTools = {
  searchAirports: {
    description: "Search for airports by keyword",
    parameters: z.object({
      keyword: z.string().describe("Airport name or city"),
    }),
    execute: async ({ keyword }: { keyword: string }) => {
      try {
        const airports = await searchAirports(keyword);
        return airports;
      } catch (error) {
        console.error("Error searching airports:", error);
        return { 
          error: error instanceof Error ? error.message : "Error searching airports",
          status: "error",
          message: "Unable to retrieve airport information at this time."
        };
      }
    },
  },
  getAirportInfo: {
    description: "Get airport information",
    parameters: z.object({
      iataCode: z.string().describe("Airport IATA code"),
    }),
    execute: async ({ iataCode }: { iataCode: string }) => {
      try {
        const airportInfo = await getAirportDetails(iataCode);
        return airportInfo;
      } catch (error) {
        console.error("Error fetching airport info:", error);
        return { 
          iataCode,
          error: error instanceof Error ? error.message : "Failed to fetch detailed airport information",
          status: "error",
          message: "Unable to retrieve detailed airport information at this time."
        };
      }
    },
  },
};
