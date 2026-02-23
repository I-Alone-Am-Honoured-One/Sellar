import { z } from "zod";

export const roleSchema = z.enum(["USER", "MODERATOR", "ADMIN"]);
export const shippingProviderSchema = z.enum(["OMNIVA", "LP_EXPRESS"]);

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z.string().min(10)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  totpCode: z.string().length(6).optional()
});

export const createListingSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20),
  category: z.string(),
  condition: z.enum(["NEW", "USED", "REFURBISHED"]),
  priceCents: z.number().int().positive(),
  stock: z.number().int().positive(),
  shippingProviders: z.array(shippingProviderSchema).min(1),
  guildId: z.string().optional()
});

export const checkoutSchema = z.object({
  listingId: z.string(),
  quantity: z.number().int().positive().default(1),
  shippingProvider: shippingProviderSchema,
  pickupPointId: z.string(),
  buyerNote: z.string().max(500).optional()
});

export const dealTransitionSchema = z.object({
  action: z.enum([
    "PAY",
    "CREATE_LABEL",
    "DROPOFF",
    "IN_TRANSIT",
    "DELIVER",
    "PICKUP",
    "ACCEPT",
    "RELEASE",
    "DISPUTE_OPEN",
    "DISPUTE_RESOLVE_REFUND",
    "DISPUTE_RESOLVE_RELEASE"
  ]),
  metadata: z.record(z.any()).optional()
});

export const chatMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1).max(2000),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM"]).default("TEXT")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
