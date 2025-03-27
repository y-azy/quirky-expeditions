import { getFlightInspirationSearch } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin");
  const maxPrice = searchParams.get("maxPrice");

  if (!origin) {
    return new Response("Missing origin parameter", { status: 400 });
  }

  try {
    const params: { origin: string; maxPrice?: number } = {
      origin
    };
    
    if (maxPrice) {
      params.maxPrice = parseInt(maxPrice);
    }
    
    const inspirations = await getFlightInspirationSearch(params);
    return Response.json(inspirations);
  } catch (error) {
    console.error("Error fetching flight inspirations:", error);
    return new Response("Failed to fetch flight inspirations", { status: 500 });
  }
}
