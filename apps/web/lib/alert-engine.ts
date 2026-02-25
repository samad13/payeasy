import { createAdminClient } from "./supabase/admin";

interface RuleViolation {
  rule_id: string;
  group_id: string;
  message: string;
  total_count: number;
  window_count: number;
}

/**
 * Checks for active rule violations and sends notifications.
 * This can be run as a cron job or triggered by error insertion.
 */
export async function processAlerts() {
  const supabase = createAdminClient();

  // 1. Fetch current violations from the view
  const { data: violations, error: viewError } = await supabase
    .from("active_rule_violations")
    .select("*");

  if (viewError) {
    console.error("Error fetching violations:", viewError);
    return;
  }

  if (!violations || violations.length === 0) return;

  // 2. Filter out violations that have already been notified recently
  // We check the 'alerts' table for groups with the same rule that were notified in the last hour
  for (const violation of violations as RuleViolation[]) {
    const { data: recentAlerts, error: alertError } = await supabase
      .from("alerts")
      .select("id")
      .eq("rule_id", violation.rule_id)
      .eq("group_id", violation.group_id)
      .gt("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (alertError) {
      console.error("Error checking recent alerts:", alertError);
      continue;
    }

    if (recentAlerts && recentAlerts.length > 0) {
      // Already notified about this violation in the last hour
      continue;
    }

    // 3. Send notification
    const { data: rule } = await supabase
      .from("alert_rules")
      .select("*")
      .eq("id", violation.rule_id)
      .single();

    if (!rule) continue;

    await sendNotification(rule, violation);

    // 4. Log the alert
    await supabase.from("alerts").insert({
      rule_id: violation.rule_id,
      group_id: violation.group_id,
      error_message: violation.message,
      notified: true,
    });
  }
}

/**
 * Sends a notification based on the rule's channel.
 */
async function sendNotification(rule: any, violation: RuleViolation) {
  const notificationMessage = `🚨 *Error Alert: ${rule.name}*\n` +
    `*Message:* ${violation.message}\n` +
    `*Occurrences:* ${violation.window_count} in the last ${rule.time_window_minutes} minutes\n` +
    `*View Group:* ${process.env.NEXT_PUBLIC_SITE_URL}/admin/errors/${violation.group_id}`;

  if (rule.channel === "slack" && rule.channel_webhook_url) {
    try {
      await fetch(rule.channel_webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notificationMessage }),
      });
    } catch (e) {
      console.error("Failed to send Slack alert:", e);
    }
  } else if (rule.channel === "email") {
    // Integration with Resend or similar could go here
    console.log("Email Alert (Simulation):", notificationMessage);
  } else {
    console.log("Alert (Console Log):", notificationMessage);
  }
}
