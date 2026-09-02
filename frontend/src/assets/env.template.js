// Templated by docker-entrypoint.d/20-envsubst-config.sh into assets/env.js at container
// startup, substituting ${API_URL} from the running container's environment. This lets one
// built image be promoted across environments instead of rebuilding per environment.
window.__env = {
  apiUrl: "${API_URL}",
};
