"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface Flight {
  id: string;
  flightOfferId?: string;
  departure: {
    cityName: string;
    airportCode: string;
    timestamp: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    timestamp: string;
  };
  airlines: string[];
  flightNumber?: string;
  priceInUSD: number;
  numberOfStops: number;
  raw?: any;
}

interface FlightSearchResults {
  flights: Flight[];
}

export function ListFlights({
  chatId,
  results,
}: {
  chatId: string;
  results?: FlightSearchResults;
}) {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  if (!results || !results.flights) {
    // Skeleton loading state
    return (
      <Card className="p-4 skeleton">
        <h3 className="text-lg font-semibold mb-4">Available Flights</h3>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-3 border rounded-md flex justify-between">
              <div className="space-y-1">
                <div className="text-lg">00:00 - 00:00</div>
                <div className="text-sm">XXX → XXX</div>
              </div>
              <div className="text-right">
                <div className="text-lg">$000.00</div>
                <div className="text-sm">Direct</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const handleSelect = async (flight: Flight) => {
    setSelectedFlightId(flight.id);
    try {
      // Optional: Store the selected flight in local storage or API
      // This might be useful if you want to access the raw flight data later
      if (flight.raw) {
        localStorage.setItem(`flight_${flight.id}`, JSON.stringify(flight.raw));
      }
    } catch (error) {
      console.error("Error storing flight selection:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "h:mm a");
    } catch {
      return "00:00";
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Available Flights</h3>
      <div className="space-y-2">
        {results.flights.map((flight) => (
          <div 
            key={flight.id}
            className={`p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors ${selectedFlightId === flight.id ? 'bg-accent border-primary' : ''}`}
            onClick={() => handleSelect(flight)}
          >
            <div className="flex justify-between mb-1">
              <div className="space-y-1">
                <div className="text-lg font-semibold">
                  {formatTime(flight.departure.timestamp)} - {formatTime(flight.arrival.timestamp)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {flight.departure.airportCode} → {flight.arrival.airportCode}
                </div>
                <div className="text-sm text-muted-foreground">
                  {flight.airlines.join(", ")}
                  {flight.flightNumber && ` • ${flight.flightNumber}`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">${flight.priceInUSD.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  {flight.numberOfStops === 0 ? "Direct" : `${flight.numberOfStops} stop${flight.numberOfStops > 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
