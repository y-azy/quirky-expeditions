import { getCheapestFlightDates } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  if (!origin || !destination) {
    return new Response("Missing origin or destination parameters", { status: 400 });
  }

  try {
    const cheapestDates = await getCheapestFlightDates({
      origin,
      destination
    });
    
    return Response.json(cheapestDates);
  } catch (error) {
    console.error("Error fetching cheapest dates:", error);
    return new Response("Failed to fetch cheapest dates", { status: 500 });
  }
}
