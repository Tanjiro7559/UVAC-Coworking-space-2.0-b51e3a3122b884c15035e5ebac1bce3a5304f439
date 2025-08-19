import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  company: text("company"),
  role: text("role"),
  profile_image: text("profile_image"), // URL to the profile image
  created_at: timestamp("created_at").notNull().defaultNow()
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service"),
  message: text("message").notNull(),
  subscribe: boolean("subscribe").default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password_hash: true,
  first_name: true,
  last_name: true,
  email: true,
  company: true,
  role: true,
  profile_image: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).pick({
  user_id: true,
  name: true,
  email: true,
  phone: true,
  service: true,
  message: true,
  subscribe: true,
}).transform(data => ({
  ...data,
  subscribe: data.subscribe ?? false  // Ensure subscribe is always a boolean
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export interface User {
  id: number;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  role: string | null;
  profile_image: string | null;
  created_at: Date;
};

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export interface Inquiry {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  subscribe: boolean | null;
  created_at: Date;
};
