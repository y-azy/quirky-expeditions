import { format } from "date-fns";
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
    raw?: any; // Original flight offer data
  };
  onSelect?: () => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  return (
    <Card 
      className="p-4 hover:bg-accent cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-semibold">
            {format(new Date(flight.departure.timestamp), "HH:mm")} - {format(new Date(flight.arrival.timestamp), "HH:mm")}
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
