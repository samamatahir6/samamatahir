#!/usr/bin/env python3
"""Rebuild sitemap.xml from the pages themselves.

Every index.html that has a canonical URL and isn't noindex becomes a <url>.
Its hreflang alternates are copied from the page <head>, so the sitemap always
matches the pages. <lastmod> is the date of the last git commit that touched
the page, or today for a page with uncommitted changes (or a new page).
English pages are listed first, then Portuguese, each in path order.
Run from anywhere:  python3 scripts/build-sitemap.py
"""
import datetime
import os
import re
import subprocess

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
TODAY = datetime.date.today().isoformat()


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT).decode().strip()


def lastmod(rel):
    if git("status", "--porcelain", "--", rel):
        return TODAY
    return git("log", "-1", "--format=%cs", "--", rel) or TODAY


def pages():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if not d.startswith(".") and d not in ("scripts", "images", "icons", "css", "js", "fonts")]
        if "index.html" in filenames:
            yield os.path.relpath(os.path.join(dirpath, "index.html"), ROOT)


def main():
    entries = []
    for rel in pages():
        head = open(os.path.join(ROOT, rel), encoding="utf-8").read().split("</head>", 1)[0]
        canon = re.search(r'<link rel="canonical" href="([^"]+)"', head)
        if not canon or re.search(r'<meta name="robots" content="[^"]*noindex', head):
            continue
        alts = re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', head)
        entries.append((rel.startswith("pt/"), canon.group(1), lastmod(rel), alts))
    entries.sort(key=lambda e: (e[0], e[1]))

    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
           '        xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for _, loc, mod, alts in entries:
        out += ["  <url>", f"    <loc>{loc}</loc>", f"    <lastmod>{mod}</lastmod>"]
        out += [f'    <xhtml:link rel="alternate" hreflang="{lang}" href="{href}" />' for lang, href in alts]
        out.append("  </url>")
    out.append("</urlset>")
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(f"sitemap.xml: {len(entries)} URLs")


if __name__ == "__main__":
    main()
