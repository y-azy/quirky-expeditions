import { Card } from "../ui/card";

interface AirlineInfoProps {
  airline: {
    name: string;
    iataCode: string;
    icaoCode?: string;
    logo?: string;
    alliance?: string;
  };
}

export function AirlineInfo({ airline }: AirlineInfoProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {airline.logo && (
          <img 
            src={airline.logo} 
            alt={airline.name} 
            className="w-12 h-12 object-contain"
          />
        )}
        <div>
          <h3 className="font-semibold">{airline.name}</h3>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>IATA: {airline.iataCode}</span>
            {airline.icaoCode && <span>ICAO: {airline.icaoCode}</span>}
          </div>
          {airline.alliance && (
            <p className="text-sm text-muted-foreground">
              Member of {airline.alliance}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
