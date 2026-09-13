# Security notes

## Scan results (2026-08-23, during AWS deployment planning)

No committed secrets were found in this repo — `frontend/src/environments/` contains only a `localhost` dev URL and a placeholder prod URL, and there are no `.env` files anywhere. `gitleaks` (see `.gitleaks.toml` / `.pre-commit-config.yaml`) is added as a gate anyway, matching the backend repo, so future commits are checked the same way.

## Remediation status: Fixed (Dual-mode httpOnly + SameSite=Strict cookie auth)

**JWT token shielding implemented.** 
- Backend now issues `access_token` in an `httpOnly; SameSite=Strict` cookie on `/auth/login` and clears it on `/auth/logout`, in addition to supporting Bearer headers for mobile clients (`AssuraMobile`).
- `JwtBearerEvents.OnMessageReceived` in `DependencyInjection.cs` extracts the cookie token automatically.
- Angular `HttpClient` uses `withCredentials: true` via `auth.interceptor.ts` to transmit the secure cookie seamlessly.
- Stored token theft via XSS is neutralized because JavaScript cannot read `httpOnly` cookies.
- Cross-Site Request Forgery (CSRF) is blocked by `SameSite=Strict`.
- Content-Security-Policy (CSP) with `script-src 'self'` served by Nginx further restricts unauthorized script execution.

