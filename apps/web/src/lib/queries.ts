import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "./functions/api";

export const pingServerQuery = queryOptions({
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
