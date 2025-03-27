"use client";

import { differenceInHours, format, parseISO } from "date-fns";
import { Card } from "../ui/card";

import { ArrowUpRightSmallIcon } from "../custom/icons";

const SAMPLE = {
  flightNumber: "BA142",
  departure: {
    cityName: "London",
    airportCode: "LHR",
    airportName: "London Heathrow Airport",
    timestamp: "2024-10-08T18:30:00Z",
    terminal: "5",
    gate: "A10",
  },
  arrival: {
    cityName: "New York",
    airportCode: "JFK",
    airportName: "John F. Kennedy International Airport",
    timestamp: "2024-10-09T07:30:00Z",
    terminal: "7",
    gate: "B22",
  },
  totalDistanceInMiles: 3450,
};

interface FlightStatusProps {
  flightStatus?: {
    flightNumber: string;
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
    totalDistanceInMiles: number;
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
      <Card className="p-4 skeleton">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Flight Status</h3>
          <div className="text-lg font-mono">XX1234</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm">Departure</div>
            <div className="text-lg font-semibold">City</div>
            <div className="text-sm">Airport (XXX)</div>
            <div className="text-sm">00:00 AM</div>
            <div className="text-sm">Terminal X, Gate X</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm">Arrival</div>
            <div className="text-lg font-semibold">City</div>
            <div className="text-sm">Airport (XXX)</div>
            <div className="text-sm">00:00 AM</div>
            <div className="text-sm">Terminal X, Gate X</div>
          </div>
        </div>
      </Card>
    );
  }

  const formatTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "h:mm a");
    } catch (e) {
      return "Time unavailable";
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "MMM d, yyyy");
    } catch (e) {
      return "Date unavailable";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Flight Status</h3>
        <div className="text-lg font-mono">{flightStatus.flightNumber}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Departure</div>
          <div className="text-lg font-semibold">{flightStatus.departure.cityName}</div>
          <div className="text-sm">{flightStatus.departure.airportName} ({flightStatus.departure.airportCode})</div>
          <div className="text-sm">
            {formatTime(flightStatus.departure.timestamp)} on {formatDate(flightStatus.departure.timestamp)}
          </div>
          <div className="text-sm">
            {flightStatus.departure.terminal && `Terminal ${flightStatus.departure.terminal}`}
            {flightStatus.departure.terminal && flightStatus.departure.gate && ', '}
            {flightStatus.departure.gate && `Gate ${flightStatus.departure.gate}`}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Arrival</div>
          <div className="text-lg font-semibold">{flightStatus.arrival.cityName}</div>
          <div className="text-sm">{flightStatus.arrival.airportName} ({flightStatus.arrival.airportCode})</div>
          <div className="text-sm">
            {formatTime(flightStatus.arrival.timestamp)} on {formatDate(flightStatus.arrival.timestamp)}
          </div>
          <div className="text-sm">
            {flightStatus.arrival.terminal && `Terminal ${flightStatus.arrival.terminal}`}
            {flightStatus.arrival.terminal && flightStatus.arrival.gate && ', '}
            {flightStatus.arrival.gate && `Gate ${flightStatus.arrival.gate}`}
          </div>
        </div>
      </div>
      {flightStatus.totalDistanceInMiles > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          Flight distance: {flightStatus.totalDistanceInMiles.toLocaleString()} miles
        </div>
      )}
    </Card>
  );
}
