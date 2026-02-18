import z from "zod";

const teamId = z.string().min(1).max(30);

export const teamIdSchema = z.object({
	teamId,
});

export const userTeamActionSchema = z.object({
	...teamIdSchema.shape,
	userId: z.string().min(1).max(30),
});

export const joinTeamSchema = z.object({
	inviteId: z.string().min(1).max(30),
});


export const teamNameSchema = z.object({
	name: z.string().min(1).max(255),
});

export const teamRequestSchema = z.object({
	teamId,
	requestId: z.string().min(1).max(50),
});
