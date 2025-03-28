"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface Seat {
  seatNumber: string;
  priceInUSD: number;
  isAvailable: boolean;
  cabin: string;
}

interface SelectSeatsProps {
  chatId?: string;
  availability?: {
    flightNumber?: string;
    flightOfferId?: string;
    seats?: Seat[];
    error?: string;
    message?: string;
  };
}

export function SelectSeats({ chatId, availability }: SelectSeatsProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  if (!availability) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Select Seats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse flex items-center justify-center bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Loading seat map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availability.error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Select Seats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p>Error retrieving seat map</p>
            <p className="text-sm">{availability.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!availability.seats || availability.seats.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Select Seats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-md">
            <p>No seat information available for this flight.</p>
            {availability.message && <p className="text-sm mt-1">{availability.message}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const flightNumber = availability.flightNumber || "Unknown";
  
  // Group seats by cabin type
  const cabinGroups = availability.seats.reduce((groups: Record<string, Seat[]>, seat) => {
    if (!groups[seat.cabin]) {
      groups[seat.cabin] = [];
    }
    groups[seat.cabin].push(seat);
    return groups;
  }, {});

  // Helper function to organize seats in rows (assuming seats are named like 1A, 1B, etc.)
  const organizeSeatsInRows = (seats: Seat[]) => {
    const rows: Record<string, Seat[]> = {};
    
    seats.forEach(seat => {
      // Extract row number (e.g., "1" from "1A")
      const rowNumber = seat.seatNumber.replace(/[A-Z]/g, '');
      
      if (!rows[rowNumber]) {
        rows[rowNumber] = [];
      }
      
      rows[rowNumber].push(seat);
    });
    
    // Sort seat positions within each row
    Object.keys(rows).forEach(rowNumber => {
      rows[rowNumber].sort((a, b) => {
        const aLetter = a.seatNumber.replace(/[0-9]/g, '');
        const bLetter = b.seatNumber.replace(/[0-9]/g, '');
        return aLetter.localeCompare(bLetter);
      });
    });
    
    return rows;
  };

  const handleSeatClick = (seatNumber: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleConfirm = () => {
    if (!chatId || selectedSeats.length === 0) return;
    
    const message = `I want to book these seats: ${selectedSeats.join(', ')} for flight ${flightNumber}`;
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = message;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  };

  // Calculate total price for selected seats
  const totalPrice = selectedSeats.reduce((sum, seatNumber) => {
    const seat = availability.seats?.find(s => s.seatNumber === seatNumber);
    return sum + (seat?.priceInUSD || 0);
  }, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Select Seats for Flight {flightNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(cabinGroups).map(([cabin, seats]) => {
          const rows = organizeSeatsInRows(seats);
          
          return (
            <div key={cabin} className="space-y-2">
              <h3 className="font-medium">{cabin}</h3>
              
              <div className="space-y-2">
                {Object.entries(rows).map(([rowNum, rowSeats]) => (
                  <div key={rowNum} className="flex items-center gap-1 justify-center">
                    <span className="text-xs text-muted-foreground w-6">{rowNum}</span>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {rowSeats.map(seat => (
                        <button
                          key={seat.seatNumber}
                          disabled={!seat.isAvailable}
                          onClick={() => handleSeatClick(seat.seatNumber)}
                          className={`
                            size-10 flex flex-col items-center justify-center rounded-md text-xs
                            ${!seat.isAvailable 
                              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                              : selectedSeats.includes(seat.seatNumber)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            }
                          `}
                        >
                          <span>{seat.seatNumber.replace(/[0-9]/g, '')}</span>
                          <span>${seat.priceInUSD.toFixed(0)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        <div className="pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 bg-muted rounded-sm"></div>
            <span>Unavailable</span>
            
            <div className="size-4 bg-secondary rounded-sm ml-4"></div>
            <span>Available</span>
            
            <div className="size-4 bg-primary rounded-sm ml-4"></div>
            <span>Selected</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div>
          {selectedSeats.length > 0 ? (
            <div className="space-y-1">
              <div className="font-medium">Selected: {selectedSeats.join(', ')}</div>
              <div className="text-sm text-muted-foreground">Total: ${totalPrice.toFixed(2)}</div>
            </div>
          ) : (
            <div className="text-muted-foreground">No seats selected</div>
          )}
        </div>
        
        <Button 
          onClick={handleConfirm}
          disabled={selectedSeats.length === 0}
          className="gap-2"
        >
          <CheckCircle className="size-4" />
          Confirm
        </Button>
      </CardFooter>
    </Card>
  );
}
