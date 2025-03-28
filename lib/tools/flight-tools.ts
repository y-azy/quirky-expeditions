import { z } from "zod";
import { 
  getFlightStatus, 
  getFlightPrice, 
  searchFlights,
  getSeatMap,
  getFlightInspirationSearch,
  getCheapestFlightDates
} from "@/lib/amadeus-helpers";
import { departureFullSchema, arrivalFullSchema } from "./schemas";

export const flightTools = {
  displayFlightStatus: {
    description: "Display the status of a flight",
    parameters: z.object({
      carrierCode: z.string().describe("Airline carrier code (e.g., AA, BA)"),
      flightNumber: z.string().describe("Flight number without carrier code"),
      date: z.string().describe("Flight date (YYYY-MM-DD)"),
    }),
    execute: async ({ carrierCode, flightNumber, date }: { 
      carrierCode: string; 
      flightNumber: string; 
      date: string 
    }) => {
      try {
        const status = await getFlightStatus({
          carrierCode,
          flightNumber,
          scheduledDate: date,
        });
        
        return {
          flightNumber: `${carrierCode}${flightNumber}`,
          departure: {
            cityName: status.departure.cityName || status.departure.iataCode,
            airportCode: status.departure.iataCode,
            airportName: status.departure.airportName || `${status.departure.iataCode} Airport`,
            timestamp: status.departure.at || status.departure.scheduledTime,
            terminal: status.departure.terminal || "Main",
            gate: status.departure.gate || "TBA",
          },
          arrival: {
            cityName: status.arrival.cityName || status.arrival.iataCode,
            airportCode: status.arrival.iataCode,
            airportName: status.arrival.airportName || `${status.arrival.iataCode} Airport`,
            timestamp: status.arrival.at || status.arrival.scheduledTime,
            terminal: status.arrival.terminal || "Main",
            gate: status.arrival.gate || "TBA",
          },
          totalDistanceInMiles: status.distance || 0,
        };
      } catch (error) {
        console.error("Error fetching flight status:", error);
        return {
          error: error instanceof Error ? error.message : "Failed to retrieve flight status",
          status: "error",
          message: "Unable to retrieve flight status information at this time."
        };
      }
    },
  },
  searchFlights: {
    description: "Search for flights based on the given parameters",
    parameters: z.object({
      origin: z.string().describe("Origin airport or city IATA code"),
      destination: z.string().describe("Destination airport or city IATA code"),
      departureDate: z.string().describe("Departure date (YYYY-MM-DD)"),
      returnDate: z.string().optional().describe("Return date for round trip (YYYY-MM-DD)"),
      adults: z.string().optional().describe("Number of adult passengers"),
    }),
    execute: async ({ origin, destination, departureDate, returnDate, adults }: { 
      origin: string; 
      destination: string; 
      departureDate: string; 
      returnDate?: string; 
      adults?: string 
    }) => {
      try {
        const flightOffers = await searchFlights({
          origin,
          destination,
          departureDate,
          returnDate,
          adults
        });

        if (!flightOffers || flightOffers.length === 0) {
          return {
            flights: [],
            status: "no_results",
            message: "No flights found for the specified criteria."
          };
        }

        const flights = flightOffers.map((offer: any) => {
          // Extract the first segment for simplicity
          const firstSegment = offer.itineraries[0].segments[0];
          
          return {
            id: offer.id,
            flightOfferId: offer.id, // Store for later use
            departure: {
              cityName: firstSegment.departure.iataCode,
              airportCode: firstSegment.departure.iataCode,
              timestamp: firstSegment.departure.at,
            },
            arrival: {
              cityName: firstSegment.arrival.iataCode,
              airportCode: firstSegment.arrival.iataCode,
              timestamp: firstSegment.arrival.at,
            },
            airlines: [offer.validatingAirlineCodes[0]],
            flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
            priceInUSD: parseFloat(offer.price.total),
            numberOfStops: offer.itineraries[0].segments.length - 1,
            raw: offer // Store raw offer for later use
          };
        });

        return { flights };
      } catch (error) {
        console.error("Error searching flights:", error);
        return {
          flights: [],
          error: error instanceof Error ? error.message : "Failed to search flights",
          status: "error",
          message: "Unable to search for flights at this time."
        };
      }
    },
  },
  selectSeats: {
    description: "Select seats for a flight",
    parameters: z.object({
      flightNumber: z.string().describe("Flight number"),
      flightOfferId: z.string().describe("Flight offer ID from search results"),
    }),
    execute: async ({ flightNumber, flightOfferId }: { 
      flightNumber: string; 
      flightOfferId: string 
    }) => {
      try {
        // Validate flightOfferId to prevent API errors
        if (!flightOfferId || flightOfferId === "1") {
          return { 
            flightNumber,
            flightOfferId,
            seats: [],
            status: "no_seats",
            message: "No seat information available for this flight."
          };
        }
        
        const seatMap = await getSeatMap({ flightOfferId });
        const seats = [];
        
        if (seatMap.data && seatMap.data.decks) {
          for (const deck of seatMap.data.decks) {
            for (const row of deck.rows || []) {
              for (const seat of row.seats || []) {
                if (seat) {
                  seats.push({
                    seatNumber: seat.number,
                    priceInUSD: parseFloat(seat.travelerPricing?.[0]?.price?.total || '0'),
                    isAvailable: seat.travelerPricing?.[0]?.status === 'AVAILABLE',
                    cabin: seat.travelerPricing?.[0]?.cabin || seat.cabin || 'ECONOMY'
                  });
                }
              }
            }
          }
        }
        
        return { 
          flightNumber,
          flightOfferId,
          seats: seats.length > 0 ? seats : [],
          status: seats.length === 0 ? "no_seats" : "success",
          message: seats.length === 0 ? "No seat information available for this flight." : undefined
        };
      } catch (error) {
        console.error("Error selecting seats:", error);
        return { 
          flightNumber,
          flightOfferId,
          seats: [],
          error: error instanceof Error ? error.message : "Unable to retrieve seat map information",
          status: "error",
          message: "Unable to retrieve seat map information at this time."
        };
      }
    },
  },
  getFlightPriceMetrics: {
    description: "Get flight price analysis",
    parameters: z.object({
      origin: z.string().describe("Origin airport IATA code"),
      destination: z.string().describe("Destination airport IATA code"),
      date: z.string().describe("Flight date YYYY-MM-DD"),
    }),
    execute: async ({ origin, destination, date }: { 
      origin: string; 
      destination: string; 
      date: string 
    }) => {
      try {
        const priceMetrics = await getFlightPrice({
          origin,
          destination,
          departureDate: date,
        });
        return priceMetrics;
      } catch (error) {
        console.error("Error fetching flight price metrics:", error);
        return { 
          error: error instanceof Error ? error.message : "Failed to fetch price metrics",
          status: "error",
          message: "Unable to retrieve flight price information at this time."
        };
      }
    },
  },
  getFlightInspirations: {
    description: "Get flight inspiration suggestions from an origin",
    parameters: z.object({
      origin: z.string().describe("Origin airport IATA code"),
      maxPrice: z.number().optional().describe("Maximum price in USD"),
    }),
    execute: async ({ origin, maxPrice }: { 
      origin: string; 
      maxPrice?: number 
    }) => {
      try {
        const result = await getFlightInspirationSearch({ origin, maxPrice });
        
        // Check if we have an error or warning in the response
        if (result.errors || (result.warnings && result.data.length === 0)) {
          return {
            message: "Flight inspiration search unavailable for this origin.",
            detail: "This functionality may be limited in test mode or for this airport.",
            status: "no_results"
          };
        }
        
        return {
          ...result,
          status: "success"
        };
      } catch (error) {
        console.error("Error fetching flight inspirations:", error);
        return {
          error: error instanceof Error ? error.message : "Failed to fetch flight inspirations",
          status: "error",
          message: "Unable to retrieve flight inspiration suggestions at this time."
        };
      }
    }
  },
  getCheapestDates: {
    description: "Get cheapest dates for flights between two locations",
    parameters: z.object({
      origin: z.string().describe("Origin airport IATA code"),
      destination: z.string().describe("Destination airport IATA code"),
    }),
    execute: async ({ origin, destination }: { 
      origin: string; 
      destination: string 
    }) => {
      try {
        const result = await getCheapestFlightDates({ origin, destination });
        
        // Handle structured errors in the response
        if (result.errors && result.errors.length > 0) {
          return {
            origin,
            destination,
            dates: [],
            error: result.errors[0].detail,
            status: "error",
            message: "This route may not be available in the current environment."
          };
        }
        
        return {
          ...result,
          status: "success"
        };
      } catch (error) {
        console.error("Error fetching cheapest flight dates:", error);
        // Ensure we always return a valid object
        return {
          origin,
          destination,
          dates: [],
          error: error instanceof Error ? error.message : "Service unavailable",
          status: "error",
          message: "Unable to retrieve cheapest flight dates at this time."
        };
      }
    }
  }
};
