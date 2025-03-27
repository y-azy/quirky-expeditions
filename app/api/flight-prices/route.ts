import { getFlightPrice } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departureDate = searchParams.get("departureDate");

  if (!origin || !destination || !departureDate) {
    return new Response("Missing required parameters", { status: 400 });
  }

  try {
    const priceMetrics = await getFlightPrice({
      origin,
      destination,
      departureDate
    });
    
    return Response.json(priceMetrics);
  } catch (error) {
    console.error("Error fetching flight price metrics:", error);
    return new Response("Failed to fetch flight price metrics", { status: 500 });
  }
}
