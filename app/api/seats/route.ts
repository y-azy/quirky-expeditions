import { getSeatMap } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";

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
    const seatMap = await getSeatMap({ 
      flightOfferId: flightOfferId || undefined,
      flightOrderId: flightOrderId || undefined 
    });
    
    return Response.json(seatMap);
  } catch (error) {
    console.error("Error fetching seat map:", error);
    
    if (error instanceof Error) {
      return Response.json({
        error: error.message || "Unable to retrieve seat map information"
      }, { status: 500 });
    }
    
    return Response.json({
      error: "Unable to retrieve seat map information"
    }, { status: 500 });
  }
}
