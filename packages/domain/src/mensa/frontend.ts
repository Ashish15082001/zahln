import { z } from "zod";
import { MensaResponseSchema, MenuItemResponseSchema } from "./backend";

// ---- shapes used in the app: the same as on the wire, since the server
// already sends camelCase keys and whole cents. Screens import these, so they
// never depend on the wire shape directly.

export const MenuItemSchema = MenuItemResponseSchema;

export interface MenuItem extends z.infer<typeof MenuItemSchema> {}

export const MensaSchema = MensaResponseSchema;

export interface Mensa extends z.infer<typeof MensaSchema> {}
