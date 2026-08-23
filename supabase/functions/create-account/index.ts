import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { username?: string; recoveryEmail?: string; password?: string; inviteKey?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const username = body.username?.trim().toLowerCase() ?? "";
  const recoveryEmail = body.recoveryEmail?.trim() ?? "";
  const password = body.password ?? "";
  const inviteKey = body.inviteKey?.trim() ?? "";

  if (!/^[a-z0-9_-]{3,24}$/.test(username) || password.length < 8 || !recoveryEmail || !inviteKey) {
    return json({ error: "Invalid account details" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Account service is not configured" }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: existingProfile, error: profileLookupError } = await admin
    .from("profiles")
    .select("user_id")
    .ilike("username", username)
    .maybeSingle();
  if (profileLookupError) return json({ error: "Account creation unavailable" }, 500);
  if (existingProfile) return json({ error: "Account creation unavailable" }, 400);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: recoveryEmail,
    password,
    email_confirm: true,
    user_metadata: { username },
  });
  if (createError || !created.user) return json({ error: "Account creation unavailable" }, 400);

  const { data: activated, error: activationError } = await admin.rpc("activate_account_for_user", {
    p_user_id: created.user.id,
    p_code: inviteKey,
    p_username: username,
  });

  if (activationError || activated !== true) {
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: "Account creation unavailable" }, 400);
  }

  return json({ ok: true });
});

