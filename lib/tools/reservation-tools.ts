import { z } from "zod";
import { generateUUID } from "@/lib/utils";
import { confirmFlightPrice, getSeatMap } from "@/lib/amadeus-helpers";
import { createReservation, createFlightBooking, getReservationById } from "@/db/queries";
import { auth } from "@/app/(auth)/auth";
import { departureFullSchema, arrivalFullSchema } from "./schemas";

export const reservationTools = {
  createReservation: {
    description: "Display pending reservation details",
    parameters: z.object({
      seats: z.string().array().describe("Array of selected seat numbers"),
      flightNumber: z.string().describe("Flight number"),
      flightOfferId: z.string().describe("Flight offer ID from search results"),
      departure: departureFullSchema,
      arrival: arrivalFullSchema,
      passengerName: z.string().describe("Name of the passenger"),
    }),
    execute: async (props: {
      seats: string[];
      flightNumber: string;
      flightOfferId: string;
      departure: {
        cityName: string;
        airportCode: string;
        timestamp: string;
        gate?: string;
        terminal?: string;
        airportName?: string;
      };
      arrival: {
        cityName: string;
        airportCode: string;
        timestamp: string;
        gate?: string;
        terminal?: string;
        airportName?: string;
      };
      passengerName: string;
    }) => {
      try {
        // Calculate price based on flight offer and seats
        // NO MOCK DATA OR FALLBACKS - must get real data or fail
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
          return { 
            error: "User is not signed in to perform this action!",
            status: "error",
            message: "You must be signed in to create a reservation."
          };
        }
        
        try {
          // Get real pricing data from Amadeus
          const pricingResponse = await confirmFlightPrice(props.flightOfferId);
          if (!pricingResponse || !pricingResponse.flightOffers || !pricingResponse.flightOffers[0]) {
            throw new Error("Invalid pricing data returned from Amadeus");
          }
          
          let totalPriceInUSD = parseFloat(pricingResponse.flightOffers[0].price.total);
          
          // Add seat prices
          const seatMap = await getSeatMap({ flightOfferId: props.flightOfferId });
          if (!seatMap.data || !seatMap.data.decks) {
            throw new Error("Could not retrieve seat map data");
          }
          
          for (const seatNumber of props.seats) {
            let seatFound = false;
            for (const deck of seatMap.data.decks) {
              for (const row of deck.rows || []) {
                for (const seat of row.seats || []) {
                  if (seat && seat.number === seatNumber && seat.travelerPricing?.[0]?.price?.total) {
                    totalPriceInUSD += parseFloat(seat.travelerPricing[0].price.total);
                    seatFound = true;
                  }
                }
              }
            }
            if (!seatFound) {
              console.warn(`Seat ${seatNumber} not found in seat map or has no pricing data`);
            }
          }
          
          const id = generateUUID();
          await createReservation({
            id,
            userId: session.user.id,
            details: { ...props, totalPriceInUSD },
          });
          
          // Create flight booking record
          await createFlightBooking({
            reservationId: id,
            flightNumber: props.flightNumber,
            flightOfferId: props.flightOfferId,
            seatNumbers: props.seats,
            totalPrice: totalPriceInUSD,
          });
          
          return { 
            id, 
            ...props, 
            totalPriceInUSD,
            hasCompletedPayment: false,
            status: "success"
          };
          
        } catch (apiError) {
          console.error("Error with Amadeus API:", apiError);
          return { 
            error: apiError instanceof Error ? apiError.message : "Failed to get pricing from Amadeus",
            status: "error",
            message: "Unable to get accurate pricing information. Please try again or select another flight."
          };
        }
        
      } catch (error) {
        console.error("Error creating reservation:", error);
        return { 
          error: error instanceof Error ? error.message : "Failed to create reservation",
          status: "error",
          message: "Unable to create your reservation at this time. Please try again later."
        };
      }
    },
  },
  displayBoardingPass: {
    description: "Display a boarding pass",
    parameters: z.object({
      reservationId: z.string().describe("Unique identifier for the reservation"),
      passengerName: z.string().describe("Name of the passenger, in title case"),
      flightNumber: z.string().describe("Flight number"),
      seat: z.string().describe("Seat number"),
      departure: departureFullSchema,
      arrival: arrivalFullSchema,
    }),
    execute: async (boardingPass: {
      reservationId: string;
      passengerName: string;
      flightNumber: string;
      seat: string;
      departure: {
        cityName: string;
        airportCode: string;
        airportName: string;
        timestamp: string;
        terminal: string;
        gate: string;
      };
      arrival: {
        cityName: string;
        airportCode: string;
        airportName: string;
        timestamp: string;
        terminal: string;
        gate: string;
      };
    }) => {
      try {
        // Verify payment before showing boarding pass
        const reservation = await getReservationById({ id: boardingPass.reservationId });
        if (!reservation.hasCompletedPayment) {
          return { 
            error: "Payment not completed. Cannot display boarding pass.",
            status: "error",
            message: "Your payment must be completed before viewing the boarding pass."
          };
        }
        return {
          ...boardingPass,
          status: "success"
        };
      } catch (error) {
        console.error("Error displaying boarding pass:", error);
        return { 
          error: error instanceof Error ? error.message : "Failed to display boarding pass",
          status: "error",
          message: "Unable to display your boarding pass at this time."
        };
      }
    },
  },
};
