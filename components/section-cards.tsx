import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SectionCardsProps = {
  activeServers: number;
  onlinePlayers: number;
  openReports: number;
};

export function SectionCards({
  activeServers,
  onlinePlayers,
  openReports,
}: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Servers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[150px]/card:text-3xl">
            {activeServers}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Online Players</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[150px]/card:text-3xl">
            {onlinePlayers}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Open Reports</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[150px]/card:text-3xl">
            {openReports}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
