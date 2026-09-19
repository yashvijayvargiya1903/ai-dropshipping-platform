# GitHub Pages deployment

The repository now contains a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

It publishes:
- Storefront at the Pages root.
- Owner/admin dashboard at `/admin/`.

The workflow is triggered by pushes to `main` or manually from GitHub Actions.

Before using the site with real customers, configure the production domain, Supabase Auth redirect URLs, Cashfree production credentials, supplier integration, transactional messaging, legal pages, and complete end-to-end QA.
