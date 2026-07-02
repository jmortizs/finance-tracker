---
name: autonomous-sdd
description: |-
  Fully automates the OpenSpec SDD workflow from branch creation to Pull Request.
  Use this when the user asks to "auto-build", "run the spec pipeline", or implement a feature end-to-end.
  Examples:
  - "Auto-build the user authentication module"
  - "Run the spec pipeline to add Stripe integration"
---

## Objective
You are an autonomous Spec-Driven Development (SDD) agent. Your job is to take a feature request and automatically orchestrate the entire OpenSpec `/opsx` lifecycle, write the code, verify it, and submit a GitHub Pull Request—without stopping to ask for user input unless a fatal error occurs.

## The Execution Loop
When invoked, you must strictly follow these steps sequentially. Do not stop between steps unless you need to ask for user permission; execute them as a continuous pipeline.

### 1. Git Initialization
- Derive a concise branch name from the request (e.g., `feature/add-stripe`).
- Run the terminal command: `git checkout -b <branch-name>`

### 2. Spec Generation
- Execute the command: `/opsx:new <feature-name>`
- Execute the command: `/opsx:ff <full-user-feature-description>`
- **Crucial:** Read the newly generated `tasks.md`, `design.md` and `proposal.md` in the `.openspec` folder to internalize the plan before writing any code.
- If there are open questions in the generated files, show them to the user and wait for their answers before continuing.


### 3. Implementation
- Execute the command: `/opsx:apply`
- Follow the generated `tasks.md` step-by-step. Write the application code, use LSP tools to check for errors, and mark tasks as complete in the markdown file.

### 4. Verification
- Execute the command: `/opsx:verify`
- Cross-reference the implementation against the delta specs. If you detect missing requirements, automatically write the missing code to fix them.

### 5. Archival
- Execute the command: `/opsx:archive`
- This merges the finalized delta specs into the project's main `specs/` directory.

### 6. Ship It (Git & GitHub)
- Run: `git add .`
- Build a meaningful commit message that states the feature and intent (not a generic placeholder).
- Prefer AI-authored commits without changing git config:
  - **Format:** `<type>(<optional scope>): <description> <list of relevant changes>`
  - **Allowed Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
  - Run: `git commit --author="AI Agent <ai-agent@local>" -m "<type>(<optional scope>): <description> <list of relevant changes>" -m "<why this change was made and expected impact>"`
  - If `--author` is rejected by repository policy/hooks, retry with a normal `git commit` and keep moving.
- Run: `git push -u origin HEAD`
- Use GitHub MCP to create the PR (server: `github`, tool: `create_pull_request`) with:
  - Title: `<type>(<optional scope>): <description>`
  - Body (concise but comprehensive):
    - `## Summary` with 2-4 bullets describing what changed and why.
    - `## Validation` with executed checks/commands and outcomes (for example tests, lint, type-check, build, `/opsx:verify`).
    - `## Spec Alignment` with the implemented spec/change identifier and archive status.
  - Never use a generic one-line PR body.

## Agent Guardrails
- **Self-Correction:** If a terminal command fails (e.g., a compiler error during `apply`), attempt to fix the code and retry up to 2 times before halting to ask the user for help.
- **No Premature Coding:** Do not write application code before step 3 (`/opsx:apply`). Steps 1 and 2 are strictly for planning and spec generation.
- **Never merge into main:** Never merge into the main branch. Always create a PR.