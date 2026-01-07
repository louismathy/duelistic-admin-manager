"use client";

import * as React from "react";
import { IconChevronDown } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BanRow = {
  id: number;
  username: string;
  reason: string;
  start: string;
  banLength: string;
  currentLength: string;
};

type ReportRow = {
  id: number;
  reportedPlayer: string;
  reporterPlayer: string;
  reason: string;
  location: string;
};

type BansReportsContentProps = {
  initialBans: BanRow[];
  reports: ReportRow[];
  onUnban: (id: number) => Promise<void>;
  onCloseReport: (id: number) => Promise<void>;
  onAddBan: (
    username: string,
    reason: string,
    lengthMinutes: number
  ) => Promise<BanRow[]>;
};

export function BansReportsContent({
  initialBans,
  reports,
  onUnban,
  onCloseReport,
  onAddBan,
}: BansReportsContentProps) {
  const [bans, setBans] = React.useState<BanRow[]>(initialBans);
  const [reportRows, setReportRows] = React.useState<ReportRow[]>(reports);
  const [banError, setBanError] = React.useState<string | null>(null);
  const [unbanningId, setUnbanningId] = React.useState<number | null>(null);
  const [reportError, setReportError] = React.useState<string | null>(null);
  const [closingReportId, setClosingReportId] = React.useState<number | null>(
    null
  );
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const [addError, setAddError] = React.useState<string | null>(null);
  const [newUsername, setNewUsername] = React.useState("");
  const [newReason, setNewReason] = React.useState("");
  const [newLength, setNewLength] = React.useState("");
  const [newUnit, setNewUnit] = React.useState("hours");
  const [query, setQuery] = React.useState("");
  const [isBansOpen, setIsBansOpen] = React.useState(true);
  const [isReportsOpen, setIsReportsOpen] = React.useState(true);
  const normalizedQuery = query.trim().toLowerCase();

  React.useEffect(() => {
    setBans(initialBans);
  }, [initialBans]);

  React.useEffect(() => {
    setReportRows(reports);
  }, [reports]);

  const handleUnban = async (id: number) => {
    setBanError(null);
    setUnbanningId(id);
    try {
      await onUnban(id);
      setBans((current) => current.filter((ban) => ban.id !== id));
    } catch (error) {
      setBanError(
        error instanceof Error ? error.message : "Failed to unban"
      );
    } finally {
      setUnbanningId(null);
    }
  };

  const handleCloseReport = async (id: number) => {
    setReportError(null);
    setClosingReportId(id);
    try {
      await onCloseReport(id);
      setReportRows((current) =>
        current.filter((report) => report.id !== id)
      );
    } catch (error) {
      setReportError(
        error instanceof Error ? error.message : "Failed to close report."
      );
    } finally {
      setClosingReportId(null);
    }
  };

  const handleAddBan = async (event: React.FormEvent) => {
    event.preventDefault();
    setAddError(null);

    const lengthValue = Number(newLength);
    if (!newUsername.trim() || !newReason.trim()) {
      setAddError("Username and reason are required.");
      return;
    }
    if (!Number.isFinite(lengthValue) || lengthValue <= 0) {
      setAddError("Ban length must be a positive number.");
      return;
    }

    const unitMultiplier =
      newUnit === "minutes" ? 1 : newUnit === "days" ? 1440 : 60;
    const lengthMinutes = Math.round(lengthValue * unitMultiplier);

    setIsAdding(true);
    try {
      const nextBans = await onAddBan(
        newUsername,
        newReason,
        lengthMinutes
      );
      setBans(nextBans);
      setNewUsername("");
      setNewReason("");
      setNewLength("");
      setNewUnit("hours");
      setIsAddOpen(false);
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : "Failed to add ban."
      );
    } finally {
      setIsAdding(false);
    }
  };

  const filteredBans = React.useMemo(() => {
    if (!normalizedQuery) {
      return bans;
    }
    return bans.filter((ban) => {
      return (
        ban.username.toLowerCase().includes(normalizedQuery) ||
        ban.reason.toLowerCase().includes(normalizedQuery) ||
        ban.start.toLowerCase().includes(normalizedQuery) ||
        ban.banLength.toLowerCase().includes(normalizedQuery) ||
        ban.currentLength.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, bans]);

  const filteredReports = React.useMemo(() => {
    if (!normalizedQuery) {
      return reportRows;
    }
    return reportRows.filter((report) => {
      return (
        report.reportedPlayer.toLowerCase().includes(normalizedQuery) ||
        report.reporterPlayer.toLowerCase().includes(normalizedQuery) ||
        report.reason.toLowerCase().includes(normalizedQuery) ||
        report.location.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, reportRows]);

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search usernames, reasons, locations..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button className="shrink-0">Add ban</Button>
            </SheetTrigger>
            <SheetContent>
              <form onSubmit={handleAddBan} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>Add ban</SheetTitle>
                  <SheetDescription>
                    Create a new active ban entry.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-4 px-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ban-username">Username</Label>
                    <Input
                      id="ban-username"
                      value={newUsername}
                      onChange={(event) => setNewUsername(event.target.value)}
                      placeholder="Player username"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ban-reason">Ban reason</Label>
                    <Input
                      id="ban-reason"
                      value={newReason}
                      onChange={(event) => setNewReason(event.target.value)}
                      placeholder="Reason for ban"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ban-length">Ban length</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ban-length"
                        value={newLength}
                        onChange={(event) => setNewLength(event.target.value)}
                        placeholder="Number"
                        inputMode="numeric"
                        required
                      />
                      <Select value={newUnit} onValueChange={setNewUnit}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {addError ? (
                    <div className="text-destructive text-sm">{addError}</div>
                  ) : null}
                </div>
                <SheetFooter>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? "Adding..." : "Create ban"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="bg-secondary/70 hover:bg-secondary/90 text-secondary-foreground flex items-center justify-between rounded-lg border px-4 py-2 text-left text-sm font-semibold transition"
            onClick={() => setIsBansOpen((open) => !open)}
            onContextMenu={(event) => {
              event.preventDefault();
              setIsBansOpen((open) => !open);
            }}
          >
            Active bans
            <IconChevronDown
              className={`size-4 transition-transform ${isBansOpen ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className={`overflow-hidden rounded-lg border transition-all duration-300 ${
              isBansOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Ban reason</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Ban length</TableHead>
                  <TableHead>Current length</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banError ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-destructive text-center"
                    >
                      {banError}
                    </TableCell>
                  </TableRow>
                ) : filteredBans.length ? (
                  filteredBans.map((ban) => (
                    <TableRow key={ban.id}>
                      <TableCell className="font-medium">
                        {ban.username}
                      </TableCell>
                      <TableCell>{ban.reason}</TableCell>
                      <TableCell>{ban.start}</TableCell>
                      <TableCell>{ban.banLength}</TableCell>
                      <TableCell>{ban.currentLength}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnban(ban.id)}
                          disabled={unbanningId === ban.id}
                        >
                          {unbanningId === ban.id ? "Unbanning..." : "Unban"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground text-center"
                    >
                      No bans match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="bg-secondary/70 hover:bg-secondary/90 text-secondary-foreground flex items-center justify-between rounded-lg border px-4 py-2 text-left text-sm font-semibold transition"
            onClick={() => setIsReportsOpen((open) => !open)}
            onContextMenu={(event) => {
              event.preventDefault();
              setIsReportsOpen((open) => !open);
            }}
          >
            Player reports
            <IconChevronDown
              className={`size-4 transition-transform ${isReportsOpen ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className={`overflow-hidden rounded-lg border transition-all duration-300 ${
              isReportsOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Reported player</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Report reason</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportError ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-destructive text-center"
                    >
                      {reportError}
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length ? (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.reportedPlayer}
                      </TableCell>
                      <TableCell>{report.reporterPlayer}</TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCloseReport(report.id)}
                          disabled={closingReportId === report.id}
                        >
                          {closingReportId === report.id
                            ? "Closing..."
                            : "Close"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground text-center"
                    >
                      No reports match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
