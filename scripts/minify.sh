#!/bin/sh
# Minify the CSS and JS that every page loads. Edit the readable source files
# (css/styles.css, css/responsive.css, js/main.js), then run this from the repo
# root and bump the ?v= version on every page (see README "Cache busting").
# Needs Node (npx downloads the pinned esbuild version on first run).
set -e
cd "$(dirname "$0")/.."
for f in css/styles.css css/responsive.css js/main.js; do
  npx --yes esbuild@0.24.0 "$f" --minify --log-level=warning --outfile="${f%.*}.min.${f##*.}"
done
echo "Minified: css/styles.min.css css/responsive.min.css js/main.min.js"
