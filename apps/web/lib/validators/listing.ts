import { z } from 'zod';

export const createListingSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    address: z.string().min(1, "Address is required"),
    rent_xlm: z.number().positive("Rent must be a positive number"),
    bedrooms: z.number().int().min(0, "Bedrooms cannot be negative"),
    bathrooms: z.number().int().min(1, "Must have at least 1 bathroom"),
    furnished: z.boolean(),
    pet_friendly: z.boolean(),
    amenities: z.array(z.string()).default([]),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
