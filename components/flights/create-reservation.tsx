"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard } from "lucide-react";

interface CreateReservationProps {
  reservation?: {
    id: string;
    seats?: string[];
    flightNumber?: string;
    totalPriceInUSD?: number;
    hasCompletedPayment?: boolean;
    error?: string;
    departure?: {
      cityName: string;
      airportCode: string;
      timestamp: string;
      gate?: string;
      terminal?: string;
    };
    arrival?: {
      cityName: string;
      airportCode: string;
      timestamp: string;
      gate?: string;
      terminal?: string;
    };
    passengerName?: string;
  };
}

export function CreateReservation({ reservation }: CreateReservationProps) {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  
  if (!reservation) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Reservation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 animate-pulse flex items-center justify-center bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Creating reservation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reservation.error) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Reservation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p>Error creating reservation</p>
            <p className="text-sm">{reservation.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reservation.id || !reservation.flightNumber || !reservation.departure || !reservation.arrival) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Reservation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p>Invalid reservation data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  function formatDate(dateString: string): string {
    try {
      return format(parseISO(dateString), "MMM d, yyyy h:mm a");
    } catch {
      return dateString;
    }
  }

  const handleProceedToPayment = () => {
    setIsButtonClicked(true);
    
    const message = `I'd like to proceed with payment for reservation ${reservation.id}`;
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = message;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Reservation Confirmed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-3 rounded-md text-sm">
          Your reservation has been created and is awaiting payment.
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Reservation ID</p>
          <p className="font-mono">{reservation.id}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Flight Details</p>
          <div className="font-medium">{reservation.flightNumber}</div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-sm text-muted-foreground">From</div>
              <div>{reservation.departure.cityName} ({reservation.departure.airportCode})</div>
              <div className="text-sm">{formatDate(reservation.departure.timestamp)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">To</div>
              <div>{reservation.arrival.cityName} ({reservation.arrival.airportCode})</div>
              <div className="text-sm">{formatDate(reservation.arrival.timestamp)}</div>
            </div>
          </div>
        </div>
        
        {reservation.seats && reservation.seats.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Selected Seats</p>
            <p>{reservation.seats.join(', ')}</p>
          </div>
        )}
        
        {reservation.passengerName && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Passenger</p>
            <p>{reservation.passengerName}</p>
          </div>
        )}
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Price</p>
          <p className="text-lg font-semibold">${reservation.totalPriceInUSD?.toFixed(2) || "0.00"}</p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          onClick={handleProceedToPayment}
          disabled={isButtonClicked || reservation.hasCompletedPayment}
          className="w-full gap-2"
        >
          <CreditCard className="size-4" />
          {reservation.hasCompletedPayment ? "Payment Completed" : "Proceed to Payment"}
        </Button>
      </CardFooter>
    </Card>
  );
}
