import { airportTools } from "./airport-tools";
import { flightTools } from "./flight-tools";
import { paymentTools } from "./payment-tools";
import { weatherTools } from "./weather-tools";
import { reservationTools } from "./reservation-tools";
import { airlineTools } from "./airline-tools";

// Export schemas
export * from "./schemas";

// Export all tools for use in the API route
export const allTools = {
  ...airportTools,
  ...flightTools,
  ...weatherTools,
  ...paymentTools,
  ...reservationTools,
  ...airlineTools
};
