import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  };
}

export function FlightDetails({ flight }: FlightDetailsProps) {
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
            <p className="text-sm">{flight.departure.airportName}</p>
            <p className="text-sm">{format(new Date(flight.departure.timestamp), "PPp")}</p>
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
            <p className="text-sm">{flight.arrival.airportName}</p>
            <p className="text-sm">{format(new Date(flight.arrival.timestamp), "PPp")}</p>
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
