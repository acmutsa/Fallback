import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { apiClient } from "../api-client";
import { authClient } from "../auth-client";

/**
 * A query client for pinging the server to check its health status.
 * @returns An object containing the query key and query function for pinging the server.
 */
export const pingServerQueryClient = queryOptions({
	queryKey: ["ping"],
	queryFn: async () => {
		const response = await apiClient.health.$get().catch(() => undefined);

		if (response?.status === 200) {
			const data = await response.json();
			return data.status;
		}

		return "Unable to establish connection with server";
	},
});

/**
 * A query client for retrieving the current authenticated user's information.
 * @returns An object containing the query key and query function for fetching the user data.
 */
export const getUserQueryClient = queryOptions({
	queryKey: ["user"],
	queryFn: async () => {
		const response = await authClient.getSession();

		if (!response.error && response.data) {
			return response.data.user;
		}
		throw new Error("Something went wrong");
	},
});

/**
 * A query client for fetching the teams that the current user belongs to.
 * @returns An object containing the query key and query function for retrieving the user's teams.
 */
export const getUserTeamsQueryClient = queryOptions({
	queryKey: ["user", "teams"],
	queryFn: async () => {
		const response = await apiClient.team.$get();
		if (response?.status === 200) {
			return response.json();
		}

		throw new Error("Something went wrong");
	},
});
/**
 * A mutation client for joining a team using an invite code.
 * @param inviteCode - The invite code for the team to join
 * @returns An object containing the mutation key and mutation function for joining a team.
 */
export const joinTeamMutationclient = (inviteCode: string) =>
	mutationOptions({
		mutationKey: ["team", inviteCode, "join"],
		mutationFn: async () => {
			const response = await apiClient.team.invites[
				":inviteId"
			].accept.$post({
				param: {
					inviteId: inviteCode,
				},
			});
			if (response?.status === 200) {
				return response.json();
			}

			throw new Error("Something went wrong");
		},
	});

/**
 * A mutation client for leaving a team.
 * @param teamId - The ID of the team to leave
 * @param userId - The ID of the user leaving the team
 * @returns An object containing the mutation key and mutation function for leaving a team.
 */
export const leaveTeamMutationClient = (teamId: string, userId: string) =>
	mutationOptions({
		mutationKey: ["team", teamId, userId, "remove"],
		mutationFn: async () => {
			const response = await apiClient.team[":teamId"][
				":userId"
			].remove.$delete({
				param: {
					teamId,
					userId,
				},
			});
			if (response?.status === 200) {
				return response.json();
			}

			throw new Error("Something went wrong");
		},
	});
