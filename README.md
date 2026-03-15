<div align="center">

# Doc-Driven Development Workflow

**把需求澄清、PRD、执行计划、实现批次和评审结论都沉淀为文档，让 `Codex` 与 `Claude Code` 在终端里按可审计流程协作。**

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

## 功能一览

| 功能 | 说明 | 状态 |
|------|------|------|
| Canonical workflow spec | 用 `docs/development-workflow.md` 定义完整的阶段、角色和审批边界 | 已完成 |
| Task scaffolding | 通过脚本生成标准化任务目录、占位符和初始 system files | 已完成 |
| Structure validation | 校验 handoff 文件、frontmatter、状态摘要和 `state.json` 关键字段 | 已完成 |
| Next-step recommendation | 基于 `system/state.json` 给出当前任务下一步建议 | 已完成 |
| Example task references | 提供 small / medium 示例任务，帮助理解产物形态 | 已完成 |
| Packaging / CI automation | 包管理、CI、自动 PR 流程等能力暂未内建 | 计划中 |

## API 参考

| 方法 | 路径 | 说明 |
|------|------|------|
| `CLI` | `python3 scripts/scaffold_dev_workflow_task.py --name "<task>" --repo-path <repo>` | 创建新的工作流任务目录 |
| `CLI` | `python3 scripts/validate_dev_workflow_task.py tasks/<task-id>` | 校验任务目录结构是否满足协议要求 |
| `CLI` | `python3 scripts/dev_workflow_next_step.py tasks/<task-id>` | 根据当前 stage 输出推荐下一步动作 |
| `DOC` | `docs/development-workflow.md` | 规范任务生命周期、角色分工和阶段契约 |
| `REF` | `examples/example-task/README.md` | 展示小型任务的完整参考产物 |

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 运行时 | Python 3.9+ | 运行脚本式工作流工具 |
| 框架 | Standard Library | 通过 `argparse`、`pathlib`、`json`、`shutil` 实现轻量工具链 |
| 数据存储 | Markdown + YAML + JSON | 保存 handoff、状态和机器可读流程信息 |
| 执行环境 | Terminal + Git | 在本地仓库中运行文档驱动协作流程 |

## 项目结构

```text
doc-driven-dev-workflow/
├── README.md                               # 项目入口与使用说明
├── docs/
│   ├── development-workflow.md             # Canonical workflow instruction
│   └── templates/
│       └── development-workflow/           # 标准任务模板
├── examples/
│   ├── example-task/                       # Small task 示例
│   └── medium-example-task/                # Medium task 示例
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

## 非目标

- 不是一个 web dashboard
- 不是一个 CI-first 自动化平台
- 不是一个多代理并发 orchestrator
- 不是“一句提示词自动完成所有开发”的 one-shot prompting 工具
