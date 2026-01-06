"use server";

import { createActiveBan, deleteActiveBan, getActiveBans } from "@/lib/sql";

export async function unbanActiveBan(id: number) {
  if (!Number.isFinite(id)) {
    return;
  }
  await deleteActiveBan(id);
}

export async function addActiveBan(
  username: string,
  reason: string,
  lengthMinutes: number
) {
  const cleanedUsername = username.trim();
  const cleanedReason = reason.trim();
  const cleanedLength = Number(lengthMinutes);

  if (!cleanedUsername || !cleanedReason) {
    return getActiveBans();
  }
  if (!Number.isFinite(cleanedLength) || cleanedLength <= 0) {
    return getActiveBans();
  }

  await createActiveBan(cleanedUsername, cleanedReason, cleanedLength);
  return getActiveBans();
}
