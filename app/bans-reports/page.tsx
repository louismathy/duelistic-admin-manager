import { AppSidebar } from "@/components/app-sidebar";
import { BansReportsContent } from "@/components/bans-reports-content";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getActiveBans, getPlayerReports } from "@/lib/sql";

import { addActiveBan, closePlayerReport, unbanActiveBan } from "./actions";

export const dynamic = "force-dynamic";

export default async function BansReportsPage() {
  const [bans, reports] = await Promise.all([
    getActiveBans(),
    getPlayerReports(),
  ]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <PageTransition>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Bans & Reports
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Review active bans and investigate player reports.
                    </p>
                  </div>
                </div>
                <BansReportsContent
                  initialBans={bans}
                  reports={reports}
                  onUnban={unbanActiveBan}
                  onCloseReport={closePlayerReport}
                  onAddBan={addActiveBan}
                />
              </div>
            </div>
          </div>
        </PageTransition>
      </SidebarInset>
    </SidebarProvider>
  );
}
