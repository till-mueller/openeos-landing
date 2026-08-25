#!/bin/sh
# Rewrites the sentinel tokens baked into the built .next output (see the
# Dockerfile's NEXT_PUBLIC_* ARG defaults) to their real runtime values, so
# one image can be redeployed against different domains (self-hosted /
# airgapped installs) without a rebuild. If the image was built with real
# URLs passed as build-args instead of the sentinels, these greps simply
# find nothing and no-op.
set -e

replace_token() {
  token="$1"
  value="$2"
  grep -rl -- "$token" /app/.next /app/public 2>/dev/null | while IFS= read -r file; do
    sed -i "s|$token|$value|g" "$file"
  done
}

replace_token '__RUNTIME_NEXT_PUBLIC_API_URL__' "${NEXT_PUBLIC_API_URL:-https://api.openeos.de}"
replace_token '__RUNTIME_NEXT_PUBLIC_APP_URL__' "${NEXT_PUBLIC_APP_URL:-https://app.openeos.de}"
replace_token '__RUNTIME_NEXT_PUBLIC_DOCS_URL__' "${NEXT_PUBLIC_DOCS_URL:-https://docs.openeos.de}"

exec "$@"
