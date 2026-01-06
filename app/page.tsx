import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { PageTransition } from "@/components/page-transition";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getDashboardMetrics,
  getOnlinePlayersSeries,
  getServers,
  getServerTemplates,
} from "@/lib/sql";

export default async function Page() {
  const metrics = await getDashboardMetrics();
  const onlinePlayersSeries = await getOnlinePlayersSeries();
  const [servers, templates] = await Promise.all([
    getServers(),
    getServerTemplates(),
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
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards
                  activeServers={metrics.activeServers}
                  onlinePlayers={metrics.onlinePlayers}
                  openReports={metrics.openReports}
                />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive data={onlinePlayersSeries} />
                </div>
                <DataTable data={servers} templates={templates} />
              </div>
            </div>
          </div>
        </PageTransition>
      </SidebarInset>
    </SidebarProvider>
  );
}
