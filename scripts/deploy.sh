#!/usr/bin/env bash
# Builds the site and publishes dist/ to the gh-pages branch (GitHub Pages, "Deploy from a branch").
#   npm run deploy                                  -> https://<owner>.github.io/<repo>/
#   CUSTOM_DOMAIN=saramaya-kin.com npm run deploy   -> https://saramaya-kin.com/ (once DNS points to GitHub)
set -euo pipefail
cd "$(dirname "$0")/.."

remote=$(git remote get-url origin)
repo=$(basename -s .git "$remote")
owner=$(echo "$remote" | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#')

if [[ -n "${CUSTOM_DOMAIN:-}" ]]; then
  export BASE_PATH="" SITE_ORIGIN="https://${CUSTOM_DOMAIN}"
else
  export BASE_PATH="/${repo}" SITE_ORIGIN="https://${owner}.github.io"
fi

npm run build
npm run check:links
touch dist/.nojekyll
if [[ -n "${CUSTOM_DOMAIN:-}" ]]; then echo "$CUSTOM_DOMAIN" > dist/CNAME; fi

name=$(git config user.name || echo deploy)
email=$(git config user.email || echo deploy@localhost)

# Publish from a throwaway clone of dist/ so the source branch stays untouched.
out=$(mktemp -d)
trap 'rm -rf "$out"' EXIT
cp -R dist/. "$out"
git -C "$out" init -q -b gh-pages
git -C "$out" add -A
git -C "$out" -c user.name="$name" -c user.email="$email" commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git -C "$out" push -q -f "$remote" gh-pages

echo "Publié : ${SITE_ORIGIN}${BASE_PATH}/"
