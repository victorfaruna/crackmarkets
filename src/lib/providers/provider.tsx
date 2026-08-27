"use client";
import React, { Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserStateSetter from "./userStateSetter";
import TopLoader from "@/src/components/shared/TopLoader";

const Providers = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* <AuthGuard /> */}
      <UserStateSetter />
      <Suspense>
        <TopLoader />
      </Suspense>
      {children}
    </QueryClientProvider>
  );
};

export default Providers;
