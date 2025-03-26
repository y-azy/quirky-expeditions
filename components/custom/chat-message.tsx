import { Message } from 'ai';
import { FlightCard } from './flight-card';
import { FlightDetails } from './flight-details';
import { SeatMap } from './seat-map';
import { BoardingPass } from './boarding-pass';
import { PaymentForm } from './payment-form';
import { AirportSearch } from './airport-search';
import { AirlineInfo } from './airline-info';
import { ReservationDetails } from './reservation-details';
import { FlightInfo } from './flight-info';

interface ChatMessageProps {
  message: Message;
  onFlightSelect?: (flight: any) => void;
  onSeatSelect?: (seats: string[]) => void;
  onPaymentComplete?: () => void;
}

export function ChatMessage({ 
  message, 
  onFlightSelect,
  onSeatSelect,
  onPaymentComplete 
}: ChatMessageProps) {
  const renderToolResponse = (toolCall: any) => {
    switch (toolCall.toolName) {
      case 'searchFlights':
        return toolCall.result?.flights?.map((flight: any) => (
          <FlightCard 
            key={flight.id} 
            flight={flight}
            onSelect={() => onFlightSelect?.(flight)}
          />
        ));
      case 'selectSeats':
        return (
          <SeatMap 
            seats={toolCall.result.seats}
            onSelect={onSeatSelect!}
          />
        );
      case 'displayBoardingPass':
        return (
          <BoardingPass 
            boardingPass={toolCall.result}
          />
        );
      case 'searchAirports':
        return (
          <AirportSearch 
            onSelect={(airport) => console.log('Selected airport:', airport)} 
          />
        );
      case 'getAirlineInfo':
        return <AirlineInfo airline={toolCall.result} />;
      case 'createReservation':
        return (
          <ReservationDetails 
            reservation={toolCall.result}
            onConfirm={() => console.log('Reservation confirmed:', toolCall.result.id)}
          />
        );
      case 'getFlightInfo':
        return <FlightInfo {...toolCall.result} />;
      // Add more tool response renderers as needed
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      {message.role === 'assistant' && message.toolInvocations?.map((toolCall) => (
        <div key={toolCall.toolCallId}>
          {toolCall.state === 'result' && renderToolResponse(toolCall)}
        </div>
      ))}
      <div className="whitespace-pre-wrap">{message.content}</div>
    </div>
  );
}
