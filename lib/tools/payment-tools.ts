import { z } from "zod";
import { getReservationById, updateReservation } from "@/db/queries";

export const paymentTools = {
  authorizePayment: {
    description: "User will enter credentials to authorize payment, wait for user to respond when they are done",
    parameters: z.object({
      reservationId: z.string().describe("Unique identifier for the reservation"),
    }),
    execute: async ({ reservationId }: { reservationId: string }) => {
      try {
        const reservation = await getReservationById({ id: reservationId });
        return { 
          reservationId,
          hasCompletedPayment: reservation.hasCompletedPayment || false,
          status: "success" 
        };
      } catch (error) {
        console.error("Error fetching reservation for payment:", error);
        return { 
          reservationId, 
          hasCompletedPayment: false,
          error: error instanceof Error ? error.message : "Failed to authorize payment",
          status: "error",
          message: "Unable to process payment authorization at this time."
        };
      }
    },
  },
  verifyPayment: {
    description: "Verify payment status",
    parameters: z.object({
      reservationId: z.string().describe("Unique identifier for the reservation"),
    }),
    execute: async ({ reservationId }: { reservationId: string }) => {
      try {
        const reservation = await getReservationById({ id: reservationId });
        return { 
          hasCompletedPayment: reservation.hasCompletedPayment || false,
          status: "success"
        };
      } catch (error) {
        console.error("Error verifying payment status:", error);
        return { 
          hasCompletedPayment: false,
          error: error instanceof Error ? error.message : "Failed to verify payment status",
          status: "error", 
          message: "Unable to verify payment status at this time."
        };
      }
    },
  }
};
