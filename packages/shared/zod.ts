import z from "zod";

export const teamIdValidator = z.string().min(1).max(30);
export const userTeamActionSchema = z.object({
	teamId: teamIdValidator,
	userId: z.string().min(1).max(30),
});

export const joinTeamSchema = z.object({
	inv: z.string().min(1).max(30).optional(),
});

export const teamNameValidator = z.string().min(1).max(255);
