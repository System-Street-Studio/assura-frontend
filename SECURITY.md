# Security notes

## Scan results (2026-08-23, during AWS deployment planning)

No committed secrets were found in this repo — `frontend/src/environments/` contains only a `localhost` dev URL and a placeholder prod URL, and there are no `.env` files anywhere. `gitleaks` (see `.gitleaks.toml` / `.pre-commit-config.yaml`) is added as a gate anyway, matching the backend repo, so future commits are checked the same way.

## Known finding, not fixed here (flagged, not silently redesigned)

**JWT stored in `localStorage`.** `frontend/src/app/core/auth/auth.service.ts` stores the access token under `localStorage` (`TOKEN_KEY = 'access_token'`) rather than an httpOnly cookie. This is XSS-exposed: any script that runs on the page (a compromised dependency, an injected `<script>`, a stored-XSS bug elsewhere in the app) can read `localStorage` and exfiltrate the token directly, whereas an httpOnly cookie is invisible to JavaScript entirely.

- **Real fix** (out of scope for this pass — it's an application-architecture change, not an infra one): move to httpOnly, `Secure`, `SameSite=Strict` cookie-based auth, with the backend setting/clearing the cookie on login/logout instead of returning the token in the response body.
- **Partial infra-layer mitigation, planned**: a strict Content-Security-Policy header served by nginx (see the deployment plan's Dockerfile/`nginx.conf` work) meaningfully reduces the attack surface by blocking most injected/third-party script execution, without requiring an app-code change. This does not eliminate the risk, only reduces it.

Recorded here so it's a deliberate, documented trade-off rather than an unnoticed gap.
