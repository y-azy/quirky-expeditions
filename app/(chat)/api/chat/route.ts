import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { model as openAIModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
  createFlightBooking,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";
import { 
  searchAirports, 
  getFlightStatus, 
  getFlightDelay, 
  getAirlineDetails, 
  getFlightPrice, 
  getAirportDetails,
  searchFlights,
  getSeatMap,
  confirmFlightPrice,
  createFlightOrder,
  getFlightInspirationSearch,
  getCheapestFlightDates
} from "@/lib/amadeus-helpers";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: openAIModel,
    system: `AI travel agent using Amadeus API. Help with flights, bookings & travel tips. Current: ${new Date().toLocaleDateString()}.`,
    messages: coreMessages,
    tools: {
      searchAirports: {
        description: "Search for airports by keyword",
        parameters: z.object({
          keyword: z.string().describe("Airport name or city"),
        }),
        execute: async ({ keyword }) => {
          try {
            const airports = await searchAirports(keyword);
            return airports;
          } catch (error) {
            console.error("Error searching airports:", error);
            return [{ 
              name: "Error searching airports", 
              iataCode: "ERR", 
              cityName: "Please try again" 
            }];
          }
        },
      },
      getWeather: {
        description: "Get the current weather at a location",
        parameters: z.object({
          latitude: z.number().describe("Latitude coordinate"),
          longitude: z.number().describe("Longitude coordinate"),
        }),
        execute: async ({ latitude, longitude }) => {
          try {
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
            );

            const weatherData = await response.json();
            return weatherData;
          } catch (error) {
            console.error("Error fetching weather:", error);
            return {
              error: "Failed to fetch weather data"
            };
          }
        },
      },
      displayFlightStatus: {
        description: "Display the status of a flight",
        parameters: z.object({
          carrierCode: z.string().describe("Airline carrier code (e.g., AA, BA)"),
          flightNumber: z.string().describe("Flight number without carrier code"),
          date: z.string().describe("Flight date (YYYY-MM-DD)"),
        }),
        execute: async ({ carrierCode, flightNumber, date }) => {
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
            // Return mock data as fallback
            return {
              flightNumber: `${carrierCode}${flightNumber}`,
              departure: {
                cityName: "Origin",
                airportCode: "ORG",
                airportName: "Origin Airport",
                timestamp: new Date().toISOString(),
                terminal: "TBA",
                gate: "TBA",
              },
              arrival: {
                cityName: "Destination",
                airportCode: "DST",
                airportName: "Destination Airport",
                timestamp: new Date(Date.now() + 3600000).toISOString(),
                terminal: "TBA",
                gate: "TBA",
              },
              totalDistanceInMiles: 0,
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
        execute: async ({ origin, destination, departureDate, returnDate, adults }) => {
          try {
            const flightOffers = await searchFlights({
              origin,
              destination,
              departureDate,
              returnDate,
              adults
            });

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
            throw new Error("Flight search unavailable.");
          }
        },
      },
      selectSeats: {
        description: "Select seats for a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
          flightOfferId: z.string().describe("Flight offer ID from search results"),
        }),
        execute: async ({ flightNumber, flightOfferId }) => {
          try {
            // Validate flightOfferId to prevent API errors
            if (!flightOfferId || flightOfferId === "1") {
              return { 
                flightNumber,
                flightOfferId,
                seats: [],
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
              message: seats.length === 0 ? "No seat information available for this flight." : undefined
            };
          } catch (error) {
            console.error("Error selecting seats:", error);
            // Critical: Return an object instead of throwing an error
            return { 
              flightNumber,
              flightOfferId,
              seats: [],
              error: "Unable to retrieve seat map information.",
              message: "The service is currently unavailable. Please try again later."
            };
          }
        },
      },
      createReservation: {
        description: "Display pending reservation details",
        parameters: z.object({
          seats: z.string().array().describe("Array of selected seat numbers"),
          flightNumber: z.string().describe("Flight number"),
          flightOfferId: z.string().describe("Flight offer ID from search results"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            gate: z.string().optional().describe("Departure gate"),
            terminal: z.string().optional().describe("Departure terminal"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            gate: z.string().optional().describe("Arrival gate"),
            terminal: z.string().optional().describe("Arrival terminal"),
          }),
          passengerName: z.string().describe("Name of the passenger"),
        }),
        execute: async (props) => {
          try {
            // Calculate price based on flight offer and seats
            let totalPriceInUSD = 199.99; // Default fallback price
            try {
              const pricingResponse = await confirmFlightPrice(props.flightOfferId);
              totalPriceInUSD = parseFloat(pricingResponse.flightOffers[0].price.total);
              
              // Add seat prices
              const seatMap = await getSeatMap({ flightOfferId: props.flightOfferId });
              if (seatMap.data && seatMap.data.decks) {
                for (const seatNumber of props.seats) {
                  for (const deck of seatMap.data.decks) {
                    for (const row of deck.rows || []) {
                      for (const seat of row.seats || []) {
                        if (seat && seat.number === seatNumber && seat.travelerPricing?.[0]?.price?.total) {
                          totalPriceInUSD += parseFloat(seat.travelerPricing[0].price.total);
                        }
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Error calculating price, using fallback:", error);
            }
            
            const session = await auth();
            if (!session || !session.user || !session.user.id) {
              return { error: "User is not signed in to perform this action!" };
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
              hasCompletedPayment: false 
            };
          } catch (error) {
            console.error("Error creating reservation:", error);
            return { error: "Failed to create reservation" };
          }
        },
      },
      authorizePayment: {
        description: "User will enter credentials to authorize payment, wait for user to respond when they are done",
        parameters: z.object({
          reservationId: z.string().describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          try {
            const reservation = await getReservationById({ id: reservationId });
            return { 
              reservationId,
              hasCompletedPayment: reservation.hasCompletedPayment || false 
            };
          } catch (error) {
            console.error("Error fetching reservation:", error);
            return { reservationId, hasCompletedPayment: false };
          }
        },
      },
      verifyPayment: {
        description: "Verify payment status",
        parameters: z.object({
          reservationId: z.string().describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          try {
            const reservation = await getReservationById({ id: reservationId });
            return { hasCompletedPayment: reservation.hasCompletedPayment || false };
          } catch (error) {
            console.error("Error verifying payment:", error);
            return { hasCompletedPayment: false };
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
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            airportName: z.string().describe("Name of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            terminal: z.string().describe("Departure terminal"),
            gate: z.string().describe("Departure gate"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            airportName: z.string().describe("Name of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            terminal: z.string().describe("Arrival terminal"),
            gate: z.string().describe("Arrival gate"),
          }),
        }),
        execute: async (boardingPass) => {
          try {
            // Verify payment before showing boarding pass
            const reservation = await getReservationById({ id: boardingPass.reservationId });
            if (!reservation.hasCompletedPayment) {
              return { error: "Payment not completed. Cannot display boarding pass." };
            }
            return boardingPass;
          } catch (error) {
            console.error("Error displaying boarding pass:", error);
            return { error: "Failed to display boarding pass" };
          }
        },
      },
      getAirlineInfo: {
        description: "Get airline information by IATA code",
        parameters: z.object({
          airlineCode: z.string().describe("Airline IATA code"),
        }),
        execute: async ({ airlineCode }) => {
          try {
            return await getAirlineDetails(airlineCode);
          } catch (error) {
            console.error("Error fetching airline info:", error);
            return { 
              iataCode: airlineCode,
              businessName: airlineCode + " Airlines",
              error: "Failed to fetch detailed airline information"
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
        execute: async ({ origin, destination, date }) => {
          try {
            return await getFlightPrice({
              origin,
              destination,
              departureDate: date,
            });
          } catch (error) {
            console.error("Error fetching flight price metrics:", error);
            return { 
              error: "Failed to fetch price metrics",
              averagePrice: 399.99,
              minimumPrice: 299.99,
              maximumPrice: 599.99, 
            };
          }
        },
      },
      getAirportInfo: {
        description: "Get airport information",
        parameters: z.object({
          iataCode: z.string().describe("Airport IATA code"),
        }),
        execute: async ({ iataCode }) => {
          try {
            return await getAirportDetails(iataCode);
          } catch (error) {
            console.error("Error fetching airport info:", error);
            return { 
              iataCode,
              name: iataCode + " International Airport",
              cityName: "Unknown City",
              countryName: "Unknown Country",
              error: "Failed to fetch detailed airport information"
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
        execute: async ({ origin, maxPrice }) => {
          try {
            const result = await getFlightInspirationSearch({ origin, maxPrice });
            
            // Check if we have an error or warning in the response
            if (result.errors || (result.warnings && result.data.length === 0)) {
              return {
                message: "Flight inspiration search unavailable for this origin.",
                detail: "This functionality may be limited in test mode or for this airport."
              };
            }
            
            return result;
          } catch (error) {
            console.error("Error fetching flight inspirations:", error);
            return {
              error: "Failed to fetch flight inspirations",
              message: "The service is temporarily unavailable. Please try again later."
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
        execute: async ({ origin, destination }) => {
          try {
            const result = await getCheapestFlightDates({ origin, destination });
            
            // Handle structured errors in the response
            if (result.errors && result.errors.length > 0) {
              return {
                origin,
                destination,
                dates: [],
                error: result.errors[0].detail,
                message: "This route may not be available in the current environment."
              };
            }
            
            return result;
          } catch (error) {
            console.error("Error fetching cheapest flight dates:", error);
            // Ensure we always return a valid object
            return {
              origin,
              destination,
              dates: [],
              error: error instanceof Error ? error.message : "Service unavailable",
              message: "Unable to retrieve cheapest flight dates at this time."
            };
          }
        }
      }
    },
    onFinish: async (responseMessages) => {
      if (session.user && session.user.id) {
        try {
          // Check if responseMessages is iterable
          if (responseMessages && Symbol.iterator in Object(responseMessages)) {
            await saveChat({
              id,
              messages: [...coreMessages, ...responseMessages],
              userId: session.user.id,
            });
          } else {
            // Handle case where responseMessages is not iterable
            console.log("responseMessages is not iterable, saving only core messages");
            await saveChat({
              id,
              messages: coreMessages,
              userId: session.user.id,
            });
          }
        } catch (error) {
          console.error("Failed to save chat:", error);
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    console.error("Error deleting chat:", error);
    
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}