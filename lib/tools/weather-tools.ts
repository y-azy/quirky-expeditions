import { z } from "zod";

export const weatherTools = {
  getWeather: {
    description: "Get the current weather at a location",
    parameters: z.object({
      latitude: z.number().describe("Latitude coordinate"),
      longitude: z.number().describe("Longitude coordinate"),
    }),
    execute: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Weather API error: ${response.status} - ${errorText}`);
        }

        const weatherData = await response.json();
        return weatherData;
      } catch (error) {
        console.error("Error fetching weather:", error);
        return {
          error: error instanceof Error ? error.message : "Failed to fetch weather data",
          status: "error"
        };
      }
    },
  }
};
