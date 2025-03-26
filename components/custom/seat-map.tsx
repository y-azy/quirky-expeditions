import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SeatMapProps {
  seats: Array<{
    seatNumber: string;
    priceInUSD: number;
    isAvailable: boolean;
    cabin: string;
  }>;
  onSelect: (selectedSeats: string[]) => void;
}

export function SeatMap({ seats, onSelect }: SeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatClick = (seatNumber: string) => {
    const updatedSelection = selectedSeats.includes(seatNumber)
      ? selectedSeats.filter(s => s !== seatNumber)
      : [...selectedSeats, seatNumber];
    
    setSelectedSeats(updatedSelection);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-6 gap-2">
        {seats.map((seat) => (
          <Button
            key={seat.seatNumber}
            variant={selectedSeats.includes(seat.seatNumber) ? "default" : "outline"}
            disabled={!seat.isAvailable}
            onClick={() => handleSeatClick(seat.seatNumber)}
            className="w-12 h-12"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm">{seat.seatNumber}</span>
              <span className="text-xs">${seat.priceInUSD}</span>
            </div>
          </Button>
        ))}
      </div>
      <Button 
        onClick={() => onSelect(selectedSeats)}
        disabled={selectedSeats.length === 0}
      >
        Confirm Selection
      </Button>
    </div>
  );
}
