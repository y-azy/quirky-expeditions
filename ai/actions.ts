import { generateObject } from "ai";
import { z } from "zod";

import { amadeus } from "@/lib/amadeus";
import { geminiFlashModel } from ".";
import { searchFlights, getSeatMap, confirmFlightPrice, getFlightStatus } from '@/lib/amadeus-helpers';

export async function generateFlightStatus(params: {
  carrierCode: string;
  flightNumber: string;
  date: string;
}) {
  try {
    const status = await getFlightStatus({
      carrierCode: params.carrierCode,
      flightNumber: params.flightNumber,
      scheduledDate: params.date,
    });

    if (!status) {
      throw new Error("Unable to retrieve flight status");
    }

    return {
      flightNumber: `${params.carrierCode}${params.flightNumber}`,
      status: status.flightStatus || "UNKNOWN",
      aircraft: status.aircraft?.code || "Unknown",
      departure: {
        cityName: status.departure?.cityName || status.departure?.iataCode || "Unknown",
        airportCode: status.departure?.iataCode || "Unknown",
        timestamp: status.departure?.scheduledTime || new Date().toISOString(),
        terminal: status.departure?.terminal || undefined,
        gate: status.departure?.gate || undefined,
      },
      arrival: {
        cityName: status.arrival?.cityName || status.arrival?.iataCode || "Unknown",
        airportCode: status.arrival?.iataCode || "Unknown",
        timestamp: status.arrival?.scheduledTime || new Date().toISOString(),
        terminal: status.arrival?.terminal || undefined,
        gate: status.arrival?.gate || undefined,
      },
      error: null,
      status: "success"
    };
  } catch (error) {
    console.error('Error generating flight status:', error);
    return {
      error: error instanceof Error ? error.message : "Failed to retrieve flight status",
      status: "error",
      message: "Unable to retrieve flight status information at this time."
    };
  }
}
