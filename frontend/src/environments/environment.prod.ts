export const environment = {
  production: true,
  // Falls back to the known Railway backend URL if env.js is not injected at runtime,
  // so a build that ships without env.js still points at a working API instead of '/api'.
  get apiUrl(): string {
    return window.__env?.apiUrl || 'https://assurabackend-production.up.railway.app/api';
  },
};
