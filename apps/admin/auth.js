import { supabase } from "../storefront/supabase.js";

export async function requireOwner() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    location.href = "../auth.html?redirect=" + next;
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !["owner", "admin"].includes(profile.role)) {
    document.body.innerHTML = '<main style="max-width:620px;margin:12vh auto;padding:32px;font-family:system-ui,sans-serif;text-align:center"><h1>Owner access required</h1><p>This area is restricted to Trendskartco owner/admin accounts.</p><a href="../index.html">Return to storefront</a></main>';
    return null;
  }

  window.__adminUser = user;
  window.__adminProfile = profile;
  return { user, profile };
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
  location.href = "../index.html";
}