import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXAMPLE_DIR = join(__dirname, "../../examples/example-task");
const OUTPUT = join(__dirname, "../src/data/example-task.json");

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

const state = readJson(join(EXAMPLE_DIR, "system/state.json"));
const statusMd = readFileSync(join(EXAMPLE_DIR, "status.md"), "utf-8");
const runLog = readJsonl(join(EXAMPLE_DIR, "system/run-log.jsonl"));
const handoffs = readHandoffs(join(EXAMPLE_DIR, "handoffs"));

const snapshot = { state, statusMd, handoffs, runLog };

writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2));
console.log(`Wrote ${OUTPUT}`);
