import { Card } from "../ui/card";
import { getAirlineDetails } from "@/lib/amadeus-helpers";
import { useEffect, useState } from "react";

interface FlightInfoProps {
  flightNumber: string;
  aircraft?: string;
  departureTime: string;
  arrivalTime: string;
}

export function FlightInfo({ flightNumber, aircraft, departureTime, arrivalTime }: FlightInfoProps) {
  const [airlineInfo, setAirlineInfo] = useState<any>(null);
  const airlineCode = flightNumber.substring(0, 2);

  useEffect(() => {
    async function fetchAirlineInfo() {
      try {
        const response = await fetch(`/api/airlines?code=${airlineCode}`);
        const data = await response.json();
        setAirlineInfo(data);
      } catch (error) {
        console.error('Error fetching airline info:', error);
      }
    }
    fetchAirlineInfo();
  }, [airlineCode]);

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-mono">{flightNumber}</span>
          {airlineInfo && <span>{airlineInfo.businessName}</span>}
        </div>
        {aircraft && <p className="text-sm text-muted-foreground">Aircraft: {aircraft}</p>}
        <div className="flex justify-between text-sm">
          <span>Departure: {new Date(departureTime).toLocaleTimeString()}</span>
          <span>Arrival: {new Date(arrivalTime).toLocaleTimeString()}</span>
        </div>
      </div>
    </Card>
  );
}
