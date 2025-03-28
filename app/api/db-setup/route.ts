import { sql } from '@vercel/postgres';
import { auth } from "@/app/(auth)/auth";

export async function POST(request: Request) {
  // Only allow authenticated admin users to run this
  const session = await auth();
  
  if (!session || !session.user || session.user.email !== process.env.ADMIN_EMAIL) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  try {
    // Create FlightBooking table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "FlightBooking" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "reservationId" uuid NOT NULL,
        "flightNumber" varchar(10) NOT NULL,
        "flightOfferId" varchar(64) NOT NULL,
        "seatNumbers" json NOT NULL,
        "totalPrice" decimal(10, 2) NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      )
    `;
    
    // Add foreign key constraint if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = 'FlightBooking' AND constraint_name = 'FlightBooking_reservationId_Reservation_id_fk'
        ) THEN
          ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_reservationId_Reservation_id_fk" 
          FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    return new Response(JSON.stringify({ success: true, message: "Database setup completed successfully" }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Database setup failed", 
      error: error instanceof Error ? error.message : String(error)
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
