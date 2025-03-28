"use client";

import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";

interface BoardingPassProps {
  boardingPass?: {
    reservationId?: string;
    passengerName?: string;
    flightNumber?: string;
    seat?: string;
    departure?: {
      cityName: string;
      airportCode: string;
      airportName: string;
      timestamp: string;
      terminal: string;
      gate: string;
    };
    arrival?: {
      cityName: string;
      airportCode: string;
      airportName: string;
      timestamp: string;
      terminal: string;
      gate: string;
    };
    error?: string;
    message?: string;
    status?: string;
  };
}

export function DisplayBoardingPass({ boardingPass }: BoardingPassProps) {
  if (!boardingPass) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Boarding Pass</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse flex items-center justify-center bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Generating boarding pass...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (boardingPass.error || boardingPass.status === "error") {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Boarding Pass</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p>{boardingPass.message || "Unable to display boarding pass"}</p>
            {boardingPass.error && <p className="text-sm mt-1">{boardingPass.error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!boardingPass.flightNumber || !boardingPass.departure || !boardingPass.arrival || !boardingPass.seat) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Boarding Pass</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-md">
            <p>Incomplete boarding pass information</p>
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

  const boardingPassData = `
    Flight: ${boardingPass.flightNumber}
    Passenger: ${boardingPass.passengerName}
    From: ${boardingPass.departure.airportCode}
    To: ${boardingPass.arrival.airportCode}
    Date: ${format(parseISO(boardingPass.departure.timestamp), "yyyy-MM-dd")}
    Seat: ${boardingPass.seat}
  `;

  return (
    <Card className="w-full bg-gradient-to-r from-primary/10 to-primary/5">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Boarding Pass</CardTitle>
        <div className="text-lg font-mono">{boardingPass.flightNumber}</div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xl font-semibold">{boardingPass.passengerName}</p>
            <p className="text-sm text-muted-foreground">Passenger</p>
          </div>
          <div className="p-2 bg-white rounded-md">
            <QRCodeSVG 
              value={boardingPassData.trim()} 
              size={80} 
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">From</div>
            <div className="text-lg font-semibold">{boardingPass.departure.cityName}</div>
            <div className="text-sm">{boardingPass.departure.airportCode}</div>
            <div className="text-sm">Gate {boardingPass.departure.gate}</div>
            <div className="text-sm">Terminal {boardingPass.departure.terminal}</div>
            <div className="text-sm">{formatDate(boardingPass.departure.timestamp)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">To</div>
            <div className="text-lg font-semibold">{boardingPass.arrival.cityName}</div>
            <div className="text-sm">{boardingPass.arrival.airportCode}</div>
            <div className="text-sm">Gate {boardingPass.arrival.gate}</div>
            <div className="text-sm">Terminal {boardingPass.arrival.terminal}</div>
            <div className="text-sm">{formatDate(boardingPass.arrival.timestamp)}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-lg font-semibold">Seat</div>
          <div className="text-3xl font-mono">{boardingPass.seat}</div>
        </div>
      </CardContent>
    </Card>
  );
}
