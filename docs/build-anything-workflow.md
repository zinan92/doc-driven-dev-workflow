# Build Anything Workflow

## Purpose

This document defines the higher-level product delivery chain for building almost anything with the repo's document-driven workflow.

The canonical workflow is now machine-readable and first-class:

- `5` phases
- `22` stages
- explicit `execution mode`
- explicit `output_summary`
- explicit `recommended_skills`

Use this file to understand the product lifecycle. Use `docs/canonical-workflow.json` when you need the executable source of truth.

## The 5 Macro Phases

The recommended end-to-end chain is:

```mermaid
flowchart LR
    A[Research] --> B[Design]
    B --> C[Development]
    C --> D[Packaging]
    D --> E[Maintenance]
```

This model is now the same lifecycle reflected in the canonical workflow, not just a conceptual overlay.

## Phase Outputs

| Phase | Goal | Primary outputs |
|------|------|-----------------|
| Research | Stop building from thin air by anchoring the topic to reality | research brief, product anchor decision, screenshot evidence pack, short recommendation brief |
| Design | Turn the anchored idea into explicit product and execution definitions | clarified intake, task classification, scope estimate, PRD, PRD reality review, user flow, human approval, implementation plan, plan review, execution prompt |
| Development | Implement in bounded batches with explicit review and gates | code changes, batch execution reports, Codex review reports, phase gate decisions, final revision report |
| Packaging | Turn working code into a clean deliverable | integration checklist, release package, delivery approval |
| Maintenance | Feed learning back into the next cycle | next-cycle brief, backlog or debt list, polish opportunities, future spec candidates |

## Detailed Output Contract

### 1. Research

Research is now a first-class canonical phase that happens before PRD writing.

Recommended outputs:

- `Research brief`
  - topic
  - target user or job
  - product category guess
- `Primary anchor`
  - the closest market-facing product
- `Secondary anchor`
  - a second product covering an important missing surface or interaction
- `Similarity note`
  - rough fit such as `70-80% like TradingView, with onboarding closer to Instagram`
- `Evidence pack`
  - key pages
  - key flows
  - screenshots or stable links
- `Design implication`
  - one short statement describing what later PRD or prototype work should roughly look like

This is where `product-research` belongs.

### 2. Design

Design translates the research result into explicit documents that another agent can execute with minimal drift.

Current repository outputs:

- `handoffs/00-intake.md`
- `handoffs/05-task-classification.yaml`
- `handoffs/08-scope-estimate.md`
- `handoffs/10-prd.md`
- `handoffs/15-prd-reality-review.md`
- `handoffs/20-user-flow.md`
- `handoffs/21-user-flow.yaml`
- `handoffs/25-human-approval.md`
- `handoffs/30-implementation-plan.md`
- `handoffs/32-execution-workflow.yaml`
- `handoffs/35-plan-review.md`
- `handoffs/40-execution-prompt.md`

In short, the Design phase outputs:

- product definition
- user journey definition
- execution definition
- explicit approval to build

### 3. Development

Development is the bounded implementation loop.

Current repository outputs:

- `handoffs/50-claude-batch-r{round}.md`
- `handoffs/60-codex-review-r{round}.md`
- major phase gate decisions
- `handoffs/85-phase-gate.md`
- `handoffs/90-claude-final.md`
- the code changes themselves

This phase is complete only when:

- implementation exists
- required tests were run
- review gates passed
- major dependencies were not skipped

### 4. Packaging

Packaging starts after coding is functionally done.

It exists to turn "working" into "deliverable."

Current repository outputs:

- `handoffs/95-integration-checklist.md`
- `handoffs/96-release-package.md`
- `handoffs/97-delivery-approval.md`

### 5. Maintenance

Maintenance turns shipped work into the input for the next iteration.

Current repository outputs:

- `handoffs/99-next-cycle.md`
- `handoffs/100-backlog-and-debt.md`

## Canonical Mapping

The current repository enforces these exact canonical phases:

- `research`
- `design`
- `development`
- `packaging`
- `maintenance`

## Recommended Reading Order

If someone is new to the repo, the right order is:

1. Read this file for the full product delivery chain.
2. Read `docs/development-workflow.md` for the human-readable workflow explanation.
3. Read `docs/canonical-workflow.json` or `docs/canonical-workflow.yaml` for stage-by-stage mapping.

## Current Recommendation

Treat the 5-phase Build Anything workflow and the canonical workflow as the same official lifecycle, expressed at different levels of detail.
