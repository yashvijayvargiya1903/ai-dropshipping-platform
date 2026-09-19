import { supabase } from "../storefront/supabase.js";

export async function requireAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { location.href = "../auth.html?next=admin"; return null; }
  const { data: profile, error } = await supabase.from("profiles").select("role,name").eq("id", user.id).single();
  if (error || !profile || !["owner","admin"].includes(profile.role)) {
    document.body.innerHTML = '<main style="padding:40px;font-family:system-ui"><h1>Owner access required</h1><p>Please sign in with an owner/admin account.</p><a href="../auth.html">Sign in</a></main>';
    return null;
  }
  return { user, profile };
}
