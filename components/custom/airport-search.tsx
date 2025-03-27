import { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Airport {
  name: string;
  iataCode: string;
  cityName: string;
  countryName: string;
}

interface AirportSearchProps {
  onSelect: (airport: Airport) => void;
}

export function AirportSearch({ onSelect }: AirportSearchProps) {
  const [query, setQuery] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);

  const searchAirports = async () => {
    const response = await fetch(`/api/airports?keyword=${encodeURIComponent(query)}`);
    const data = await response.json();
    setAirports(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter city or airport name"
        />
        <Button onClick={searchAirports}>Search</Button>
      </div>
      <div className="space-y-2">
        {airports.map((airport) => (
          <Card
            key={airport.iataCode}
            className="p-4 cursor-pointer hover:bg-accent"
            onClick={() => onSelect(airport)}
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{airport.name}</p>
                <p className="text-sm text-muted-foreground">{airport.cityName}, {airport.countryName}</p>
              </div>
              <p className="text-lg font-mono">{airport.iataCode}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
