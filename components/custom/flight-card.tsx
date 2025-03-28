import { format, parseISO } from "date-fns";
import { Card } from "../ui/card";

interface FlightCardProps {
  flight: {
    id: string;
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
    priceInUSD: number;
    numberOfStops: number;
    error?: string;
    status?: string;
  };
  onSelect?: () => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  if (flight.error || flight.status === "error") {
    return (
      <Card className="p-4">
        <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md">
          <p className="text-sm">{flight.error || "Unable to display flight information"}</p>
        </div>
      </Card>
    );
  }

  function formatTime(dateString: string): string {
    try {
      return format(parseISO(dateString), "HH:mm");
    } catch {
      return dateString;
    }
  }

  return (
    <Card 
      className="p-4 hover:bg-accent cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-semibold">
            {formatTime(flight.departure.timestamp)} - {formatTime(flight.arrival.timestamp)}
          </div>
          <div className="text-sm text-muted-foreground">
            {flight.departure.airportCode} → {flight.arrival.airportCode}
          </div>
          <div className="text-sm text-muted-foreground">
            {flight.airlines.join(", ")}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-lg font-semibold">
            ${flight.priceInUSD.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            {flight.numberOfStops === 0 ? "Direct" : `${flight.numberOfStops} stop${flight.numberOfStops > 1 ? 's' : ''}`}
          </div>
        </div>
      </div>
    </Card>
  );
}
