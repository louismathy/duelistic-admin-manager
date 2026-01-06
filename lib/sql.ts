import mysql from "mysql2/promise";

import { sqlConfig } from "@/config/sql.config";

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(sqlConfig);
  }
  return pool;
}

export type DashboardMetrics = {
  activeServers: number;
  onlinePlayers: number;
  openReports: number;
};

export type OnlinePlayersPoint = {
  date: string;
  onlinePlayers: number;
};

export type ServerRow = {
  id: number;
  serverName: string;
  template: string;
  status: string;
  onlinePlayers: number;
  maxPlayers: number;
  uptime: string;
};

export type ActiveBanRow = {
  id: number;
  username: string;
  reason: string;
  start: string;
  banLength: string;
  currentLength: string;
};

export type ReportRow = {
  id: number;
  reportedPlayer: string;
  reporterPlayer: string;
  reason: string;
  location: string;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const connection = getPool();
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT active_servers, online_players, open_reports FROM dashboard_metrics LIMIT 1"
  );

  if (rows.length === 0) {
    return { activeServers: 0, onlinePlayers: 0, openReports: 0 };
  }

  const row = rows[0];
  return {
    activeServers: Number(row.active_servers ?? 0),
    onlinePlayers: Number(row.online_players ?? 0),
    openReports: Number(row.open_reports ?? 0),
  };
}

export async function getOnlinePlayersSeries(): Promise<OnlinePlayersPoint[]> {
  const connection = getPool();
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT recorded_at, online_players FROM online_player_minutes WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 90 DAY) ORDER BY recorded_at ASC"
  );

  if (rows.length === 0) {
    return [{ date: new Date().toISOString(), onlinePlayers: 0 }];
  }

  return rows.map((row) => ({
    date: new Date(row.recorded_at).toISOString(),
    onlinePlayers: Number(row.online_players ?? 0),
  }));
}

function formatDuration(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "0m";
  }

  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`);
  }
  parts.push(`${minutes}m`);

  return parts.join(" ");
}

function formatDurationFromMinutes(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "0m";
  }
  return formatDuration(minutes * 60000);
}

export async function getServerTemplates(): Promise<string[]> {
  const connection = getPool();
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT name FROM server_templates ORDER BY name ASC"
  );

  return rows.map((row) => String(row.name));
}

export async function getServers(): Promise<ServerRow[]> {
  const connection = getPool();
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT id, server_name, template, is_online, online_players, max_players, started_at FROM servers ORDER BY server_name ASC"
  );

  const now = Date.now();

  return rows.map((row) => {
    const startedAt = row.started_at ? new Date(row.started_at).getTime() : 0;
    return {
      id: Number(row.id),
      serverName: String(row.server_name ?? ""),
      template: String(row.template ?? ""),
      status: row.is_online ? "Online" : "Offline",
      onlinePlayers: Number(row.online_players ?? 0),
      maxPlayers: Number(row.max_players ?? 0),
      uptime: formatDuration(now - startedAt),
    };
  });
}

export async function getActiveBans(): Promise<ActiveBanRow[]> {
  const connection = getPool();
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT id, username, reason, started_at, length_minutes FROM active_bans ORDER BY started_at DESC"
  );

  const now = Date.now();

  return rows.map((row) => {
    const startedAt = row.started_at ? new Date(row.started_at).getTime() : 0;
    const start =
      startedAt > 0
        ? new Date(startedAt).toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "-";
    const lengthMinutes = Number(row.length_minutes ?? 0);
    const elapsedMinutes = startedAt > 0 ? (now - startedAt) / 60000 : 0;
    const remainingMinutes = Math.max(
      0,
      Math.floor(lengthMinutes - elapsedMinutes)
    );
    return {
      id: Number(row.id),
      username: String(row.username ?? ""),
      reason: String(row.reason ?? ""),
      start,
      banLength: formatDurationFromMinutes(lengthMinutes),
      currentLength: formatDurationFromMinutes(remainingMinutes),
    };
  });
}

export async function deleteActiveBan(id: number) {
  const connection = getPool();
  await connection.query("DELETE FROM active_bans WHERE id = ?", [id]);
}

export async function createActiveBan(
  username: string,
  reason: string,
  lengthMinutes: number
) {
  const connection = getPool();
  await connection.query(
    "INSERT INTO active_bans (username, reason, started_at, length_minutes) VALUES (?, ?, NOW(), ?)",
    [username, reason, lengthMinutes]
  );
}

export async function getPlayerReports(): Promise<ReportRow[]> {
  const connection = getPool();
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT id, reported_player, reporter_player, reason, location FROM player_reports ORDER BY id DESC"
  );

  return rows.map((row) => ({
    id: Number(row.id),
    reportedPlayer: String(row.reported_player ?? ""),
    reporterPlayer: String(row.reporter_player ?? ""),
    reason: String(row.reason ?? ""),
    location: String(row.location ?? ""),
  }));
}
