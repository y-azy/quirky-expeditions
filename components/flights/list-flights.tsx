"use client";

import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Clock } from "lucide-react";

interface Flight {
  id: string;
  flightOfferId: string;
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
  flightNumber: string;
  priceInUSD: number;
  numberOfStops: number;
}

interface ListFlightsProps {
  chatId?: string;
  results?: {
    flights?: Flight[];
    error?: string;
    message?: string;
  };
}

export function ListFlights({ chatId, results }: ListFlightsProps) {
  if (!results || !results.flights) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flight Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse flex items-center justify-center bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Loading flights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flight Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p>Error retrieving flights</p>
            <p className="text-sm">{results.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.flights.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flight Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-md">
            <p>No flights found matching your criteria.</p>
            {results.message && <p className="text-sm mt-1">{results.message}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  function formatDate(dateString: string): string {
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch {
      return dateString;
    }
  }

  function formatFullDate(dateString: string): string {
    try {
      return format(parseISO(dateString), "EEE, MMM d");
    } catch {
      return dateString;
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Flight Search Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.flights.map((flight) => (
          <div
            key={flight.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">
                {formatFullDate(flight.departure.timestamp)}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Plane className="h-4 w-4" />
                {flight.flightNumber}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold">{formatDate(flight.departure.timestamp)}</span>
                  <span className="text-sm">{flight.departure.airportCode}</span>
                </div>
                <p className="text-sm text-muted-foreground">{flight.departure.cityName}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {flight.numberOfStops === 0 ? "Direct" : `${flight.numberOfStops > 1 ? "s" : ""}`}
                </div>
                <div className="w-16 h-px bg-muted-foreground/20 my-1"></div>
                <div className="text-xs text-muted-foreground">{flight.airlines.join(", ")}</div>
              </div>
              
              <div className="space-y-1 text-right">
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-lg font-semibold">{formatDate(flight.arrival.timestamp)}</span>
                  <span className="text-sm">{flight.arrival.airportCode}</span>
                </div>
                <p className="text-sm text-muted-foreground">{flight.arrival.cityName}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <span className="font-semibold text-lg">${flight.priceInUSD.toFixed(2)}</span>
              <Button size="sm" 
                onClick={() => {
                  // Select this flight for seat selection
                  if (chatId) {
                    const message = `I'd like to book flight ${flight.flightNumber} from ${flight.departure.cityName} to ${flight.arrival.cityName} for $${flight.priceInUSD.toFixed(2)}`;
                    const textarea = document.querySelector('textarea');
                    if (textarea) {
                      textarea.value = message;
                      textarea.dispatchEvent(new Event('input', { bubbles: true }));
                      
                      // Focus the textarea
                      textarea.focus();
                    }
                  }
                }}
              >
                Select
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
