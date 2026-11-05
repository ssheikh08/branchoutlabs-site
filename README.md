# branchoutlabs.com

The website for Akka by Branch Out Labs. Plain HTML, CSS and JS; no framework.

- `src/pages/` — one file per page (front matter at the top: title, description, path).
- `src/partials/` — shared head, header and footer.
- `src/static/` — CSS, JS, self-hosted fonts and images.
- `build.py` — fills in names and numbers from `CONFIG` and writes the site to `docs/`.
- `docs/` — the built site that GitHub Pages serves. Don't edit by hand.

The product name, company name, email and WhatsApp number all live in `CONFIG` at the top of `build.py`.
To rename the product, change `CONFIG["PRODUCT"]`, then rebuild.

## Update the site

    python3 build.py
    git add -A && git commit -m "…" && git push

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `/docs`. Custom domain: `branchoutlabs.com`.
