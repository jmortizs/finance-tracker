# AGENTS.md - Global Context & Infrastructure

## Project Overview
* This project is a localized, single-user Personal Finance Dashboard optimized for local deployments.
* The system executes entirely within a local containerized ecosystem via Docker and operates independently of external cloud networks.
* Do not implement multi-tenant user management, session handling, access tokens, or permission matrices, as access is implicitly restricted via host machine boundary security.

## Infrastructure & Orchestration
* The infrastructure is orchestrated using Docker and Docker Compose to guarantee parity across host execution boundaries.
* The `docker-compose.yml` layout maps out two core services: a persistent storage system running PostgreSQL 18.4 and an application backend executing Python 3.13 with FastAPI.
* The PostgreSQL service maps to port `5432:5432` and uses a local volume for persistent data.
* The FastAPI backend maps to port `8000:8000` and depends on the database service being healthy.

## Documentation
- Update README.md with any changes to the codebase if required.

## Version Control & GitHub Workflow
**AGENT INSTRUCTIONS: You must strictly execute the following step-by-step Git workflow for EVERY code change or documentation update. Failure to follow this format is a critical error.**

### Step 1: Branch Creation
* **NEVER** commit directly to the `main` or `master` branch.
* **ACTION:** Before writing any code, create and checkout a new branch.
* **Naming Convention:** `type/kebab-case-description`
  * `feature/...` (e.g., `feature/add-savings-goals`)
  * `bugfix/...` (e.g., `bugfix/fix-chart-rendering`)
  * `chore/...` (e.g., `chore/update-dependencies`)

### Step 2: Pre-Commit Validation
* **ACTION:** Before staging files, you must autonomously run and pass the following:
  1. Linters: `pnpm lint` (for frontend) and `flake8` or `ruff` (for backend).
  2. Test suites relevant to the modified files.
* Do not proceed to commit if there are failing tests or unresolved linting errors.

### Step 3: Commit Messages (Strict Conventional Commits)
* **ACTION:** Review your own `git diff` before writing the commit message.
* You **MUST** use the Conventional Commits specification. Vague messages like "updated files" or "fixed bug" are strictly prohibited.
* **Format:** `<type>(<optional scope>): <description>`
* **Allowed Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
* **Examples of REQUIRED formatting:**
  * `feat(api): implement positive integer validation for transactions`
  * `fix(docker): resolve docker-compose volume mapping for postgres`
  * `chore(deps): bump fastapi from 0.103.0 to 0.104.0`

### Step 4: Pull Request Generation (MANDATORY)
* **ACTION:** You **MUST** create a Pull Request for your branch. Do not leave the branch without a PR.
* If you have access to the GitHub CLI, use: `gh pr create --title "<Commit-Title>" --body "<PR-Body>"`
* **PR Body Template:** Your PR description MUST include:
  1. A bulleted summary of architectural/code changes.
  2. The specific problem this solves (referencing the original prompt).
  3. Verification that no unintended files were modified.

### exceptions
* Do not execute the Git workflow for open-spec changes and commands. (propose, apply, sync, archive).