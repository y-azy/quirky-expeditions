import { format, parseISO } from "date-fns";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";

interface FlightDetailsProps {
  flight: {
    id: string;
    flightNumber: string;
    aircraft?: string;
    departure: {
      cityName: string;
      airportCode: string;
      airportName?: string;
      timestamp: string;
      terminal?: string;
      gate?: string;
    };
    arrival: {
      cityName: string;
      airportCode: string;
      airportName?: string;
      timestamp: string;
      terminal?: string;
      gate?: string;
    };
    airline: {
      name: string;
      code: string;
    };
    price: {
      amount: number;
      currency: string;
    };
    error?: string;
    status?: string;
  };
}

export function FlightDetails({ flight }: FlightDetailsProps) {
  if (flight.error || flight.status === "error") {
    return (
      <Card className="p-6">
        <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
          <p>{flight.error || "Unable to display flight details"}</p>
        </div>
      </Card>
    );
  }

  function formatDateTime(dateString: string): string {
    try {
      return format(parseISO(dateString), "PPp");
    } catch {
      return dateString;
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{flight.airline.name}</h3>
            <p className="text-sm text-muted-foreground">Flight {flight.flightNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              {flight.price.currency} {flight.price.amount.toFixed(2)}
            </p>
            {flight.aircraft && (
              <p className="text-sm text-muted-foreground">Aircraft: {flight.aircraft}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-muted-foreground">Departure</p>
            <p className="text-lg font-semibold">{flight.departure.cityName}</p>
            <p className="text-sm">{flight.departure.airportName || flight.departure.airportCode}</p>
            <p className="text-sm">{formatDateTime(flight.departure.timestamp)}</p>
            {flight.departure.terminal && (
              <p className="text-sm">Terminal {flight.departure.terminal}</p>
            )}
            {flight.departure.gate && (
              <p className="text-sm">Gate {flight.departure.gate}</p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Arrival</p>
            <p className="text-lg font-semibold">{flight.arrival.cityName}</p>
            <p className="text-sm">{flight.arrival.airportName || flight.arrival.airportCode}</p>
            <p className="text-sm">{formatDateTime(flight.arrival.timestamp)}</p>
            {flight.arrival.terminal && (
              <p className="text-sm">Terminal {flight.arrival.terminal}</p>
            )}
            {flight.arrival.gate && (
              <p className="text-sm">Gate {flight.arrival.gate}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
