#!/usr/bin/env python3
"""Check every URL in sitemap.xml against the local files.

For each page it checks: the file exists (would return 200), exactly one <h1>,
a self-referencing canonical, the same hreflang set in the page <head> as in
the sitemap, and that every hreflang target links back (reciprocal). Run from
the repo root:  python3 scripts/check-seo.py   (exit code 1 if anything fails)
"""
import os
import re
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SITE = "https://samamatahir.com"
NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9", "x": "http://www.w3.org/1999/xhtml"}


def local_file(url):
    path = url[len(SITE):]
    return os.path.join(ROOT, path.lstrip("/"), "index.html") if path.endswith("/") else os.path.join(ROOT, path.lstrip("/"))


def head_info(url):
    html = open(local_file(url), encoding="utf-8").read()
    head = html.split("</head>", 1)[0]
    canon = re.findall(r'<link rel="canonical" href="([^"]+)"', head)
    alts = dict((lang, href) for lang, href in re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', head))
    h1 = len(re.findall(r"<h1[\s>]", html))
    robots = re.search(r'<meta name="robots" content="([^"]+)"', head)
    return canon, alts, h1, robots.group(1) if robots else ""


def main():
    tree = ET.parse(os.path.join(ROOT, "sitemap.xml"))
    entries = {}
    for u in tree.getroot().findall("s:url", NS):
        loc = u.find("s:loc", NS).text.strip()
        lastmod = u.find("s:lastmod", NS)
        alts = {a.get("hreflang"): a.get("href") for a in u.findall("x:link", NS)}
        entries[loc] = (lastmod.text if lastmod is not None else None, alts)

    problems = []
    for loc, (lastmod, sm_alts) in entries.items():
        if not loc.startswith(SITE + "/"):
            problems.append((loc, "loc is not on " + SITE))
            continue
        if not os.path.isfile(local_file(loc)):
            problems.append((loc, "no file, would not return 200"))
            continue
        if not lastmod or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", lastmod):
            problems.append((loc, "missing or malformed lastmod"))
        canon, alts, h1, robots = head_info(loc)
        if h1 != 1:
            problems.append((loc, f"{h1} <h1> tags"))
        if canon != [loc]:
            problems.append((loc, f"canonical is {canon}"))
        if "noindex" in robots:
            problems.append((loc, "noindex page listed in sitemap"))
        if alts != sm_alts:
            problems.append((loc, f"head hreflang {alts} != sitemap {sm_alts}"))
        if alts and alts.get("x-default") is None:
            problems.append((loc, "no x-default"))
        if alts and loc not in alts.values():
            problems.append((loc, "hreflang set does not include the page itself"))
        for lang, href in alts.items():
            if href not in entries:
                problems.append((loc, f"hreflang {lang} -> {href} is not in the sitemap"))
            elif os.path.isfile(local_file(href)) and head_info(href)[1] != alts:
                problems.append((loc, f"hreflang {lang} -> {href} does not link back with the same set"))

    for loc, msg in problems:
        print(f"FAIL {loc}: {msg}")
    print(f"{len(entries)} sitemap URLs checked, {len(problems)} problem(s)")

    # Placeholders that must be filled in before the page goes live
    todos = 0
    for loc in entries:
        if os.path.isfile(local_file(loc)):
            n = open(local_file(loc), encoding="utf-8").read().count("TODO(Samama)")
            if n:
                todos += n
                print(f"WARN {loc}: {n} TODO(Samama) placeholder(s) still on the page")
    if todos:
        print(f"{todos} TODO(Samama) placeholder(s) in total: fill them in before deploying")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
