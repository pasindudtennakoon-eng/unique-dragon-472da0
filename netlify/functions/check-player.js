// netlify/functions/check-player.js
// Called on login to check if EPF has already played

import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const epf = url.searchParams.get("epf");

  if (!epf) {
    return new Response(JSON.stringify({ error: "EPF required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = getStore({ name: "lucky-pot-players", consistency: "strong" });
  const epfKey = `epf:${epf.trim().toLowerCase()}`;
  const existing = await store.get(epfKey, { type: "json" });

  if (existing) {
    return new Response(
      JSON.stringify({ played: true, prize: existing.prize }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Also return current inventory so client can do prize allocation
  const inventory = (await store.get("inventory", { type: "json" })) || { 5000: 0, 1000: 0, 500: 0 };
  const totalCount = (await store.get("total-count", { type: "json" })) || { count: 0 };

  return new Response(
    JSON.stringify({ played: false, inventory, totalCount: totalCount.count }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

export const config = { path: "/api/check-player" };
