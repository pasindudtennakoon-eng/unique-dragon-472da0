// netlify/functions/save-player.js
// Called when a player submits their result
// Stores data in Netlify Blobs (shared across all devices)

import { getStore } from "@netlify/blobs";

export default async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { epf, name, branch, prize } = body;

  if (!epf || !name || !branch || prize === undefined) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = getStore({ name: "lucky-pot-players", consistency: "strong" });

  // Check if EPF already played (race condition protection)
  const epfKey = `epf:${epf.trim().toLowerCase()}`;
  const existing = await store.get(epfKey, { type: "json" });

  if (existing) {
    return new Response(
      JSON.stringify({ success: false, alreadyPlayed: true, prize: existing.prize }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Get current inventory to check prize limits
  const PRIZE_LIMITS = { 5000: 2, 1000: 20, 500: 40 };
  const inventoryRaw = await store.get("inventory", { type: "json" });
  const inventory = inventoryRaw || { 5000: 0, 1000: 0, 500: 0 };

  // Validate prize hasn't exceeded limits (server-side safety check)
  if (prize > 0) {
    const limit = PRIZE_LIMITS[prize];
    if (!limit || (inventory[prize] || 0) >= limit) {
      // Prize limit exceeded — override to 0 (no prize)
      // This is a safety net; the frontend should already handle this
      const record = {
        epf: epf.trim(),
        name: name.trim(),
        branch: branch.trim(),
        prize: 0,
        ts: new Date().toISOString(),
        note: "prize_limit_exceeded_server_override",
      };
      await store.setJSON(epfKey, record);
      // Also save by timestamp for admin listing
      await store.setJSON(`entry:${Date.now()}_${epf.trim()}`, record);
      return new Response(
        JSON.stringify({ success: true, prize: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    // Update inventory
    inventory[prize] = (inventory[prize] || 0) + 1;
    await store.setJSON("inventory", inventory);
  }

  const record = {
    epf: epf.trim(),
    name: name.trim(),
    branch: branch.trim(),
    prize: Number(prize),
    ts: new Date().toISOString(),
  };

  // Save by EPF (for duplicate check)
  await store.setJSON(epfKey, record);
  // Save by timestamp (for admin listing in order)
  await store.setJSON(`entry:${Date.now()}_${epf.trim()}`, record);

  return new Response(JSON.stringify({ success: true, prize: Number(prize) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/api/save-player" };
