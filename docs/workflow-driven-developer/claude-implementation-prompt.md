# Claude Implementation Prompt

Use this prompt in a fresh Claude Code session.

```text
You are implementing a front-end prototype for Workflow Driven Developer inside:
/Users/wendy/work/dev-co/doc-driven-dev-workflow

Read these files first:
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/docs/workflow-driven-developer/front-end-prd.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/docs/workflow-driven-developer/user-flow.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/docs/workflow-driven-developer/user-flow.yaml
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/docs/development-workflow.md

Also use these example-task artifacts as the source data to visualize:
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/status.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/system/state.json
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/system/run-log.jsonl
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/20-user-flow.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/21-user-flow.yaml
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/32-execution-workflow.yaml
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/50-claude-batch-r1.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/60-codex-review-r1.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/70-claude-batch-r2.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/80-codex-review-r2.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/90-claude-final.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/95-integration-checklist.md
- /Users/wendy/work/dev-co/doc-driven-dev-workflow/examples/example-task/handoffs/99-next-cycle.md

Product to build:
- A single-task, read-only, manual replay cockpit
- The first screen must prioritize the full 22-stage workflow graph grouped by the 5 canonical phases
- The operator should understand current progress within 10 seconds
- The UI is for one example task only in V1
- Do not add approvals, editing, mutation, or multi-task support

What the UI must show:
1. Top summary bar
2. Full canonical workflow graph
3. Step detail panel
4. Artifact preview panel
5. Manual replay timeline

Critical interaction rules:
- Clicking a workflow node updates the step detail and artifact preview
- Clicking a timeline event updates the selected workflow state
- The workflow graph should preserve all 22 canonical stages even if the example task uses a simplified flow
- If an exact artifact does not exist for a canonical stage, show the canonical stage meaning plus the closest supporting evidence

Visual direction:
- Dark interface
- Mission-control / workflow-cockpit feel
- High information density but still readable
- Clear system color semantics:
  - gray = not reached
  - cyan = selected
  - green = completed
  - amber = waiting
  - red = blocked
- Favor intentional layout over generic dashboard boilerplate

Implementation expectations:
- Inspect the repo and decide the best place to add the prototype
- Create a short execution plan before coding
- Use simple maintainable components
- Keep data parsing logic explicit and understandable
- Use the example task files as the source of truth for V1
- If you need mock normalization, keep it local and documented

Output expectations:
- Summarize what you built
- List which files were added or changed
- Explain any assumptions made when mapping the example task into the 22-stage canonical workflow
- Report what remains deferred for V2
```
