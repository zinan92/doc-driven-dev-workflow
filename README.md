<div align="center">

# Doc-Driven Development Workflow

**把模糊想法收敛成可执行 handoff，让人类、`Codex`、`Claude Code` 和脚本在同一套可审计 workflow 里协作。**

[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-19-blue.svg)](https://react.dev)
[![Workflow](https://img.shields.io/badge/workflow-5_phase%20%7C%2022_stage-black.svg)](https://github.com/zinan92/doc-driven-dev-workflow)

</div>

---

## 痛点

把任务直接丢给 coding agent，常见结果不是更快，而是更乱：需求澄清、研究、PRD、执行、评审全部混在一轮对话里，关键决策只存在聊天记录，没有稳定 handoff，也没有明确的审批点。

对个人开发者和小团队尤其明显。你可能没有 Jira、没有复杂 orchestrator，也不想引入重型流程工具，但依然需要一套可以重复、可以检查、可以交接、可以给 AI 读懂的开发协议。

## 解决方案

这个仓库提供了一套 terminal-first、repo-local、document-driven 的开发 workflow。它把开发过程拆成 `Research -> Design -> Development -> Packaging -> Maintenance` 五个 phase，并在机器可读层进一步细化成 `22` 个 stages。

这不是一份静态文档，而是一整套可运行的工作流资产：workflow spec、task 模板、状态写入脚本、结构校验脚本，以及一个 local-first observer dashboard。你可以把它当成自己的 AI-native 开发操作系统。

## 架构

```text
┌──────────────┐
│    Human     │
│ goals/gates  │
└──────┬───────┘
       │ approvals / direction
       ▼
┌─────────────────────────────────────────────┐
│ docs/canonical-workflow.json                │
│ docs/development-workflow.md                │
│ docs/build-anything-workflow.md             │
└──────────────┬──────────────────────────────┘
               │ source of truth
      ┌────────┼──────────┐
      ▼        ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────────────┐
│  Codex   │ │ Claude   │ │     Scripts      │
│ plan/rev │ │ Code impl│ │ scaffold/guard   │
│ process  │ │ revise   │ │ state/event I/O  │
└────┬─────┘ └────┬─────┘ └────────┬─────────┘
     └────────────┴────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ tasks/TASK-YYYY-MM-DD-name/                 │
│ status.md + handoffs/*.md + state.json      │
│ + run-log.jsonl                             │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ frontend/ workflow observer dashboard       │
│ task rail + workflow canvas + inspector     │
└─────────────────────────────────────────────┘
```

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/zinan92/doc-driven-dev-workflow.git
cd doc-driven-dev-workflow

# 2. 安装前端依赖（dashboard 用）
cd frontend
npm install
cd ..

# 3. 为你的真实项目创建一个 workflow task
python3 scripts/scaffold_dev_workflow_task.py \
  --name "Build Feature X" \
  --repo-path /absolute/path/to/your/repo

# 4. 校验 task 结构并查看下一步
python3 scripts/validate_dev_workflow_task.py tasks/<task-id>
python3 scripts/dev_workflow_next_step.py tasks/<task-id>

# 5. 启动 observer dashboard
cd frontend
npm run build:data
npm run dev
```

如果你的 task 不在本仓库自带的 `tasks/` 下，而是在外部目录里，可以这样让 dashboard 扫描：

```bash
cd frontend
WORKFLOW_SNAPSHOT_ROOTS="/absolute/path/to/external/tasks" npm run build:data
npm run dev
```

## 功能一览

| 功能 | 说明 | 状态 |
|------|------|------|
| 5-phase / 22-stage workflow | 把完整 Build Anything 生命周期落成 machine-readable canonical workflow | 已完成 |
| Task scaffolding | 一键生成标准 task 目录、handoffs、state 和 run log | 已完成 |
| Workflow guards | 强制 stage 顺序、actor ownership、human gates 和前置输入 | 已完成 |
| State / event writers | 通过脚本稳定写入 `state.json` 和 `run-log.jsonl` | 已完成 |
| Local-first observer dashboard | 可视化 task rail、workflow canvas、artifact preview 和 replay timeline | 已完成 |
| Example tasks | small / medium 示例任务，帮助理解 artifact 形态 | 已完成 |
| Product research stage | 在 PRD 前先做 anchor research 和 reference evidence 收集 | 已完成 |
| Release / maintenance artifacts | 把 packaging 与 maintenance 拆成正式 stage | 已完成 |
| CI / hosted orchestration | 云端托管、自动 PR、远程协作基础设施 | 计划中 |

## API 参考

| 方法 | 路径 | 说明 |
|------|------|------|
| `CLI` | `python3 scripts/scaffold_dev_workflow_task.py --name "<task>" --repo-path <repo>` | 创建新的 workflow task |
| `CLI` | `python3 scripts/validate_dev_workflow_task.py tasks/<task-id>` | 校验 task 是否满足协议要求 |
| `CLI` | `python3 scripts/dev_workflow_next_step.py tasks/<task-id>` | 输出当前 task 的推荐下一步 |
| `CLI` | `python3 scripts/update_task_state.py tasks/<task-id> --stage <stage-id> --actor <actor> --artifact <path>` | 通过受控接口更新 task 状态 |
| `CLI` | `python3 scripts/append_task_event.py tasks/<task-id> --event <event> --artifact <path>` | 追加结构化 workflow 事件 |
| `DOC` | `docs/canonical-workflow.json` | 机器可读 source of truth |
| `DOC` | `docs/development-workflow.md` | 人类可读 workflow 说明 |
| `DOC` | `docs/build-anything-workflow.md` | 5-phase 生命周期解释 |
| `WEB` | `frontend/` | local workflow observer dashboard |

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 运行时 | Python 3.9+ | workflow scripts 与 task scaffolding |
| 前端 | React 19 + TypeScript + Vite | observer dashboard |
| 测试 | Vitest + Testing Library | frontend 行为验证 |
| 解析 | `json` / `yaml` / `gray-matter` | handoff、state 与 schema 解析 |
| 协作面 | Markdown + YAML + JSONL | 文档 handoff 与 workflow state |

## 项目结构

```text
doc-driven-dev-workflow/
├── docs/
│   ├── canonical-workflow.json                 # 机器可读 workflow source of truth
│   ├── build-anything-workflow.md              # 5-phase 生命周期说明
│   ├── development-workflow.md                 # 人类可读执行协议
│   ├── templates/development-workflow/task-root/
│   │   ├── handoffs/                           # 标准 handoff 模板
│   │   ├── status.md
│   │   └── system/state.json
│   └── workflow-driven-developer/              # dashboard 相关设计文档
├── scripts/
│   ├── scaffold_dev_workflow_task.py           # 创建 task
│   ├── validate_dev_workflow_task.py           # 校验 task 结构
│   ├── dev_workflow_next_step.py               # 推荐下一步
│   ├── update_task_state.py                    # 状态写入
│   ├── append_task_event.py                    # 事件写入
│   └── workflow_guard.py                       # 核心 guard 逻辑
├── examples/                                   # small / medium 参考 task
├── tasks/                                      # 本地实际 task 工作目录
├── frontend/                                   # observer dashboard
├── CLAUDE.md                                   # agent instructions
└── README.md
```

## 配置

| 变量 | 说明 | 必填 | 默认值 |
|------|------|------|--------|
| `WORKFLOW_SNAPSHOT_ROOTS` | 给 dashboard 额外指定 task roots | 否 | 扫描 repo 内 `examples/` 和 `tasks/` |

## For AI Agents

本节面向要直接使用这套 workflow 的 AI agent。

推荐阅读顺序：

1. `README.md`
2. `docs/build-anything-workflow.md`
3. `docs/development-workflow.md`
4. `docs/canonical-workflow.json`
5. 当前 task 目录下的 `status.md`、`system/state.json`、`handoffs/`

执行规则：

- 一次只推进一个 canonical stage，不要把多个 stage 混在一轮里
- 所有 machine state 更新都走脚本，不要手改 `state.json` 和 `run-log.jsonl`
- 遇到 `human_approval_gate` 必须停下，等待人类批准
- 先做 `Research`，再做 `Design`，不要从空气里直接写 PRD 或直接开工
- 如果 workflow 为当前 stage 推荐了 skill，优先使用它

最推荐的使用方式：

- 单 AI 模式：同一个 agent 兼任 planner / reviewer / executor，但仍然严格按 stage 推进
- 双 AI 模式：`Codex` 负责 research、planning、review；`Claude Code` 负责 implementation 和 revision
- 人类只负责目标、取舍和 gate approval，不负责手工维护流程状态

如果你要把这套仓库发给第三方朋友，最好的用法不是“让他读一遍 README 就开始”，而是：

1. 让他 clone 这个 repo
2. 用 `scaffold_dev_workflow_task.py` 给自己的真实项目创建 task
3. 让 AI 读取 workflow docs 和 task 目录
4. 让 AI 严格按 canonical workflow 推进
5. 用 dashboard 观察整个过程

## 推荐用法

这套仓库最适合三类人：

- 想把 AI 开发从“聊天”升级成“流程”的个人开发者
- 想保留 terminal-first 习惯，但又需要可审计 handoff 的小团队
- 想把多个 AI 角色拆开协作的人，例如一个负责 plan/review，一个负责 coding

最佳实践不是把一个模糊需求直接扔给 AI，而是把它放进这条链路里：

```text
Topic -> Research -> Design -> Development -> Packaging -> Maintenance
```

也就是说：

- `Research` 先决定最像哪个现成产品，并留下证据
- `Design` 再把研究结果转成 PRD、user flow、prototype brief 和 plan
- `Development` 只负责按 plan 分批实现
- `Packaging` 负责把“能运行”变成“能交付”
- `Maintenance` 把 learnings 和 debt 沉淀回下一个 cycle

## 相关文档

- [Build Anything Workflow](docs/build-anything-workflow.md)
- [Development Workflow](docs/development-workflow.md)
- [Canonical Workflow JSON](docs/canonical-workflow.json)
- [Frontend README](frontend/README.md)
- [Example Task](examples/example-task/README.md)
