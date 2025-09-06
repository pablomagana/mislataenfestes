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
  order: text("order"), // Optional field for custom ordering within the same date
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

// Event Photos table schema
export const eventPhotos = pgTable("event_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  event_id: varchar("event_id").notNull(),
  image_url: text("image_url").notNull(),
  image_thumbnail_url: text("image_thumbnail_url"),
  uploaded_by: varchar("uploaded_by"),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
  caption: text("caption"),
  is_approved: boolean("is_approved").default(true),
  is_reported: boolean("is_reported").default(false),
  metadata: text("metadata"), // JSON string
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertEventPhotoSchema = createInsertSchema(eventPhotos);
export const selectEventPhotoSchema = createInsertSchema(eventPhotos);

export type InsertEventPhoto = z.infer<typeof insertEventPhotoSchema>;
export type EventPhoto = typeof eventPhotos.$inferSelect;
