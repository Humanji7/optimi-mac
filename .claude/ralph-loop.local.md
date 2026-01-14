---
active: true
iteration: 1
max_iterations: 10
completion_promise: "REVIEW_COMPLETE"
started_at: "2026-01-14T09:08:24Z"
---

Use the codex-review skill to review uncommitted changes. Run the skill to execute Codex CLI /review (option 2: Review uncommitted changes). Wait for Codex to complete. Parse output for P0, P1, P2 issues. Fix ALL found issues (P0 first, then P1, then P2). Run the review again. Output REVIEW_COMPLETE ONLY when Codex confirms no issues found.
