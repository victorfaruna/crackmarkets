import React from "react";
import Header from "@/src/components/layout/Header";
import Drawer from "@/src/components/layout/Drawer";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full flex flex-col h-screen bg-background overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Drawer />
        <div className="flex-1 overflow-y-auto w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
