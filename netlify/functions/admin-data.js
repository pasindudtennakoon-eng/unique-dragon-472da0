// netlify/functions/admin-data.js
// Returns all player data for the admin dashboard
// Protected by admin password (passed as header or query param)

import { getStore } from "@netlify/blobs";

const ADMIN_PWD = process.env.ADMIN_PASSWORD || "Pasiya@2003";
const PRIZE_LIMITS = { 5000: 2, 1000: 20, 500: 40 };

export default async (req) => {
  // Auth check
  const url = new URL(req.url);
  const pwd = url.searchParams.get("pwd") || req.headers.get("x-admin-password");

  if (pwd !== ADMIN_PWD) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = getStore({ name: "lucky-pot-players", consistency: "strong" });

  // List all entries (those prefixed with "entry:")
  const { blobs } = await store.list({ prefix: "entry:" });

  const players = [];
  for (const blob of blobs) {
    const data = await store.get(blob.key, { type: "json" });
    if (data) players.push(data);
  }

  // Sort by timestamp ascending
  players.sort((a, b) => new Date(a.ts) - new Date(b.ts));

  const inventory = (await store.get("inventory", { type: "json" })) || { 5000: 0, 1000: 0, 500: 0 };

  return new Response(
    JSON.stringify({
      players,
      inventory,
      limits: PRIZE_LIMITS,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

export const config = { path: "/api/admin-data" };
