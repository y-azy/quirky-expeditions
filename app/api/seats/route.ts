import { getSeatMap } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";
import { FlightStorageService } from "@/lib/services/flight-storage";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const flightOfferId = searchParams.get("flightOfferId");
  const flightOrderId = searchParams.get("flightOrderId");

  if (!flightOfferId && !flightOrderId) {
    return new Response("Either flightOfferId or flightOrderId is required", { status: 400 });
  }

  try {
    if (flightOfferId) {
      // Get the full flight offer from Redis
      const flightOffer = await FlightStorageService.getFlightOffer(flightOfferId);
      
      if (!flightOffer) {
        return Response.json({
          error: "Flight offer not found. Please perform a new flight search.",
          status: "error"
        }, { status: 404 });
      }
      
      try {
        const seatMap = await getSeatMap({ flightOfferId: flightOffer });
        return Response.json(seatMap);
      } catch (error) {
        console.error("Error fetching seat map:", error);
        return Response.json({
          error: error instanceof Error ? error.message : "Failed to retrieve seat map",
          status: "error",
          message: "Unable to retrieve seat information at this time."
        }, { status: 500 });
      }
    } else {
      // Handle flight order ID case
      try {
        const seatMap = await getSeatMap({ flightOrderId });
        return Response.json(seatMap);
      } catch (error) {
        console.error("Error fetching seat map:", error);
        return Response.json({
          error: error instanceof Error ? error.message : "Failed to retrieve seat map",
          status: "error",
          message: "Unable to retrieve seat information for this order."
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    return Response.json({
      error: error instanceof Error ? error.message : "Unable to retrieve seat map information",
      status: "error"
    }, { status: 500 });
  }
}
