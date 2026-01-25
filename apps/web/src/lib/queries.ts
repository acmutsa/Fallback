import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { apiClient } from "./api-client";
import { authClient } from "./auth-client";

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

export const joinTeamMutationclient = (inviteCode: string) =>
	mutationOptions({
		mutationKey: ["team", inviteCode, "join"],
		mutationFn: async () => {
			const response = await apiClient.team.join.$post({
				query: {
					inv: inviteCode,
				},
			});
			if (response?.status === 200) {
				return response.json();
			}

			throw new Error("Something went wrong");
		},
	});

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
