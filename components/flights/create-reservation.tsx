"use client";

import { format, parseISO } from "date-fns";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface ReservationProps {
  reservation?: {
    id: string;
    seats: string[];
    flightNumber: string;
    departure: {
      cityName: string;
      airportCode: string;
      timestamp: string;
      gate?: string;
      terminal?: string;
    };
    arrival: {
      cityName: string;
      airportCode: string;
      timestamp: string;
      gate?: string;
      terminal?: string;
    };
    passengerName: string;
    totalPriceInUSD: number;
    hasCompletedPayment: boolean;
    error?: string;
  };
}

export function CreateReservation({ reservation }: ReservationProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!reservation) {
    // Skeleton loading state
    return (
      <Card className="p-6 skeleton">
        <h3 className="text-xl font-semibold mb-4">Reservation Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="text-lg">Flight</div>
            <div className="text-lg">XX1234</div>
          </div>
          <div className="flex justify-between">
            <div className="text-lg">Passenger</div>
            <div className="text-lg">Passenger Name</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm">From</div>
              <div className="text-lg">City (XXX)</div>
              <div className="text-sm">Date</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm">To</div>
              <div className="text-lg">City (XXX)</div>
              <div className="text-sm">Date</div>
            </div>
          </div>
          <div className="flex justify-between border-t pt-4">
            <div className="text-lg font-semibold">Total Price</div>
            <div className="text-lg font-semibold">$000.00</div>
          </div>
        </div>
      </Card>
    );
  }

  if (reservation.error) {
    return (
      <Card className="p-6 border-destructive">
        <div className="text-destructive font-semibold">Error</div>
        <p>{reservation.error}</p>
      </Card>
    );
  }

  const formatDateTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "MMM d, yyyy h:mm a");
    } catch {
      return "Time unavailable";
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch(`/api/reservation?id=${reservation.id}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to confirm reservation');
      }
      
      toast.success('Reservation confirmed!');
    } catch (error) {
      toast.error('Failed to confirm reservation. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Card className="p-6 bg-primary/5">
      <h3 className="text-xl font-semibold mb-4">Reservation Details</h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="text-lg font-medium">Flight</div>
          <div className="text-lg font-mono">{reservation.flightNumber}</div>
        </div>
        
        <div className="flex justify-between">
          <div className="text-lg font-medium">Passenger</div>
          <div className="text-lg">{reservation.passengerName}</div>
        </div>
        
        <div className="flex justify-between">
          <div className="text-lg font-medium">Seats</div>
          <div className="text-lg font-mono">{reservation.seats.join(", ")}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">From</div>
            <div className="text-lg font-medium">
              {reservation.departure.cityName} ({reservation.departure.airportCode})
            </div>
            <div className="text-sm">
              {formatDateTime(reservation.departure.timestamp)}
            </div>
            {(reservation.departure.terminal || reservation.departure.gate) && (
              <div className="text-sm">
                {reservation.departure.terminal && `Terminal ${reservation.departure.terminal}`}
                {reservation.departure.terminal && reservation.departure.gate && ', '}
                {reservation.departure.gate && `Gate ${reservation.departure.gate}`}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">To</div>
            <div className="text-lg font-medium">
              {reservation.arrival.cityName} ({reservation.arrival.airportCode})
            </div>
            <div className="text-sm">
              {formatDateTime(reservation.arrival.timestamp)}
            </div>
            {(reservation.arrival.terminal || reservation.arrival.gate) && (
              <div className="text-sm">
                {reservation.arrival.terminal && `Terminal ${reservation.arrival.terminal}`}
                {reservation.arrival.terminal && reservation.arrival.gate && ', '}
                {reservation.arrival.gate && `Gate ${reservation.arrival.gate}`}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between border-t pt-4">
          <div className="text-lg font-semibold">Total Price</div>
          <div className="text-lg font-semibold">
            ${reservation.totalPriceInUSD.toFixed(2)}
          </div>
        </div>
        
        <Button 
          onClick={handleConfirm} 
          disabled={isConfirming || reservation.hasCompletedPayment}
          className="w-full"
        >
          {isConfirming 
            ? "Processing..." 
            : reservation.hasCompletedPayment 
              ? "Payment Completed" 
              : "Confirm and Proceed to Payment"}
        </Button>
      </div>
    </Card>
  );
}
