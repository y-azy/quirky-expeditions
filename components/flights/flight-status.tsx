"use client";

import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FlightStatusProps {
  flightStatus?: {
    flightNumber: string;
    departure: {
      cityName: string;
      airportCode: string;
      airportName: string;
      timestamp: string;
      terminal?: string;
      gate?: string;
    };
    arrival: {
      cityName: string;
      airportCode: string;
      airportName: string;
      timestamp: string;
      terminal?: string;
      gate?: string;
    };
    totalDistanceInMiles?: number;
    error?: string;
  };
}

export function Row({ row = SAMPLE.arrival, type = "arrival" }) {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-2 items-center">
            <div className="bg-foreground text-background rounded-full size-fit">
              {type === "arrival" ? (
                <div className="rotate-90">
                  <ArrowUpRightSmallIcon size={16} />
                </div>
              ) : (
                <ArrowUpRightSmallIcon size={16} />
              )}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              {row.airportCode}
            </div>
            <div>·</div>
            <div className="text-sm sm:text-base truncate max-w-32 sm:max-w-64 text-muted-foreground">
              {row.airportName}
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-medium">
            {format(new Date(row.timestamp), "h:mm a")}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 items-end justify-center mt-auto">
        <div className="text-sm sm:text-sm bg-amber-400 rounded-md w-fit px-2 text-amber-900">
          {row.gate}
        </div>
        <div className="text-sm text-muted-foreground">
          Terminal {row.terminal}
        </div>
      </div>
    </div>
  );
}

export function FlightStatus({ flightStatus }: FlightStatusProps) {
  if (!flightStatus) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flight Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse flex items-center justify-center bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Loading flight status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (flightStatus.error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flight Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p>Error retrieving flight status</p>
            <p className="text-sm">{flightStatus.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  function formatDate(dateString: string): string {
    try {
      return format(parseISO(dateString), "MMM d, yyyy h:mm a");
    } catch {
      return dateString;
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Flight {flightStatus.flightNumber}</span>
          {flightStatus.totalDistanceInMiles && (
            <span className="text-sm font-normal text-muted-foreground">
              {flightStatus.totalDistanceInMiles} miles
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-1">Departure</h3>
            <p className="text-lg">{flightStatus.departure.cityName}</p>
            <p className="text-sm text-muted-foreground">
              {flightStatus.departure.airportName} ({flightStatus.departure.airportCode})
            </p>
            <p className="text-sm">{formatDate(flightStatus.departure.timestamp)}</p>
            
            {(flightStatus.departure.terminal || flightStatus.departure.gate) && (
              <div className="mt-2 text-sm">
                {flightStatus.departure.terminal && (
                  <p>Terminal: {flightStatus.departure.terminal}</p>
                )}
                {flightStatus.departure.gate && (
                  <p>Gate: {flightStatus.departure.gate}</p>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Arrival</h3>
            <p className="text-lg">{flightStatus.arrival.cityName}</p>
            <p className="text-sm text-muted-foreground">
              {flightStatus.arrival.airportName} ({flightStatus.arrival.airportCode})
            </p>
            <p className="text-sm">{formatDate(flightStatus.arrival.timestamp)}</p>
            
            {(flightStatus.arrival.terminal || flightStatus.arrival.gate) && (
              <div className="mt-2 text-sm">
                {flightStatus.arrival.terminal && (
                  <p>Terminal: {flightStatus.arrival.terminal}</p>
                )}
                {flightStatus.arrival.gate && (
                  <p>Gate: {flightStatus.arrival.gate}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
