import Amadeus from "amadeus";
import { config } from "dotenv";

config({
  path: ".env.local",
});

if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
  throw new Error("Missing Amadeus credentials");
}

// Initialize the Amadeus client with proper error handling
export const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || '',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
  tokenUrl: process.env.AMADEUS_TOKEN_URL
});

// Type definition for flight offers
export interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  lastTicketingDate: string;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{
      amount: string;
      type: string;
    }>;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
      };
    }>;
  }>;
}

export interface SeatMap {
  data: Array<{
    id: string;
    numberOfSeats: number;
    aircraft: {
      code: string;
    };
    cabin: Array<{
      name: string;
      layout: string;
      rows: Array<{
        number: string;
        seats: Array<{
          number: string;
          cabin: string;
          coordinates: {
            x: number;
            y: number;
          };
          travelerPricing: Array<{
            travelerId: string;
            seatAvailabilityStatus: string;
            price: {
              currency: string;
              total: string;
            };
          }>;
        }>;
      }>;
    }>;
  }>;
}

// Remove this check since we're handling it properly above
// and it's causing a false warning
