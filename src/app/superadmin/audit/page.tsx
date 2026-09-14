import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminAuditClient from "./superadmin-audit-client";

export type SuperadminAuditRow = {
  id: string;
  actorUserId: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  metadata: string | null;
  createdAt: string;
};

type AuditRow = {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  metadata: string | null;
  created_at: string;
};

export default async function SuperadminAuditPage() {
  const session = await getSuperadminSession();

  if (!session) {
    redirect("/superadmin");
  }

  const { env } = getCloudflareContext();

  const result = await env.appkhor_db
    .prepare(
      `SELECT
        al.id,
        al.actor_user_id,
        COALESCE(
          u.primary_email,
          u.email
        ) AS actor_email,
        al.action,
        al.target_type,
        al.target_id,
        al.old_value,
        al.new_value,
        al.reason,
        al.metadata,
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u
        ON u.id = al.actor_user_id
      ORDER BY al.created_at DESC
      LIMIT 500`,
    )
    .all<AuditRow>();

  const logs: SuperadminAuditRow[] =
    (result.results ?? []).map((row) => ({
      id: row.id,
      actorUserId: row.actor_user_id,
      actorEmail: row.actor_email,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      oldValue: row.old_value,
      newValue: row.new_value,
      reason: row.reason,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));

  return (
    <SuperadminAuditClient
      email={session.email}
      logs={logs}
    />
  );
}
