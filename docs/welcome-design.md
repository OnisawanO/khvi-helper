# Welcome workspace (task scope)

`/welcome#welcome-user` is the signed-in starting view for User and `/welcome#welcome-Interpreter` is the signed-in starting view for Interpreter. Both views share the same header. Manager and Admin continue to their existing consoles. Visitors return to `/#top`. This describes the current mock implementation, not production authorization.

## Consistency review

| Topic | Evidence | Decision |
|---|---|---|
| User starting page | requirements FR-04, user-flows.txt | Show service guidance and working links to create and track requests. |
| Interpreter starting page | Existing documents plan an interpreter dashboard; the current user request asks for Welcome for both roles. | Use role-specific Welcome content for this task. The map remains planned. |
| Authentication | mock-auth.ts stores sessions locally; requirements FR-01 and server authorization are future integration work. | Use the existing session for navigation and presentation. This is not a security boundary. |
| Request activity | request-store.ts stores device-wide records with no requester or interpreter identity. | Label activity as saved on this device. Interpreter routes may show status-based request summaries for preview, but must not present them as account-owned or skill-matched data. |
| Interpreter jobs | Map, profile matching, claims and account-scoped job history have no implemented data source. | Use `/find-requests` for open summaries and `/my-assignments` for claimed, in-progress or completed summaries. Keep Claim unavailable until its workflow exists. |
| Privacy | FR-10/11 require requester confirmation; current request detail unlocks after claim. | Leave that workflow unchanged here. Provide practical privacy advice; describe confirmation in the planned interpreter guide. |
| Scheduling | Current code implements strictly over 30 minutes and at most 24 hours ahead per earlier user instruction. | Describe existing appointment limits; leave expiry implementation unchanged. |

No database schema, claim workflow, request ownership or server authorization is changed. Existing design tokens, header, footer, badges and navigation anchors are reused. Welcome displays name, role, sign-out and role-specific links. There is no availability switch, chat or rating data.

Production work still requires Supabase sessions, server authorization and account-scoped records. Canonical requirements and route governance remain unchanged by this task-specific design.

## Verification

- `npm run lint` and `npm run build` passed.
- Existing development server: `http://localhost:3000`. `/_next/mcp` `get_errors` returned empty configuration and session errors.
- Browser checks used the available Codex browser controls because `agent-browser` was unavailable: User and Interpreter quick login, visitor redirect from `/welcome`, sign-out to `/#top`, requester links, Back to main returning to `/welcome#welcome-user` with `scrollY = 0`, interpreter guide anchor and Chinese language switching.
- Checked layouts at 390, 768 and 1440 pixels with no horizontal overflow. Also checked overflow at 320 pixels. The requester empty state was exercised; populated records retain existing request-store and status-badge contracts.
- LSP CLI was unavailable; source reads, reference searches and the TypeScript build covered import/type verification.
- Post-change review keeps claim, contact-unlock, scheduling and database contracts unchanged. The implementation remains a mock workspace.
