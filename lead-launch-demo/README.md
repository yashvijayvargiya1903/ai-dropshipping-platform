# LeadForge — Lead → Launch Demo

Standalone interactive demo inspired by the uploaded Lead → Launch workflow, redesigned as a polished five-stage sales workspace.

## Stages
1. **Discover** — niche, location, lead count and buying signal.
2. **Audit** — business health, conversion gaps and evidence.
3. **Rank** — explainable prospect scoring and commercial opportunity.
4. **Build** — generated prospect-specific landing page preview.
5. **Launch** — personalized WhatsApp, email and Instagram outreach composer.

## Demo
Open `lead-launch-demo/index.html` in a modern browser. The demo uses local sample data; it does not make live scraping or outbound messaging calls.

## Production architecture
The UI is designed to sit in front of provider adapters for business search, website fetching, AI auditing, website publishing and approved outreach APIs, with lead/audit/outreach records persisted in PostgreSQL/Supabase.

## Video analysis
The uploaded reference video follows the same five-phase concept: lead discovery, business audit, ranked prospects, prospect build/demo, and outreach. This version keeps that core flow while adding explainable scoring, an evidence-oriented audit, a website preview, channel switching, and a persistent lead timeline.

## Repository
This demo lives in the `lead-launch-demo` branch of the existing connected GitHub repository because the current GitHub connection exposes file/branch/PR operations but does not expose repository-creation permissions.