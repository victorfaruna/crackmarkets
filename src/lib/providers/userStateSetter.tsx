"use client";
import { useEffect } from "react";
import { useUserStore } from "../stores/userStore";
import { useUser } from "../hooks/useUser";

const UserStateSetter = () => {
  const setUser = useUserStore((s) => s.setUser);
  const { isLoading, isSuccess, data } = useUser();

  useEffect(() => {
    if (isSuccess && data?.data?.user) {
      setUser(data.data.user);
    }
  }, [isLoading, isSuccess, data, setUser]);

  return null;
};

export default UserStateSetter;

