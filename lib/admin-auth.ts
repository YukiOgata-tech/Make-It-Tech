import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const MIT_ROLES = ["owner", "admin", "staff", "viewer"] as const;
export type MitRole = (typeof MIT_ROLES)[number];

export type MitSession = {
  uid: string;
  email: string;
  entityId: string;
  role: MitRole;
};

type MitAccessRow = {
  user_id: string;
  email: string;
  entity_id: string;
  role: string;
};

function isMitRole(value: unknown): value is MitRole {
  return typeof value === "string" && MIT_ROLES.includes(value as MitRole);
}

export async function getMitSession(): Promise<MitSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.id || !user.email) return null;

  const { data, error: accessError } = await supabase
    .rpc("get_mit_admin_access")
    .maybeSingle();
  const access = data as MitAccessRow | null;

  if (
    accessError ||
    !access ||
    access.user_id !== user.id ||
    typeof access.entity_id !== "string" ||
    typeof access.email !== "string" ||
    !isMitRole(access.role)
  ) {
    return null;
  }

  return {
    uid: user.id,
    email: access.email.toLowerCase(),
    entityId: access.entity_id,
    role: access.role,
  };
}

export async function getAdminSession() {
  const session = await getMitSession();
  if (!session || !(["owner", "admin"] as MitRole[]).includes(session.role)) {
    return null;
  }
  return session;
}

export async function requireMitRole(allowedRoles: readonly MitRole[]) {
  const session = await getMitSession();
  if (!session || !allowedRoles.includes(session.role)) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  return requireMitRole(["owner", "admin"]);
}
