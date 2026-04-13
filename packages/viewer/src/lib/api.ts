import type { VoxDocument } from "@vox/schema";

const API_BASE =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}/api`
    : "";

export async function fetchDocument(): Promise<VoxDocument> {
  const res = await fetch(`${API_BASE}/document`);
  return res.json();
}

export async function approveBlock(id: string): Promise<void> {
  await fetch(`${API_BASE}/block/${id}/approve`, { method: "POST" });
}

export async function flagBlock(id: string, comment: string): Promise<void> {
  await fetch(`${API_BASE}/block/${id}/flag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
}
