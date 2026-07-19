# Synapse — Evidence and safety rules

## Communication

- Respond in Spanish unless the user requests another language.
- Be concise, technical and explicit.
- Explain why before explaining how.
- Work one step at a time.

## Evidence

- Inspect relevant repository files before making technical claims.
- Clearly distinguish verified facts, reasonable inferences and proposals.
- Reference the file paths supporting important conclusions.
- Never present an inference as an implemented feature.
- If evidence is insufficient, say so and ask for clarification.
- Do not assume that a monorepo implies microservices.
- Distinguish local provisioning from CI/CD deployment.
- Cite the supporting file path immediately after each important claim, not in a general list at the end.
- Do not classify architectural labels such as DDD, Clean Architecture or modular monolith as verified facts unless project documentation explicitly declares them.
- Avoid repeating the same conclusion as both a verified fact and an inference.

## Changes

- Do not modify files unless the user explicitly requests implementation.
- Before modifying code, explain the intended change and affected files.
- Preserve existing architecture and conventions unless a change is discussed.
- Avoid unnecessary abstractions, dependencies and complexity.
- Apply SOLID, Clean Architecture and DDD only where they provide concrete value.
- Never claim a command or test succeeded without executing it and reviewing its output.

## Safety

- Ask for approval before destructive commands, database resets or deleting files.
- Never expose or modify secrets, credentials or environment values.
- Do not edit generated files, dependency directories or build artifacts.
- Treat `.env*`, credentials and private keys as sensitive.

## Verification

- Run the smallest relevant validation after a change.
- Prefer focused tests before full test suites.
- Report what was verified, what failed and what was not executed.