import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "./api-client";

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

export const getUserTeamsQueryClient = queryOptions({
	queryKey: ["user", "teams"],
	queryFn: async () => {
		const response = await apiClient.team.$get().catch(()=>undefined);
		if (response?.status === 200){
			return response.json();
		}

		throw new Error("Something went wrong");
	},
});

export const getUserInviteQueryClient = (inv?:string, teamId?:string) => queryOptions({
	queryKey: ["team","join", inv, teamId],
	queryFn: async () => {
		if (!inv && !teamId){
			throw new Error("Invite code or Team ID required");
		}
		const response = await apiClient.team.join.$post({
			param:{
				inv,
				teamId
			}
		})
	},
});
