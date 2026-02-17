# Contributing to Assura Frontend

Thank you for your interest in contributing! This guide helps new developers get started and ensures consistency across the team.

## 🌿 Branch Naming Conventions

We use a standard naming convention for branches to keep our git history organized.

Format: `{type}/{short-description}`

| Type | Use Case | Example |
|---|---|---|
| `feature/` | New features or major enhancements | `feature/add-login-page` |
| `bugfix/` | Fixing a bug | `bugfix/fix-header-alignment` |
| `hotfix/` | Critical fix for production | `hotfix/security-patch` |
| `refactor/` | Code cleanup without logic changes | `refactor/cleanup-auth-service` |
| `docs/` | Documentation changes only | `docs/update-readme` |

**Example:**
```bash
git checkout -b feature/user-profile
```

---

## 📝 Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Format: `{type}: {description}`

| Type | Meaning |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semi-colons, etc. |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `test` | Adding missing tests or correcting existing tests |
| `chore` | Build process or auxiliary tool changes |

**Examples:**
- `feat: add login form validation`
- `fix: correct typo in navbar`
- `style: format app.component.html`

---

## 🚀 Pull Request (PR) Process

1.  **Sync with `main`:** Ensure your branch is up-to-date.
    ```bash
    git pull origin main
    ```
2.  **Create PR:** Open a Pull Request targeting the `main` branch.
3.  **Description:** clearly describe the changes and link any related issues.
4.  **Review:** Request a review from at least one team member.
5.  **Merge:** Once approved and CI checks pass, squash and merge.

---

## 🎨 Code Style Rules

- **Framework:** Angular 19+ (Standalone Components preferred)
- **Formatting:** We use Prettier (config in `package.json`).
  - Run `npm run format` to format all files.
- **Linting:** Follow standard Angular style guide.
  - Run `npm run lint` to check for issues.
- **Naming:**
  - Components: `kebab-case` for files (`user-profile.component.ts`), `PascalCase` for classes (`UserProfileComponent`).
  - Services: `auth.service.ts` -> `AuthService`.
  - Interfaces: `IUser` or just `User` (be consistent).

---

## 🛠️ Development Environment Setup

1.  **Prerequisites:**
    - [Node.js](https://nodejs.org/) (v18 or higher recommended)
    - Angular CLI: `npm install -g @angular/cli`

2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/System-Street-Studio/assura-frontend.git
    cd assura-frontend/frontend
    ```
    > **Note:** The Angular project is inside the `frontend` folder!

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Setup Environment:**
    - The project comes with `src/environments/environment.ts` for local development.
    - Confirm the `apiUrl` in `environment.ts` points to your local **.NET** backend (default: `https://localhost:5171/api`).

5.  **Run the App:**
    ```bash
    ng serve
    ```
    Navigate to `http://localhost:4200/`.

6.  **Run Tests:**
    ```bash
    npm run test
    ```

7.  **Run Linting:**
    ```bash
    npm run lint
    ```

Happy coding! 🚀
