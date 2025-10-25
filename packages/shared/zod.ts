import z from "zod"

// Teams can allow for their teams to not require a code. In this case, an invite code is not required and we can have the server validate if this is acceptable
export const joinTeamSchema = z.object({
  inv: z.string().min(1).max(30).optional(),
  teamId:z.string().min(1).max(30).optional()
})