import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServers, getServerTemplates } from "@/lib/sql";

export default async function ServersPage() {
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
                <div className="px-4 lg:px-6">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Servers
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Live status and capacity across all environments.
                    </p>
                  </div>
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
