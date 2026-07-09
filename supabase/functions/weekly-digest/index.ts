/**
 * Secret Agent — Weekly Mission Digest
 *
 * Runs every Sunday night (cron: 0 2 * * 1 = Monday 02:00 UTC ≈ Sunday 10 pm ET).
 * Sends a summary email via Resend to every agency-tier user
 * showing what each mission caught over the past 7 days.
 *
 * Environment variables required:
 *   SUPABASE_URL               (auto-injected)
 *   SUPABASE_SERVICE_ROLE_KEY  (auto-injected)
 *   RESEND_API_KEY             resend.com → API Keys
 *   DIGEST_FROM_EMAIL          e.g. agent@my-secret-agent.com (must be a verified Resend sender)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("DIGEST_FROM_EMAIL") ?? "agent@my-secret-agent.com";

// ─── Email builder ────────────────────────────────────────────────────────────

interface MissionSummary {
  codename: string;
  watch_type: string;
  target: string;
  alertCount: number;
  lastAlert: string | null;
  lastChecked: string | null;
}

function buildEmailHtml(userEmail: string, missions: MissionSummary[], weekStart: Date): string {
  const weekLabel = weekStart.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const totalAlerts = missions.reduce((n, m) => n + m.alertCount, 0);
  const firedMissions = missions.filter((m) => m.alertCount > 0);
  const quietMissions = missions.filter((m) => m.alertCount === 0);

  const missionRows = firedMissions
    .map(
      (m) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;">
          <span style="font-family:monospace;font-size:12px;color:#f5a623;text-transform:uppercase;letter-spacing:0.1em;">
            ${escHtml(m.codename)}
          </span><br/>
          <span style="font-size:11px;color:#888;font-family:monospace;">
            ${escHtml(m.watch_type.replace(/_/g, " "))} · ${escHtml(m.target)}
          </span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;text-align:center;">
          <span style="font-family:monospace;font-size:14px;font-weight:bold;color:#f5a623;">
            ${m.alertCount}
          </span><br/>
          <span style="font-size:11px;color:#666;font-family:monospace;">alert${m.alertCount !== 1 ? "s" : ""}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #2a2a2a;">
          <span style="font-size:12px;color:#c8c0b0;font-family:monospace;">
            ${m.lastAlert ? escHtml(m.lastAlert) : "—"}
          </span>
        </td>
      </tr>`
    )
    .join("");

  const quietList = quietMissions.length
    ? `<p style="font-family:monospace;font-size:12px;color:#555;margin:0 0 4px;">All clear this week:</p>
       <p style="font-family:monospace;font-size:12px;color:#444;margin:0;">
         ${quietMissions.map((m) => escHtml(m.codename)).join(" · ")}
       </p>`
    : "";

  const headline = totalAlerts === 0
    ? "All quiet on every front."
    : `${totalAlerts} alert${totalAlerts !== 1 ? "s" : ""} fired across ${firedMissions.length} mission${firedMissions.length !== 1 ? "s" : ""}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#111111;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:0 0 32px;">
            <p style="margin:0 0 4px;font-family:monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#f5a623;opacity:0.7;">
              — Weekly Mission Brief —
            </p>
            <p style="margin:0;font-size:22px;font-weight:600;color:#f5f0e8;letter-spacing:0.05em;">
              My Secret Agent
            </p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:12px;color:#666;">
              Week of ${weekLabel}
            </p>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="background:#1c1c1c;border:1px solid #2a2a2a;border-radius:4px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0;font-size:16px;color:#f5f0e8;font-weight:500;">${headline}</p>
          </td>
        </tr>

        <!-- Spacer -->
        <tr><td style="height:24px;"></td></tr>

        ${firedMissions.length > 0 ? `
        <!-- Alert table -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#1c1c1c;border:1px solid #2a2a2a;border-radius:4px;overflow:hidden;">
              <thead>
                <tr style="background:#222;">
                  <th style="padding:10px 16px;text-align:left;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#666;font-weight:normal;">Mission</th>
                  <th style="padding:10px 16px;text-align:center;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#666;font-weight:normal;">Alerts</th>
                  <th style="padding:10px 16px;text-align:left;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#666;font-weight:normal;">Last message</th>
                </tr>
              </thead>
              <tbody>${missionRows}</tbody>
            </table>
          </td>
        </tr>

        <!-- Spacer -->
        <tr><td style="height:24px;"></td></tr>
        ` : ""}

        ${quietList ? `
        <!-- Quiet missions -->
        <tr>
          <td style="background:#161616;border:1px solid #222;border-radius:4px;padding:16px 20px;">
            ${quietList}
          </td>
        </tr>
        <tr><td style="height:24px;"></td></tr>
        ` : ""}

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:8px 0 32px;">
            <a href="https://my-secret-agent.com"
              style="display:inline-block;font-family:monospace;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#1a1a1a;background:#f5a623;padding:10px 28px;border-radius:3px;text-decoration:none;font-weight:600;">
              Open The Van
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #222;padding-top:20px;">
            <p style="margin:0;font-family:monospace;font-size:11px;color:#444;text-align:center;line-height:1.8;">
              My Secret Agent · Weekly digest for Agency members<br/>
              You're receiving this because you have an active Agency subscription.<br/>
              <a href="https://my-secret-agent.com/settings" style="color:#555;">Manage notifications</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Send via Resend ──────────────────────────────────────────────────────────

async function sendDigest(to: string, html: string, weekLabel: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email for", to);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `My Secret Agent <${FROM_EMAIL}>`,
      to: [to],
      subject: `Your Weekly Mission Brief — ${weekLabel}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Resend failed for ${to}:`, res.status, err);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (authHeader !== `Bearer ${serviceKey}` && Deno.env.get("DENO_DEPLOYMENT_ID")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekLabel = weekAgo.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  // Get all agency-tier users
  const { data: profiles, error: profilesErr } = await supabase
    .from("profiles")
    .select("id, tier")
    .eq("tier", "network");

  if (profilesErr) {
    return new Response(JSON.stringify({ error: profilesErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: { userId: string; status: string; missionCount: number }[] = [];

  for (const profile of profiles ?? []) {
    // Get user email from auth
    const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
    const email = userData?.user?.email;
    if (!email) continue;

    // Get all active missions for this user
    const { data: missions } = await supabase
      .from("secret_agent_missions")
      .select("id, codename, watch_type, target, last_checked_at")
      .eq("user_id", profile.id)
      .eq("active", true);

    if (!missions?.length) continue;

    // Get alerts from the past 7 days grouped by mission
    const { data: alerts } = await supabase
      .from("secret_agent_alerts")
      .select("mission_id, message, triggered_at")
      .eq("user_id", profile.id)
      .eq("alert_type", "condition_met")
      .gte("triggered_at", weekAgo.toISOString())
      .order("triggered_at", { ascending: false });

    // Build per-mission summary
    const alertsByMission = new Map<string, { count: number; lastMessage: string }>();
    for (const a of alerts ?? []) {
      const existing = alertsByMission.get(a.mission_id);
      if (existing) {
        existing.count += 1;
      } else {
        alertsByMission.set(a.mission_id, { count: 1, lastMessage: a.message });
      }
    }

    const summaries: MissionSummary[] = missions.map((m) => {
      const entry = alertsByMission.get(m.id);
      return {
        codename: m.codename,
        watch_type: m.watch_type,
        target: m.target,
        alertCount: entry?.count ?? 0,
        lastAlert: entry?.lastMessage ?? null,
        lastChecked: m.last_checked_at,
      };
    });

    // Sort — missions that fired first, then quiet ones
    summaries.sort((a, b) => b.alertCount - a.alertCount);

    const html = buildEmailHtml(email, summaries, weekAgo);
    await sendDigest(email, html, weekLabel);

    results.push({ userId: profile.id, status: "sent", missionCount: missions.length });
  }

  return new Response(
    JSON.stringify({ digests_sent: results.length, results, ts: now.toISOString() }),
    { headers: { "Content-Type": "application/json" } }
  );
});
