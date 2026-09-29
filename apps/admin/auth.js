// Public demo mode: no login required.
export async function requireOwner() {
  window.__adminUser = { id: "demo-owner", email: "demo@trendskartco.local" };
  window.__adminProfile = { role: "owner", name: "Demo Owner" };
  return { user: window.__adminUser, profile: window.__adminProfile };
}

export async function signOutAdmin() {
  // Login is disabled in the public demo.
  location.href = "./index.html";
}
