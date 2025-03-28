import { z } from "zod";
import { getAirlineDetails } from "@/lib/amadeus-helpers";

export const airlineTools = {
  getAirlineInfo: {
    description: "Get airline information by IATA code",
    parameters: z.object({
      airlineCode: z.string().describe("Airline IATA code"),
    }),
    execute: async ({ airlineCode }: { airlineCode: string }) => {
      try {
        const airlineInfo = await getAirlineDetails(airlineCode);
        return airlineInfo;
      } catch (error) {
        console.error("Error fetching airline info:", error);
        return { 
          iataCode: airlineCode,
          error: error instanceof Error ? error.message : "Failed to fetch detailed airline information",
          status: "error",
          message: "Unable to retrieve airline information at this time."
        };
      }
    },
  }
};
