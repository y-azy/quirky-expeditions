import { searchFlights } from "@/lib/amadeus-helpers";
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
  const returnDate = searchParams.get("returnDate") || undefined;
  const adults = searchParams.get("adults") || "1";

  if (!origin || !destination || !departureDate) {
    return new Response("Missing required parameters", { status: 400 });
  }

  try {
    const flights = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults
    });
    
    return Response.json(flights);
  } catch (error) {
    console.error("Error searching flights:", error);
    return new Response("Failed to search flights", { status: 500 });
  }
}
