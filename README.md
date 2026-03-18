<div align="center">

# Doc-Driven Development Workflow

**把需求澄清、PRD、执行计划、实现批次和评审结论都沉淀为文档，让 `Codex` 与 `Claude Code` 在终端里按可审计流程协作，并通过 local-first observer dashboard 可视化整个 workflow。**

[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://python.org)
[![Workflow](https://img.shields.io/badge/workflow-terminal--first-black.svg)](https://github.com/zinan92/doc-driven-dev-workflow)

</div>

---

## 痛点

直接把任务扔给 coding agent，往往会把需求澄清、方案设计、实现和评审揉成一轮对话。结果通常不是“更快”，而是需求漂移、上下文丢失、评审滞后，以及关键决策只留在聊天记录里。

对个人开发者尤其如此：没有正式项目管理系统，也没有复杂 orchestrator，但依然需要一个可重复、可检查、可交接的工作流来约束代理行为。

## 解决方案

这个仓库提供了一套 repo-local、document-driven 的开发流程，把任务生命周期拆成 intake、PRD、user flow、implementation plan、execution prompt、batch review 和 final integration 等稳定 handoff。文档是协作面，脚本负责搭建与校验，终端会话只负责执行。

你可以把它理解为一套轻量但严格的“开发协议”：人负责目标、取舍和审批，`Codex` 负责规划和评审，`Claude Code` 负责实现与修订，所有阶段性结果都落在仓库里的文件系统中。

现在仓库还额外包含一个 `Workflow Driven Developer` 前端原型：它会扫描 repo 内 `examples/` 和 `tasks/` 下符合协议的 task 目录，读取其中的 `state.json`、`run-log.jsonl` 和 `handoffs/*.md`，把黑箱式的 doc-driven task 变成可观察的 workflow cockpit。

## 架构

```text
┌──────────────┐      ┌────────────────────────────┐
│    Human     │─────▶│ intake / approval handoffs │
└──────────────┘      └─────────────┬──────────────┘
                                    │
                                    ▼
                         ┌─────────────────────────┐
                         │ docs/development-       │
                         │ workflow.md             │
                         │ canonical workflow spec │
                         └─────────────┬───────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
          ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
          │     Codex      │  │  Claude Code   │  │    Scripts     │
          │ plan / review  │  │ implement / fix│  │ scaffold/      │
          │ write handoffs │  │ write reports  │  │ validate/next  │
          └────────┬───────┘  └────────┬───────┘  └────────┬───────┘
                   │                   │                   │
                   └───────────────────┴───────────────────┘
                                       │
                                       ▼
                         ┌─────────────────────────┐
                         │ tasks/<task-id>/        │
                         │ handoffs/ + status.md   │
                         │ + system/state.json     │
                         │ + system/run-log.jsonl  │
                         └─────────────┬───────────┘
                                       │
                                       ▼
                         ┌─────────────────────────┐
                         │ Workflow Driven         │
                         │ Developer dashboard     │
                         │ local-first observer    │
                         └─────────────────────────┘
```

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/zinan92/doc-driven-dev-workflow.git
cd doc-driven-dev-workflow

# 2. 安装依赖
# 本项目默认无第三方 Python 依赖，确认 python3 可用即可

# 3. 配置环境变量
# 本项目默认无需 .env，可跳过此步

# 4. 启动服务
python3 scripts/scaffold_dev_workflow_task.py \
  --name "My First Task" \
  --repo-path /path/to/my/repo

python3 scripts/validate_dev_workflow_task.py tasks/<task-id>
python3 scripts/dev_workflow_next_step.py tasks/<task-id>
```

### 启动 Workflow Observer Dashboard

```bash
cd frontend
npm install
npm run build:data
npm run dev
```

默认会扫描 `examples/` 和 `tasks/` 下的本地 workflow snapshots，把 doc-driven task 可视化成三栏式 read-only observer cockpit。左侧是 task rail，中间是 workflow canvas，右侧是 inspector。

## 功能一览

| 功能 | 说明 | 状态 |
|------|------|------|
| Canonical workflow spec | 用 `docs/development-workflow.md` 定义完整的阶段、角色和审批边界 | 已完成 |
| Task scaffolding | 通过脚本生成标准化任务目录、占位符和初始 system files | 已完成 |
| Structure validation | 校验 handoff 文件、frontmatter、状态摘要和 `state.json` 关键字段 | 已完成 |
| Next-step recommendation | 基于 `system/state.json` 给出当前任务下一步建议 | 已完成 |
| Workflow state writer scripts | 用脚本稳定写入 `state.json` 和 `run-log.jsonl`，供 observer 读取 | 已完成 |
| Example task references | 提供 small / medium 示例任务，帮助理解产物形态 | 已完成 |
| Workflow Driven Developer | local-first observer dashboard，自动读取 repo 内 task snapshots，展示 workflow canvas、artifacts 和 replay | 原型已完成 |
| Agent-as-runner prompt | 让 Claude/Codex 直接读取 workflow 并通过脚本推进状态 | 已完成 |
| Packaging / CI automation | 包管理、CI、自动 PR 流程等能力暂未内建 | 计划中 |

## API 参考

| 方法 | 路径 | 说明 |
|------|------|------|
| `CLI` | `python3 scripts/scaffold_dev_workflow_task.py --name "<task>" --repo-path <repo>` | 创建新的工作流任务目录 |
| `CLI` | `python3 scripts/validate_dev_workflow_task.py tasks/<task-id>` | 校验任务目录结构是否满足协议要求 |
| `CLI` | `python3 scripts/dev_workflow_next_step.py tasks/<task-id>` | 根据当前 stage 输出推荐下一步动作 |
| `CLI` | `python3 scripts/update_task_state.py tasks/<task-id> --stage <stage-id> --artifact <path>` | 通过稳定接口更新 observer 可读状态 |
| `CLI` | `python3 scripts/append_task_event.py tasks/<task-id> --event <event-name> --artifact <path>` | 通过稳定接口追加结构化 workflow 事件 |
| `DOC` | `docs/development-workflow.md` | 规范任务生命周期、角色分工和阶段契约 |
| `REF` | `examples/example-task/README.md` | 展示小型任务的完整参考产物 |
| `WEB` | `frontend/` | 本地 workflow observer dashboard 原型 |

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 运行时 | Python 3.9+ | 运行脚本式工作流工具 |
| 框架 | Standard Library | 通过 `argparse`、`pathlib`、`json`、`shutil` 实现轻量工具链 |
| 数据存储 | Markdown + YAML + JSON | 保存 handoff、状态和机器可读流程信息 |
| 前端 | React + TypeScript + Vite | 本地 workflow observer dashboard |
| 执行环境 | Terminal + Git | 在本地仓库中运行文档驱动协作流程 |

## 项目结构

```text
doc-driven-dev-workflow/
├── README.md                               # 项目入口与使用说明
├── docs/
│   ├── development-workflow.md             # Canonical workflow instruction
│   ├── plans/                              # 实现计划
│   ├── workflow-driven-developer/          # observer/dashboard 设计文档
│   └── templates/
│       └── development-workflow/           # 标准任务模板
├── examples/
│   ├── example-task/                       # Small task 示例
│   └── medium-example-task/                # Medium task 示例
├── frontend/                               # Workflow Driven Developer 原型
├── scripts/
│   ├── scaffold_dev_workflow_task.py       # 生成任务目录
│   ├── validate_dev_workflow_task.py       # 校验任务结构
│   └── dev_workflow_next_step.py           # 输出下一步建议
└── tests/
    ├── test_scaffold_dev_workflow_task.py  # scaffolder 测试
    └── test_dev_workflow_helpers.py        # validator / next-step 测试
```

## 适用场景

- 你希望把 coding agent 从“随手对话式编码”提升为“有文档协议的受控执行”
- 你想让 `Codex` 做规划与评审，让 `Claude Code` 做实现，但不想引入复杂平台
- 你需要把审批、批次、评审结论和下一轮行动沉淀成 repo 内可追溯资产
- 你想给 doc-driven task 增加一个 local-first 的观察面板，快速看懂当前进行到哪一步

## 非目标

- 不是一个 full-blown OpenClaw 替代品
- 不是一个 CI-first 自动化平台
- 不是一个多代理并发 orchestrator
- 不是“一句提示词自动完成所有开发”的 one-shot prompting 工具

## Workflow Observer

`Workflow Driven Developer` 是这个仓库里的第一个 UI 原型。它不是 orchestrator，而是 observer。

它当前的设计原则：

- `state.json` 作为当前状态真相
- `run-log.jsonl` 作为历史事件流
- `handoffs/*.md` 作为 step-level evidence
- `status.md` 保留为 human-readable summary

当前原型支持：

- 左侧 `Task Rail` 浏览 repo-local workflow snapshots
- 中间 `Workflow Canvas` 按 4 个 phase 展示完整 15-stage canonical workflow
- 右侧 `Inspector` 查看 step detail、artifacts、working folder 和 context
- 基于本地 snapshots 的手动 replay
- 通过 writer scripts 接入真实任务状态
- 通过 agent-runner prompt 让 agent 读取 workflow 并推进状态

相关文档：

- `docs/workflow-driven-developer/front-end-prd.md`
- `docs/workflow-driven-developer/user-flow.md`
- `docs/workflow-driven-developer/observer-data-model.md`
- `docs/workflow-driven-developer/agent-runner-prompt.md`
