import { useMutation } from "@tanstack/react-query";
import { logout } from "../services/auth";
import { useUserStore } from "../stores/userStore";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const resetUser = useUserStore((s) => s.resetUser);
  
  const { mutate, isSuccess } = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      resetUser();
      router.replace("/login");
    }
  });

  const initLogout = () => {
    mutate();
  };

  return { initLogout, isSuccess };
};
