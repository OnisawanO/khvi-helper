---
name: next-dev-loop
description: Verify Next.js runtime behavior after editing app code. Use with a running next dev server when runtime verification is required.
---

# Next.js Development Loop

After editing app code, verify the running application, not only lint or build output.

## Preconditions

- Next.js 16.3+ with Turbopack is required for `/_next/mcp` checks.
- `agent-browser` 0.31.1+ is required for browser verification.
- If these prerequisites are unavailable, report the limitation and use the project's documented fallback checks. Do not claim runtime verification was completed.

## Verification loop

1. Start `next dev` and record the actual port.
2. Probe `/_next/mcp` and confirm routes and compilation issues when the project version supports it.
3. Open the affected route in `agent-browser` with a stable worktree-scoped session.
4. Check compilation, server errors, visible user behavior, and navigation.
5. Record the verification command and result in the task summary.

Never replace a required runtime check with a guessed URL, screenshot-only inspection, or a claim that the app works because it compiles.
