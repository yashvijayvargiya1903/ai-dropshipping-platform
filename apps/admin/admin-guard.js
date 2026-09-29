// Public demo mode: no login required.
export async function requireAdmin() {
  return {
    user: { id: "demo-owner", email: "demo@trendskartco.local" },
    profile: { role: "owner", name: "Demo Owner" }
  };
}
