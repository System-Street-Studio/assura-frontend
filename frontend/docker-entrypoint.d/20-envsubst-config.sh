#!/bin/sh
# Runs automatically before nginx starts (official nginx image entrypoint convention: any
# executable script under /docker-entrypoint.d/ is run in lexical order). Templates
# assets/env.template.js into assets/env.js using the container's actual environment, so the
# same built image can be promoted across environments instead of being rebuilt per environment.
set -eu

: "${API_URL:=/api}"

envsubst '${API_URL}' \
    < /usr/share/nginx/html/assets/env.template.js \
    > /usr/share/nginx/html/assets/env.js

# The CSP's connect-src must allow wherever API_URL actually points. Production's API_URL is a
# relative path (the ALB serves both apps from one origin), so no extra origin is needed there.
# A cross-origin absolute API_URL (e.g. local Docker testing with frontend/backend on different
# ports) needs its origin added explicitly, or the browser silently blocks the request client-side
# before it's ever sent — confirmed live: that blocked every login attempt with zero trace in the
# backend's logs, which is what made it non-obvious to debug.
CSP_CONNECT_SRC_EXTRA=""
case "$API_URL" in
    http://*|https://*)
        scheme="${API_URL%%://*}"
        rest="${API_URL#*://}"
        hostport="${rest%%/*}"
        CSP_CONNECT_SRC_EXTRA="${scheme}://${hostport}"
        ;;
esac
export CSP_CONNECT_SRC_EXTRA

mkdir -p /etc/nginx/generated
envsubst '${CSP_CONNECT_SRC_EXTRA}' \
    < /etc/nginx/security-headers.conf.template \
    > /etc/nginx/generated/security-headers.conf
