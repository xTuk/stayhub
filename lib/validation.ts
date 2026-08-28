import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const listingSchema = z.object({
  title: z.string().trim().min(4, "Title must be at least 4 characters").max(120),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(4000),
  city: z.string().trim().min(2, "City is required").max(100),
  country: z.string().trim().min(2, "Country is required").max(100),
  pricePerNight: z
    .number()
    .int("Price must be a whole number")
    .positive("Price must be greater than 0")
    .max(100000, "Price is unrealistically high"),
  amenities: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  photos: z.array(z.string().url()).max(20).default([]),
});

export const listingUpdateSchema = listingSchema.partial();

export const bookingRequestSchema = z
  .object({
    listingId: z.string().min(1),
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
  })
  .refine(
    (data) => new Date(data.checkIn).getTime() < new Date(data.checkOut).getTime(),
    { message: "Check-out must be after check-in", path: ["checkOut"] }
  );

export const presignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
});
