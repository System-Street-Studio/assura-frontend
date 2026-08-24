export const environment = {
  production: true,
  // Falls back to same-origin "/api" (not a placeholder domain) so a build that somehow
  // ships without env.js still points at a sane default instead of a dead URL.
  get apiUrl(): string {
    return window.__env?.apiUrl || '/api';
  },
};
