import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  json,
  uuid,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";

export const users = pgTable("User", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email", { length: 64 }).notNull(),
  password: text("password", { length: 64 }),
});

export type User = typeof users.$inferSelect;

export const chats = pgTable("Chat", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id),
});

export type Chat = typeof chats.$inferSelect;

export const reservations = pgTable("Reservation", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  details: json("details").notNull(),
  hasCompletedPayment: boolean("hasCompletedPayment").default(false).notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id),
});

export type Reservation = typeof reservations.$inferSelect;

export const flightBookings = pgTable("FlightBooking", {
  id: uuid("id").defaultRandom().primaryKey(),
  reservationId: uuid("reservationId")
    .notNull()
    .references(() => reservations.id, { onDelete: 'cascade' }),
  flightNumber: text("flightNumber", { length: 10 }).notNull(),
  flightOfferId: text("flightOfferId", { length: 64 }).notNull(),
  seatNumbers: json("seatNumbers").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FlightBooking = typeof flightBookings.$inferSelect;
