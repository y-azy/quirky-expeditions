"use client";

import { format, parseISO } from "date-fns";
import { Card } from "../ui/card";
// Remove QR code for now, we'll add it later after installing the dependency
// import { QRCodeSVG } from "qrcode.react";

interface BoardingPassProps {
  boardingPass?: {
    reservationId: string;
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
    error?: string;
  };
}

export function DisplayBoardingPass({ boardingPass }: BoardingPassProps) {
  if (!boardingPass) {
    // Skeleton loading state
    return (
      <Card className="p-6 skeleton flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Boarding Pass</h3>
          <div className="text-lg font-mono">XX1234</div>
        </div>
        <div className="text-lg font-semibold">Passenger Name</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm">From</div>
            <div className="text-lg font-semibold">City</div>
            <div className="text-sm">XXX</div>
            <div className="text-sm">Gate X</div>
            <div className="text-sm">Terminal X</div>
            <div className="text-sm">Time</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm">To</div>
            <div className="text-lg font-semibold">City</div>
            <div className="text-sm">XXX</div>
            <div className="text-sm">Gate X</div>
            <div className="text-sm">Terminal X</div>
            <div className="text-sm">Time</div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-lg font-semibold">Seat</div>
          <div className="text-lg font-mono">00X</div>
        </div>
      </Card>
    );
  }

  if (boardingPass.error) {
    return (
      <Card className="p-6 border-destructive">
        <div className="text-destructive font-semibold">Error</div>
        <p>{boardingPass.error}</p>
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

  // Create QR code data with boarding pass information
  const qrData = JSON.stringify({
    pax: boardingPass.passengerName,
    flight: boardingPass.flightNumber,
    from: boardingPass.departure.airportCode,
    to: boardingPass.arrival.airportCode,
    seat: boardingPass.seat,
    ref: boardingPass.reservationId,
  });

  return (
    <Card className="p-6 bg-primary/5">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Boarding Pass</h3>
          <div className="text-lg font-mono">{boardingPass.flightNumber}</div>
        </div>
        
        <div className="text-lg font-semibold">{boardingPass.passengerName}</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">From</div>
            <div className="text-lg font-semibold">{boardingPass.departure.cityName}</div>
            <div className="text-sm">{boardingPass.departure.airportCode}</div>
            <div className="text-sm">Gate {boardingPass.departure.gate}</div>
            <div className="text-sm">Terminal {boardingPass.departure.terminal}</div>
            <div className="text-sm">{formatDateTime(boardingPass.departure.timestamp)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">To</div>
            <div className="text-lg font-semibold">{boardingPass.arrival.cityName}</div>
            <div className="text-sm">{boardingPass.arrival.airportCode}</div>
            <div className="text-sm">Gate {boardingPass.arrival.gate}</div>
            <div className="text-sm">Terminal {boardingPass.arrival.terminal}</div>
            <div className="text-sm">{formatDateTime(boardingPass.arrival.timestamp)}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <div className="text-lg font-semibold">Seat</div>
            <div className="text-lg font-mono">{boardingPass.seat}</div>
          </div>
          <div className="p-2 bg-white rounded-md">
            {/* We'll add the QR code back once the dependency is installed */}
            <div className="w-[120px] h-[120px] bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              QR Code placeholder
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
