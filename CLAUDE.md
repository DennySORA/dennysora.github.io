# Claude Code Project Instructions

@AGENTS.md

## Claude Code-specific guidance

- `AGENTS.md` is the canonical shared instruction file. Do not duplicate its stack, product, documentation, quality, or tool-routing rules here.
- If root `PROJECT_AGENT.md` exists, read it after the imported shared policy; it is the target-owned repository profile, not a managed-policy file.
- Treat user and project Claude configuration as private state. Do not modify `~/.claude.json`, `~/.claude/`, project `.mcp.json`, plugins, hooks, Skills, permissions, or language-server setup unless the task explicitly requests that configuration change.
- A marketplace plugin being installed does not prove its backing executable or language server is callable. Use only capabilities exposed to the current session.
- For MCP or Skill tests, use fake CLIs and temporary home/config/state roots. Never exercise the developer's real global Claude configuration in automated tests.
- Before claiming completion, report exact commands and distinguish passed, failed, blocked, not run, and not applicable checks.
