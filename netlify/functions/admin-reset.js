// netlify/functions/admin-reset.js
// Wipes all player data (admin only)

import { getStore } from "@netlify/blobs";

const ADMIN_PWD = process.env.ADMIN_PASSWORD || "Pasiya@2003";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const pwd = url.searchParams.get("pwd") || req.headers.get("x-admin-password");

  if (pwd !== ADMIN_PWD) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = getStore({ name: "lucky-pot-players", consistency: "strong" });

  // Delete all entries
  const { blobs: entries } = await store.list({ prefix: "entry:" });
  const { blobs: epfs } = await store.list({ prefix: "epf:" });

  for (const blob of [...entries, ...epfs]) {
    await store.delete(blob.key);
  }

  await store.delete("inventory");
  await store.delete("total-count");

  return new Response(JSON.stringify({ success: true, deleted: entries.length + epfs.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/api/admin-reset" };
