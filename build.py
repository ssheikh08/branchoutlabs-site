#!/usr/bin/env python3
"""Build the static site: src/ -> docs/ (served by GitHub Pages).

Every product and company name, address and number lives in CONFIG below.
To rename the product, change CONFIG["PRODUCT"] and rebuild.

Usage: python3 build.py
"""
import datetime
import hashlib
import re
import shutil
from pathlib import Path

CONFIG = {
    "PRODUCT": "Akka",
    "COMPANY": "Branch Out Labs",
    "COMPANY_LEGAL": "Branch Out Digital Labs LLP",
    "DOMAIN": "branchoutlabs.com",
    "EMAIL": "hello@branchoutlabs.com",
    "WA_NUMBER": "917892536292",          # WhatsApp, international format, digits only
    "WA_DISPLAY": "+91 78925 36292",
    "YEAR": str(datetime.date.today().year),
}

ROOT = Path(__file__).parent
SRC = ROOT / "src"
OUT = ROOT / "docs"
NAV_KEYS = ["parents", "schools", "contact"]


def front_matter(text):
    m = re.match(r"\s*<!--(.*?)-->\s*", text, re.S)
    meta = {}
    if m:
        for line in m.group(1).strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        text = text[m.end():]
    return meta, text


def fill(text, values):
    def sub(m):
        key = m.group(1)
        if key not in values:
            raise KeyError(f"Unknown placeholder {{{{{key}}}}}")
        return values[key]
    return re.sub(r"\{\{([A-Za-z_]+)\}\}", sub, text)


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(SRC / "static", OUT / "static")
    css = (SRC / "static/css/site.css").read_bytes()
    version = hashlib.sha1(css).hexdigest()[:8]
    partials = {p.stem: p.read_text() for p in (SRC / "partials").glob("*.html")}

    for page in sorted((SRC / "pages").glob("*.html")):
        meta, body = front_matter(page.read_text())
        layout = meta.get("layout", "main")
        path = meta["path"]
        values = dict(CONFIG)
        values.update({
            "TITLE": fill(meta["title"], CONFIG),
            "DESCRIPTION": fill(meta["description"], CONFIG),
            "PATH": path,
            "VERSION": version,
        })
        for k in NAV_KEYS:
            values["CUR_" + k] = ' aria-current="page"' if meta.get("nav") == k else ""
        scripts = [s.strip() for s in meta.get("scripts", "").split(",") if s.strip()]
        values["SCRIPTS"] = "\n".join(
            f'<script src="/static/js/{s}?v={version}" defer></script>' for s in scripts)
        head = partials["head"]
        top = partials["header" if layout == "main" else "legal_header"]
        bottom = partials["footer" if layout == "main" else "legal_footer"]
        html = fill(head + top + body + bottom, values)
        dest = OUT / (path.strip("/") or "") / "index.html" if path != "/404.html" else OUT / "404.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html)
        print("built", dest.relative_to(ROOT))

    (OUT / "CNAME").write_text(CONFIG["DOMAIN"] + "\n")
    (OUT / ".nojekyll").write_text("")
    # Product name for page scripts (demo text that mentions it).
    print("done")


if __name__ == "__main__":
    main()
