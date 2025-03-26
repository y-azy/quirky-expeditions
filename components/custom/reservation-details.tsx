import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReservationDetailsProps {
  reservation: {
    id: string;
    flightNumber: string;
    seats: string[];
    totalPrice: number;
    departure: {
      cityName: string;
      airportCode: string;
      timestamp: string;
    };
    arrival: {
      cityName: string;
      airportCode: string;
      timestamp: string;
    };
    passengerName: string;
  };
  onConfirm: () => void;
}

export function ReservationDetails({ reservation, onConfirm }: ReservationDetailsProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold">Reservation Details</h3>
        <div className="space-y-2">
          <p><span className="font-semibold">Flight:</span> {reservation.flightNumber}</p>
          <p><span className="font-semibold">Passenger:</span> {reservation.passengerName}</p>
          <p><span className="font-semibold">Seats:</span> {reservation.seats.join(", ")}</p>
          <p><span className="font-semibold">Total Price:</span> ${reservation.totalPrice.toFixed(2)}</p>
        </div>
        <Button onClick={onConfirm} className="w-full">
          Confirm and Proceed to Payment
        </Button>
      </div>
    </Card>
  );
}
