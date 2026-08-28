// Populated at container startup by docker-entrypoint.d/20-envsubst-config.sh, which templates
// src/assets/env.template.js into assets/env.js from the running container's env vars. This lets
// one built image be promoted across environments instead of rebuilding per environment.
export {};

declare global {
  interface Window {
    __env?: {
      apiUrl?: string;
    };
  }
}
