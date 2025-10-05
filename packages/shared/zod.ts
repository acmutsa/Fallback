import z from "zod"


export const joinTeamSchema = z.object({
  inv: z.string().min(1).max(30).catch("")
})