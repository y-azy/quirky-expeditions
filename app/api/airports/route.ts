import { searchAirports } from "@/lib/amadeus-helpers";
import { auth } from "@/app/(auth)/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword");

  if (!keyword) {
    return new Response("Missing keyword parameter", { status: 400 });
  }

  try {
    const airports = await searchAirports(keyword);
    return Response.json(airports);
  } catch (error) {
    console.error("Error searching airports:", error);
    return new Response("Failed to search airports", { status: 500 });
  }
}
