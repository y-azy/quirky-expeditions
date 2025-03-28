import { Card } from "../ui/card";
import { useEffect, useState } from "react";

interface FlightInfoProps {
  flightNumber: string;
  aircraft?: string;
  departureTime: string;
  arrivalTime: string;
}

export function FlightInfo({ flightNumber, aircraft, departureTime, arrivalTime }: FlightInfoProps) {
  const [airlineInfo, setAirlineInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const airlineCode = flightNumber.substring(0, 2);

  useEffect(() => {
    async function fetchAirlineInfo() {
      try {
        setLoading(true);
        const response = await fetch(`/api/airlines?code=${airlineCode}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching airline info: ${response.status}`);
        }
        
        const data = await response.json();
        setAirlineInfo(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching airline info:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch airline information');
      } finally {
        setLoading(false);
      }
    }
    
    if (airlineCode) {
      fetchAirlineInfo();
    }
  }, [airlineCode]);

  function formatTime(timeString: string): string {
    try {
      return new Date(timeString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-mono">{flightNumber}</span>
          {loading ? (
            <span className="text-sm text-muted-foreground">Loading airline information...</span>
          ) : error ? (
            <span className="text-sm text-red-500">Could not load airline info</span>
          ) : airlineInfo ? (
            <span>{airlineInfo.businessName || airlineInfo.name || airlineCode}</span>
          ) : (
            <span>{airlineCode}</span>
          )}
        </div>
        {aircraft && <p className="text-sm text-muted-foreground">Aircraft: {aircraft}</p>}
        <div className="flex justify-between text-sm">
          <span>Departure: {formatTime(departureTime)}</span>
          <span>Arrival: {formatTime(arrivalTime)}</span>
        </div>
      </div>
    </Card>
  );
}
