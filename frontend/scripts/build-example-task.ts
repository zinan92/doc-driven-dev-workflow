import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, "../..");
const OUTPUT = join(__dirname, "../src/data/workflow-snapshots.json");
const DISCOVERY_ROOTS = [join(REPO_ROOT, "examples"), join(REPO_ROOT, "tasks")];
const PHASE_STAGE_MAP: Record<string, string> = {
  clarify_objective: "intention_framing",
  classify_task: "intention_framing",
  draft_prd: "document_authoring",
  prd_reality_review: "document_authoring",
  draft_user_flow: "document_authoring",
  human_approval_gate: "document_authoring",
  draft_implementation_plan: "document_authoring",
  review_implementation_plan: "document_authoring",
  write_execution_prompt: "document_authoring",
  claude_code_batch_execution: "code_execution",
  codex_reviews_batch: "code_execution",
  gate_major_phase: "code_execution",
  final_revision: "code_execution",
  integrate_merge_cleanup: "integration_cleanup",
  next_cycle: "integration_cleanup",
};

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function readJsonl(path: string): unknown[] {
  return readFileSync(path, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function readHandoffs(dir: string) {
  const files = readdirSync(dir).sort();
  return files.map((f) => {
    const raw = readFileSync(join(dir, f), "utf-8");
    const { data, content } = matter(raw);
    return { filename: f, content: content.trim(), frontmatter: data };
  });
}

function isTaskDir(path: string): boolean {
  return existsSync(join(path, "status.md")) && existsSync(join(path, "handoffs")) && existsSync(join(path, "system"));
}

function discoverTaskDirs(): string[] {
  return DISCOVERY_ROOTS.flatMap((root) => {
    if (!existsSync(root)) return [];
    return readdirSync(root)
      .map((entry) => join(root, entry))
      .filter(isTaskDir);
  }).sort();
}

function buildSnapshot(taskDir: string) {
  const state = readJson(join(taskDir, "system/state.json")) as Record<string, unknown>;
  const taskId = typeof state.task_id === "string" ? state.task_id : basename(taskDir);
  const normalizedState = {
    ...state,
    current_phase:
      typeof state.stage === "string" && PHASE_STAGE_MAP[state.stage]
        ? PHASE_STAGE_MAP[state.stage]
        : "integration_cleanup",
    updated_at: null,
  };

  return {
    id: basename(taskDir),
    label: taskId.replace(/^TASK-\d{4}-\d{2}-\d{2}-/, "").replace(/-/g, " "),
    sourceDir: taskDir.replace(`${REPO_ROOT}/`, ""),
    state: normalizedState,
    statusMd: readFileSync(join(taskDir, "status.md"), "utf-8"),
    runLog: existsSync(join(taskDir, "system/run-log.jsonl"))
      ? readJsonl(join(taskDir, "system/run-log.jsonl"))
      : [],
    handoffs: readHandoffs(join(taskDir, "handoffs")),
  };
}

const snapshots = discoverTaskDirs().map(buildSnapshot);
const payload = {
  generatedAt: new Date().toISOString(),
  snapshots,
};

writeFileSync(OUTPUT, JSON.stringify(payload, null, 2));
console.log(`Wrote ${OUTPUT}`);
