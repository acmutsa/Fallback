import z from "zod";

export const teamIdSchema = z.object({
	teamId:z.string().min(1).max(30)
});

export const userTeamActionSchema = z.object({
	...teamIdSchema.shape,
	userId: z.string().min(1).max(30),
});

export const joinTeamSchema = z.object({
	inv: z.string().min(1).max(30).optional(),
});

export const teamNameSchema = z.object({
	name:z.string().min(1).max(255)
})
