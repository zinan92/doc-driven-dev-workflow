import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename, resolve, delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, "../..");
const OUTPUT = join(__dirname, "../src/data/workflow-snapshots.json");
const DEFAULT_DISCOVERY_ROOTS = [join(REPO_ROOT, "examples"), join(REPO_ROOT, "tasks")];
const PHASE_STAGE_MAP: Record<string, string> = {
  clarify_objective: "research",
  classify_task: "research",
  product_research: "research",
  collect_reference_evidence: "research",
  research_approval_gate: "research",
  draft_prd: "design",
  prd_reality_review: "design",
  draft_user_flow: "design",
  draft_prototype_brief: "design",
  design_approval_gate: "design",
  draft_implementation_plan: "design",
  review_implementation_plan: "design",
  write_execution_prompt: "design",
  claude_code_batch_execution: "development",
  codex_reviews_batch: "development",
  gate_major_phase: "development",
  final_revision: "development",
  integrate_and_verify: "packaging",
  prepare_release_package: "packaging",
  delivery_approval_gate: "packaging",
  capture_next_cycle: "maintenance",
  update_backlog_and_debt: "maintenance",
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

function parseExtraRoots(): string[] {
  const cliRoots: string[] = [];
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === "--root" && process.argv[i + 1]) {
      cliRoots.push(resolve(process.argv[i + 1]));
      i += 1;
    }
  }

  const envRoots = (process.env.WORKFLOW_SNAPSHOT_ROOTS ?? "")
    .split(delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => resolve(entry));

  return [...new Set([...cliRoots, ...envRoots])];
}

function discoverTaskDirs(roots: readonly string[]): string[] {
  return roots.flatMap((root) => {
    if (!existsSync(root)) return [];
    if (isTaskDir(root)) return [root];
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
        : "maintenance",
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

const discoveryRoots = [...DEFAULT_DISCOVERY_ROOTS, ...parseExtraRoots()];
const snapshots = discoverTaskDirs(discoveryRoots).map(buildSnapshot);
const payload = {
  generatedAt: new Date().toISOString(),
  snapshots,
};

writeFileSync(OUTPUT, JSON.stringify(payload, null, 2));
console.log(`Wrote ${OUTPUT}`);
console.log(`Discovered ${snapshots.length} workflow snapshot(s) from:`);
for (const root of discoveryRoots) {
  console.log(`- ${root}`);
}
