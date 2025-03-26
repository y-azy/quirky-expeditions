import { format } from "date-fns";
import { Card } from "@/components/ui/card";

interface BoardingPassProps {
  boardingPass: {
    passengerName: string;
    flightNumber: string;
    seat: string;
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
  };
}

export function BoardingPass({ boardingPass }: BoardingPassProps) {
  return (
    <Card className="p-6 bg-primary/5">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Boarding Pass</h3>
          <div className="text-lg font-mono">{boardingPass.flightNumber}</div>
        </div>
        <div className="text-lg font-semibold">{boardingPass.passengerName}</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">From</div>
            <div className="text-lg font-semibold">{boardingPass.departure.cityName}</div>
            <div className="text-sm">{boardingPass.departure.airportCode}</div>
            <div className="text-sm">Gate {boardingPass.departure.gate}</div>
            <div className="text-sm">Terminal {boardingPass.departure.terminal}</div>
            <div className="text-sm">{format(new Date(boardingPass.departure.timestamp), "PPp")}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">To</div>
            <div className="text-lg font-semibold">{boardingPass.arrival.cityName}</div>
            <div className="text-sm">{boardingPass.arrival.airportCode}</div>
            <div className="text-sm">Gate {boardingPass.arrival.gate}</div>
            <div className="text-sm">Terminal {boardingPass.arrival.terminal}</div>
            <div className="text-sm">{format(new Date(boardingPass.arrival.timestamp), "PPp")}</div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-lg font-semibold">Seat</div>
          <div className="text-lg font-mono">{boardingPass.seat}</div>
        </div>
      </div>
    </Card>
  );
}
