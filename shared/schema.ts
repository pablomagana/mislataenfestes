import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const festivalEvents = pgTable("festival_events", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  location: text("location").notNull(),
  organizer: text("organizer").notNull(),
  category: text("category").notNull(), // 'patronales' or 'populares'
  type: text("type").notNull(), // 'música', 'procesión', 'concierto', etc.
  status: text("status").notNull(), // 'upcoming', 'ongoing', 'finished'
  description: text("description"),
});

export const insertFestivalEventSchema = createInsertSchema(festivalEvents);
export const selectFestivalEventSchema = createInsertSchema(festivalEvents);

export type InsertFestivalEvent = z.infer<typeof insertFestivalEventSchema>;
export type FestivalEvent = typeof festivalEvents.$inferSelect;

// Enums for validation
export const EventCategory = z.enum(['patronales', 'populares']);
export const EventStatus = z.enum(['upcoming', 'ongoing', 'finished']);
export const EventType = z.enum(['música', 'procesión', 'concierto', 'infantil', 'gastronómico', 'tradicional', 'espectáculo']);

export type EventCategoryType = z.infer<typeof EventCategory>;
export type EventStatusType = z.infer<typeof EventStatus>;
export type EventTypeType = z.infer<typeof EventType>;
