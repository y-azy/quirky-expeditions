import { z } from "zod";

// Schema types for reuse
export const airportSchema = z.object({
  iataCode: z.string().describe("Airport IATA code"),
  name: z.string().describe("Airport name"),
  cityName: z.string().describe("City name"),
  countryName: z.string().optional().describe("Country name"),
});

export const departureLightSchema = z.object({
  cityName: z.string().describe("Name of the departure city"),
  airportCode: z.string().describe("Code of the departure airport"),
  timestamp: z.string().describe("ISO 8601 date of departure"),
});

export const arrivalLightSchema = z.object({
  cityName: z.string().describe("Name of the arrival city"),
  airportCode: z.string().describe("Code of the arrival airport"),
  timestamp: z.string().describe("ISO 8601 date of arrival"),
});

export const departureFullSchema = departureLightSchema.extend({
  gate: z.string().optional().describe("Departure gate"),
  terminal: z.string().optional().describe("Departure terminal"),
  airportName: z.string().optional().describe("Name of the departure airport"),
});

export const arrivalFullSchema = arrivalLightSchema.extend({
  gate: z.string().optional().describe("Arrival gate"),
  terminal: z.string().optional().describe("Arrival terminal"),
  airportName: z.string().optional().describe("Name of the arrival airport"),
});
