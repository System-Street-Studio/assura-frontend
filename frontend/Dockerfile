# syntax=docker/dockerfile:1

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- final ----
# nginx-unprivileged runs as a non-root user (101) on port 8080 out of the box — no custom
# USER/permission plumbing needed, unlike the standard nginx image which defaults to root.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS final

COPY --from=build --chown=101:101 /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf.template /etc/nginx/security-headers.conf.template
COPY docker-entrypoint.d/20-envsubst-config.sh /docker-entrypoint.d/20-envsubst-config.sh

USER root
RUN chmod +x /docker-entrypoint.d/20-envsubst-config.sh
USER 101

EXPOSE 8080
