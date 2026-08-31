import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, updateUser, linkRoboForex, UpdateUserPayload } from "../services/user";
import { useUserStore } from "../stores/userStore";
import { useAppStore } from "../stores/appStore";

export const useUser = () => {
  const setIsConnectedToRoboForex = useAppStore(
    (s) => s.setIsConnectedToRoboForex,
  );

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const result = await getUser();
      // Hydrate broker connection state from server
      if (result.success && result.data?.user) {
        const linked = result.data.user.roboforex_linked === true;
        setIsConnectedToRoboForex(linked);
      }
      return result;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(payload),
    onSuccess: (res) => {
      if (res.success && res.data?.user) {
        // Sync user store
        setUser({
          ...res.data.user,
          firstName: res.data.user.first_name,
          lastName: res.data.user.last_name,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useLinkRoboForex = () => {
  const queryClient = useQueryClient();
  const setIsConnectedToRoboForex = useAppStore(
    (s) => s.setIsConnectedToRoboForex,
  );

  return useMutation({
    mutationFn: (roboforexId: string) => linkRoboForex(roboforexId),
    onSuccess: (res) => {
      if (res.success) {
        setIsConnectedToRoboForex(true);
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};
