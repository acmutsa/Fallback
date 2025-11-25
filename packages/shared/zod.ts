import z from "zod";

export const teamIdValidator = z.string().min(1).max(30);
// Teams can allow for their teams to not require a code. In this case, an invite code is not required and we can have the server validate if this is acceptable
export const joinTeamSchema = z.object({
	inv: z.string().min(1).max(30).optional(),
});
