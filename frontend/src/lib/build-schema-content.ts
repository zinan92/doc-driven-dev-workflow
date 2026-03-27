import type { WorkflowStep } from "../types/workflow";
import { CANONICAL_STAGES } from "../data/canonical-stages";

/** Step contract schemas derived from development-workflow.md */
const STAGE_SCHEMAS: Record<string, string> = {
  clarify_objective: `step_contract:
  id: clarify_objective
  actor: codex
  step_type: ai_routing
  required_outputs:
    - clear objective
    - clear success condition
    - clear scope boundary
  validation:
    - objective is specific and actionable
    - success condition is measurable
    - scope boundary excludes out-of-scope items`,

  classify_task: `step_contract:
  id: classify_task
  actor: codex
  step_type: ai_routing
  required_outputs:
    - task_type: enum [feature, new_project, bug_fix, optimization]
    - task_size: enum [small, medium, large]
    - estimate_summary: string
    - rationale: string
  validation:
    type: schema
    checks:
      - task_type is one of allowed values
      - task_size is one of allowed values
      - rationale references concrete evidence`,

  product_research: `step_contract:
  id: product_research
  actor: codex
  step_type: ai_routing
  required_outputs:
    - primary anchor
    - secondary anchor
    - similarity note
  validation:
    - names concrete market-facing products
    - avoids abstract categories
    - design implication is explicit`,

  collect_reference_evidence: `step_contract:
  id: collect_reference_evidence
  actor: codex
  step_type: ai_routing
  required_outputs:
    - key pages
    - key flows
    - sources
  validation:
    - evidence references the chosen anchors
    - each artifact has a clear rationale`,

  research_approval_gate: `step_contract:
  id: research_approval_gate
  actor: human
  step_type: human_approval_gate
  approval_scope:
    - product anchors
    - screenshot evidence
  allowed_decisions:
    - approved
    - revise
    - reject`,

  draft_prd: `step_contract:
  id: draft_prd
  actor: codex
  step_type: ai_routing
  required_sections:
    - purpose
    - scope
    - non-goals
    - contracts
    - expected behavior
    - acceptance criteria
    - constraints
    - terminology
  validation:
    type: required_sections
    checks:
      - all required sections present
      - frontmatter parses correctly
      - acceptance criteria are testable`,

  prd_reality_review: `step_contract:
  id: prd_reality_review
  actor: codex
  step_type: ai_routing + script-assisted repo inspection
  required_outputs:
    - corrected PRD
    - contradiction list resolved
    - explicit baseline assumptions
  validation:
    - no unresolved contradictions remain
    - baseline assumptions are documented`,

  draft_user_flow: `step_contract:
  id: draft_user_flow
  actor: codex
  step_type: ai_routing
  required_outputs:
    - user-flow.md (human-readable)
    - user-flow.yaml (structured)
  validation:
    type: schema
    checks:
      - YAML parses correctly
      - each step has: id, name, actor, step_type, goal, inputs, outputs, validation, next
      - step_type is one of: script, llm, human_gate`,

  draft_prototype_brief: `step_contract:
  id: draft_prototype_brief
  actor: codex
  step_type: ai_routing
  required_outputs:
    - core screens
    - key interactions
    - visual direction
  validation:
    - screen list is concrete
    - visual direction references research evidence`,

  design_approval_gate: `step_contract:
  id: design_approval_gate
  actor: human
  step_type: human_approval_gate
  approval_scope:
    - PRD
    - user flow
    - prototype brief
  allowed_decisions:
    - approved
    - revise
    - reject
  validation:
    - decision is one of allowed values
    - without approval, workflow must not proceed to implementation`,

  draft_implementation_plan: `step_contract:
  id: draft_implementation_plan
  actor: codex
  step_type: ai_routing
  required_outputs:
    - phases
    - batches
    - task order
    - likely file touchpoints
    - verification steps
    - stop conditions
  validation:
    - plan is structured and ordered
    - verification commands are explicit`,

  review_implementation_plan: `step_contract:
  id: review_implementation_plan
  actor: codex
  step_type: ai_routing
  required_outputs:
    - reviewed plan
    - clarified execution order
    - clarified verification commands
    - clarified dependency boundaries
  validation:
    - execution order is unambiguous
    - another agent can execute with minimal interpretation drift`,

  write_execution_prompt: `step_contract:
  id: write_execution_prompt
  actor: codex
  step_type: ai_routing
  required_fields:
    - repository path
    - PRD path
    - implementation plan path
    - source-of-truth rules
    - execution order
    - stop conditions
    - logging requirements
    - report format
    - forbidden behaviors
  validation:
    - all required fields present
    - stop conditions are explicit`,

  claude_code_batch_execution: `step_contract:
  id: claude_code_batch_execution
  actor: claude_code
  step_type: ai_routing + scripts
  batch_report_sections:
    - Tasks Completed
    - Files Changed
    - Tests Run
    - Result
    - Next Proposed Batch
  validation:
    type: required_sections
    checks:
      - all batch report sections present
      - tests actually ran (not just listed)`,

  codex_reviews_batch: `step_contract:
  id: codex_reviews_batch
  actor: codex
  step_type: ai_routing
  required_outputs:
    - findings
    - severity or priority
    - required changes
    - optional improvements
    - gate decision
  gate_decisions:
    - proceed
    - fix_before_proceeding
    - stop_and_rethink
  validation:
    - gate decision is one of allowed values
    - required changes are actionable`,

  gate_major_phase: `step_contract:
  id: gate_major_phase
  actor: human
  step_type: human_approval_gate
  purpose: prevent downstream work before upstream contracts verified
  typical_gates:
    - backend before UI
    - infrastructure before workflow logic
    - data model before feature layer
    - refactor before product polish
  validation:
    - upstream contracts verified before proceeding`,

  final_revision: `step_contract:
  id: final_revision
  actor: claude_code
  step_type: ai_routing
  required_outputs:
    - what changed
    - what files changed
    - what was intentionally left unchanged
    - what tests or verification steps ran
    - any blocker still present
  validation:
    - output is treated as final version for v1
    - no unresolved blockers unless escalated`,

  integrate_and_verify: `step_contract:
  id: integrate_and_verify
  actor: human + codex
  step_type: script
  required_checks:
    - required tests have run
    - required build checks have run
    - repo state is understandable
    - merge readiness is documented
    - branch/worktree cleanup is complete
    - follow-up items are written down
  validation:
    - delivery is complete only when integration is clean`,

  prepare_release_package: `step_contract:
  id: prepare_release_package
  actor: codex
  step_type: ai_routing
  required_outputs:
    - delivery surface
    - release notes
    - demo assets
    - outstanding follow-ups`,

  delivery_approval_gate: `step_contract:
  id: delivery_approval_gate
  actor: human
  step_type: human_approval_gate
  approval_scope:
    - release package
    - delivery surface
  allowed_decisions:
    - approved
    - revise
    - reject`,

  capture_next_cycle: `step_contract:
  id: capture_next_cycle
  actor: codex
  step_type: ai_routing
  required_topics:
    - architectural debt
    - deferred cleanup
    - legacy removal
    - product polish
    - performance improvement opportunities
    - next spec or plan candidate
  validation:
    - at least one next action is identified`,

  update_backlog_and_debt: `step_contract:
  id: update_backlog_and_debt
  actor: codex
  step_type: ai_routing
  required_outputs:
    - immediate follow-ups
    - deferred debt
    - candidate specs`,
};

export function buildSchemaContent(step: Pick<WorkflowStep, "id" | "inputs" | "outputs" | "validation" | "failure" | "next">): string {
  const schema = STAGE_SCHEMAS[step.id];
  if (schema) return schema;

  // Fallback: build from step metadata
  const stage = CANONICAL_STAGES.find((s) => s.id === step.id);
  const lines = [
    `step_contract:`,
    `  id: ${step.id}`,
    `  actor: ${stage?.actor ?? "unknown"}`,
    `  step_type: ${stage?.stepType ?? "unknown"}`,
  ];
  if (step.inputs.length > 0) {
    lines.push(`  inputs:`);
    step.inputs.forEach((i) => lines.push(`    - ${i}`));
  }
  if (step.outputs.length > 0) {
    lines.push(`  outputs:`);
    step.outputs.forEach((o) => lines.push(`    - ${o}`));
  }
  return lines.join("\n");
}
