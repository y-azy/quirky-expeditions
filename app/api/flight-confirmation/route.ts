import { confirmFlightPrice } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";
import { FlightStorageService } from "@/lib/services/flight-storage";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { flightOfferId } = await request.json();
    
    if (!flightOfferId) {
      return new Response("Missing flightOfferId parameter", { status: 400 });
    }
    
    // Get the full flight offer from Redis
    const flightOffer = await FlightStorageService.getFlightOffer(flightOfferId);
    
    if (!flightOffer) {
      return Response.json({
        error: "Flight offer not found. Please perform a new flight search.",
        status: "error"
      }, { status: 404 });
    }
    
    try {
      const pricingResponse = await confirmFlightPrice(flightOffer);
      return Response.json(pricingResponse);
    } catch (error) {
      console.error("Error confirming flight price:", error);
      
      return Response.json({
        error: error instanceof Error ? error.message : "Failed to confirm flight price",
        status: "error",
        message: "Unable to confirm flight price. Please try again with a new flight search."
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    return Response.json({
      error: error instanceof Error ? error.message : "Unable to process pricing request",
      status: "error"
    }, { status: 500 });
  }
}
