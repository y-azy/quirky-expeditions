"use client";

import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface SeatMapResponse {
  flightNumber: string;
  flightOfferId: string;
  seats: Array<{
    seatNumber: string;
    priceInUSD: number;
    isAvailable: boolean;
    cabin: string;
  }>;
}

export function SelectSeats({
  chatId,
  availability = {
    flightNumber: "AA123",
    flightOfferId: "sample-id",
    seats: Array(30)
      .fill(null)
      .map((_, index) => ({
        seatNumber: `${Math.floor(index / 6) + 1}${String.fromCharCode(
          (index % 6) + 65,
        )}`,
        priceInUSD: Math.random() * 100 + 25,
        isAvailable: Math.random() > 0.3,
        cabin: Math.random() > 0.7 ? "BUSINESS" : "ECONOMY",
      })),
  },
}: {
  chatId: string;
  availability?: SeatMapResponse;
}) {
  const [selectedSeats, setSelectedSeats] = useState<Array<string>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [cabinFilter, setCabinFilter] = useState<string | null>(null);

  // Group seats by row
  const seatRows = availability.seats.reduce(
    (acc, seat) => {
      // Extract row number from seat number (e.g., "12A" -> "12")
      const row = seat.seatNumber.replace(/[A-Z]/g, "");
      
      if (!acc[row]) {
        acc[row] = [];
      }
      
      acc[row].push(seat);
      return acc;
    },
    {} as Record<string, Array<any>>
  );
  
  // Get unique cabin types
  const cabinTypes = [...new Set(availability.seats.map(seat => seat.cabin))];

  // Filter seats by cabin if needed
  const filteredSeatRows = cabinFilter 
    ? Object.fromEntries(
        Object.entries(seatRows).map(([row, seats]) => [
          row,
          seats.filter(seat => seat.cabin === cabinFilter)
        ])
      )
    : seatRows;

  const handleSelectSeat = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatNumber) => {
      const seat = availability.seats.find((s) => s.seatNumber === seatNumber);
      return total + (seat?.priceInUSD || 0);
    }, 0);
  };

  const handleSaveSeats = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    setIsSaving(true);

    try {
      const result = await fetch(`/api/chat/${chatId}/select-seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flightNumber: availability.flightNumber,
          flightOfferId: availability.flightOfferId,
          seats: selectedSeats,
        }),
      });

      if (!result.ok) {
        const error = await result.text();
        throw new Error(error);
      }
      
      toast.success(`Seats ${selectedSeats.join(", ")} selected successfully`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save seat selection");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getCabinLabel = (cabin: string) => {
    const labels: Record<string, string> = {
      'ECONOMY': 'Economy',
      'PREMIUM_ECONOMY': 'Premium Economy',
      'BUSINESS': 'Business',
      'FIRST': 'First'
    };
    return labels[cabin] || cabin.charAt(0) + cabin.slice(1).toLowerCase();
  };

  // Helper to get seat color based on cabin
  const getSeatColor = (seat: any) => {
    if (!seat.isAvailable) return "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
    if (selectedSeats.includes(seat.seatNumber)) return "bg-primary text-white";
    
    const cabinColors: Record<string, string> = {
      'ECONOMY': "bg-green-100 hover:bg-green-200 border-green-200",
      'PREMIUM_ECONOMY': "bg-blue-100 hover:bg-blue-200 border-blue-200",
      'BUSINESS': "bg-purple-100 hover:bg-purple-200 border-purple-200",
      'FIRST': "bg-amber-100 hover:bg-amber-200 border-amber-200"
    };
    
    return cabinColors[seat.cabin] || "bg-gray-100 hover:bg-gray-200 border-gray-200";
  };

  return (
    <Card className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Select Seats - {availability.flightNumber}</h3>
        <div className="text-sm">
          Selected seats: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={cabinFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setCabinFilter(null)}
        >
          All
        </Button>
        {cabinTypes.map(cabin => (
          <Button
            key={cabin}
            variant={cabinFilter === cabin ? "default" : "outline"}
            size="sm"
            onClick={() => setCabinFilter(cabin)}
          >
            {getCabinLabel(cabin)}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto pb-4">
        {Object.entries(filteredSeatRows).map(([row, seats]) => (
          <div key={row} className="flex gap-2 mb-2">
            <div className="w-6 flex items-center justify-center font-semibold text-sm">
              {row}
            </div>
            <div className="flex gap-2">
              {seats.map(seat => (
                <button
                  key={seat.seatNumber}
                  className={`w-12 h-12 p-1 border rounded-md flex flex-col items-center justify-center text-xs ${getSeatColor(seat)}`}
                  disabled={!seat.isAvailable}
                  onClick={() => handleSelectSeat(seat.seatNumber)}
                >
                  <span className="font-semibold">{seat.seatNumber.replace(/\d+/g, '')}</span>
                  <span>${seat.priceInUSD.toFixed(0)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="font-semibold">
          Total: ${getTotalPrice().toFixed(2)}
        </div>
        <Button 
          onClick={handleSaveSeats} 
          disabled={selectedSeats.length === 0 || isSaving}
        >
          {isSaving ? "Saving..." : "Save Selection"}
        </Button>
      </div>
    </Card>
  );
}
