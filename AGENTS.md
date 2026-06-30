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
* **Branching Strategy:** Enforce a strict feature-branch workflow. Never commit directly to the `main` or `master` branch.
* **Branch Naming:** Branch names must be lowercase, hyphen-separated, and categorized by type:
  * `feature/<description>` (e.g., `feature/add-savings-goals`)
  * `bugfix/<description>` (e.g., `bugfix/fix-chart-rendering`)
  * `chore/<description>` (e.g., `chore/update-dependencies`)
* **Commit Convention:** Strictly utilize Conventional Commits for automated parsing and changelog generation.
  * Correct: `feat: implement positive integer validation for transactions`
  * Correct: `fix: resolve docker-compose volume mapping`
  * Incorrect: `updated database files`
* **Pre-Commit Enforcement:** Before staging files or generating a commit, the agent must autonomously execute and pass all respective linting (`pnpm lint`, `flake8`/`ruff`) and testing suites in the modified boundaries.
* **Pull Requests:** When drafting a PR, include a bulleted summary of architectural changes. The agent must verify the diff against the original task prompt to ensure no unintended files were modified.
