import z from "zod";
import { createInsertSchema } from "drizzle-zod";
import { log } from "db";

export const logSchema = createInsertSchema(log).omit({
  id:true,
  occurredAt:true,
});