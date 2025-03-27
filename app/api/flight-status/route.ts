import { getFlightStatus } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const carrierCode = searchParams.get("carrierCode");
  const flightNumber = searchParams.get("flightNumber");
  const date = searchParams.get("date");

  if (!carrierCode || !flightNumber || !date) {
    return new Response("Missing required parameters", { status: 400 });
  }

  try {
    const status = await getFlightStatus({
      carrierCode,
      flightNumber,
      scheduledDate: date
    });
    
    return Response.json(status);
  } catch (error) {
    console.error("Error fetching flight status:", error);
    return new Response("Failed to fetch flight status", { status: 500 });
  }
}
