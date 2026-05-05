import { PropsWithChildren } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function DashboardShell({ children }: PropsWithChildren) {
  return (
    <div className="dashboard-shell">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1600px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />
        <div className="space-y-5">
          <Topbar />
          <div className="rounded-[2rem] border border-white/80 bg-white/76 p-5 shadow-[0_24px_64px_rgba(132,143,176,0.1)] backdrop-blur-xl sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
