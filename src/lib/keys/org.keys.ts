import { useUserStore } from "../stores/userStore";
const user = useUserStore.getState().user;

export const orgKeys = {
  ALL: [user?.id ?? "", "ALL_ORGS"],
  CREATE: [user?.id ?? "", "CREATE_ORG"],
  checkHandle: (handle: string) => ["", "CHECK_ORG_HANDLE", handle],
};
