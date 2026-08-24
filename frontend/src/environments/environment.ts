export const environment = {
  production: false,
  get apiUrl(): string {
    return window.__env?.apiUrl || 'http://localhost:5000/api';
  },
};
