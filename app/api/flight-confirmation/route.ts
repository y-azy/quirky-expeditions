import { confirmFlightPrice } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";

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
    
    const pricingResponse = await confirmFlightPrice(flightOfferId);
    return Response.json(pricingResponse);
  } catch (error) {
    console.error("Error confirming flight price:", error);
    
    if (error instanceof Error) {
      return Response.json({
        error: error.message || "Unable to connect to flight pricing system"
      }, { status: 500 });
    }
    
    return Response.json({
      error: "Unable to connect to flight pricing system"
    }, { status: 500 });
  }
}
