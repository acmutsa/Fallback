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
		const response = await apiClient.team.$get().catch(() => undefined);
		if (response?.status === 200) {
			return response.json();
		}

		throw new Error("Something went wrong");
	},
});

export const joinTeamMutationclient =  (teamId:string) => mutationOptions({
	mutationKey:["team", teamId, "join"],
	mutationFn: async () => {
		const response = 
	}
})

export const leaveTeamMutationClient = (teamId: string) =>
	mutationOptions({
		mutationKey: ["team", teamId, "leave"],
		mutationFn: async () => {
			const response = await apiClient.team[":teamId"].leave.$post({
				param: teamId,
			});
			if (response?.status === 200) {
				return response.json();
			}

			throw new Error("Something went wrong");
		},
});
