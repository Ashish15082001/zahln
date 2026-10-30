import { z } from "zod";

// ---- parts of a mensa

export const LocalizedTextResponseSchema = z.object({
  de: z.string(),
  en: z.string(),
});

export interface LocalizedTextResponse extends z.infer<
  typeof LocalizedTextResponseSchema
> {}

// Whole cents: a fractional or negative price is a server bug, and money maths
// on it would go wrong quietly.
const CentsResponseSchema = z.int().min(0);

export const PricesResponseSchema = z.object({
  student: CentsResponseSchema,
  staff: CentsResponseSchema,
  guest: CentsResponseSchema,
});

export interface PricesResponse extends z.infer<typeof PricesResponseSchema> {}

export const MenuItemResponseSchema = z.object({
  id: z.string().min(1),
  name: LocalizedTextResponseSchema,
  prices: PricesResponseSchema,
});

export interface MenuItemResponse extends z.infer<
  typeof MenuItemResponseSchema
> {}

export const TillResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
});

export interface TillResponse extends z.infer<typeof TillResponseSchema> {}

// ---- GET /mensas

export const MensaResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  city: z.string(),
  tills: z.array(TillResponseSchema),
  menu: z.array(MenuItemResponseSchema),
});

export interface MensaResponse extends z.infer<typeof MensaResponseSchema> {}

export const MensaListResponseSchema = z.object({
  items: z.array(MensaResponseSchema),
});

export interface MensaListResponse extends z.infer<
  typeof MensaListResponseSchema
> {}
