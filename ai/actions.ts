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

    return {
      flightNumber: `${params.carrierCode}${params.flightNumber}`,
      status: status.flightStatus,
      aircraft: status.aircraft.code,
      departure: {
        cityName: status.departure.city,
        airportCode: status.departure.iataCode,
        timestamp: status.departure.scheduledTime,
        terminal: status.departure.terminal,
        gate: status.departure.gate,
      },
      arrival: {
        cityName: status.arrival.city,
        airportCode: status.arrival.iataCode,
        timestamp: status.arrival.scheduledTime,
        terminal: status.arrival.terminal,
        gate: status.arrival.gate,
      },
    };
  } catch (error) {
    console.error('Error generating flight status:', error);
    throw error;
  }
}

export async function generateSampleFlightSearchResults({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  try {
    const flightOffers = await searchFlights({
      origin,
      destination, 
      departureDate: new Date().toISOString().split('T')[0]
    });

    const flights = flightOffers.map((offer: any) => ({
      id: offer.id,
      departure: {
        cityName: offer.itineraries[0].segments[0].departure.iataCode,
        airportCode: offer.itineraries[0].segments[0].departure.iataCode,
        timestamp: offer.itineraries[0].segments[0].departure.at,
      },
      arrival: {
        cityName: offer.itineraries[0].segments[0].arrival.iataCode,
        airportCode: offer.itineraries[0].segments[0].arrival.iataCode,
        timestamp: offer.itineraries[0].segments[0].arrival.at,
      },
      airlines: [offer.validatingAirlineCodes[0]],
      priceInUSD: parseFloat(offer.price.total),
      numberOfStops: offer.itineraries[0].segments.length - 1,
      raw: offer // Store raw offer for later use
    }));

    return { flights };
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
}

export async function generateSampleSeatSelection({
  flightNumber,
  flightOfferId,
}: {
  flightNumber: string;
  flightOfferId: string;
}) {
  try {
    const seatmap = await getSeatMap({ flightOfferId });
    const seats = [];

    for (const deck of seatmap.data.decks) {
      for (const row of deck.rows) {
        for (const seat of row.seats) {
          if (seat) {
            seats.push({
              seatNumber: seat.number,
              priceInUSD: parseFloat(seat.travelerPricing?.[0]?.price?.total || '0'),
              isAvailable: seat.travelerPricing?.[0]?.status === 'AVAILABLE',
              cabin: seat.cabin
            });
          }
        }
      }
    }

    return { seats };
  } catch (error) {
    console.error('Error fetching seat map:', error);
    throw error;
  }
}

export async function generateReservationPrice(props: {
  seats: string[];
  flightNumber: string;
  flightOfferId: string;
  departure: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  passengerName: string;
}) {
  try {
    // Get confirmed pricing from Amadeus
    const pricingResponse = await confirmFlightPrice(props.flightOfferId);
    
    // Calculate total price including selected seats
    const seatMap = await getSeatMap({ flightOfferId: props.flightOfferId });
    let seatPrice = 0;
    
    // Add seat prices to total
    for (const seatNumber of props.seats) {
      const seat = findSeatInMap(seatMap, seatNumber);
      if (seat && seat.travelerPricing?.[0]?.price?.total) {
        seatPrice += parseFloat(seat.travelerPricing[0].price.total);
      }
    }

    return {
      totalPriceInUSD: parseFloat(pricingResponse.flightOffers[0].price.total) + seatPrice
    };
  } catch (error) {
    console.error('Error generating reservation price:', error);
    throw error;
  }
}

// Helper function to find seat in seatmap
function findSeatInMap(seatMap: any, seatNumber: string) {
  for (const deck of seatMap.data.decks) {
    for (const row of deck.rows) {
      for (const seat of row.seats) {
        if (seat && seat.number === seatNumber) {
          return seat;
        }
      }
    }
  }
  return null;
}
