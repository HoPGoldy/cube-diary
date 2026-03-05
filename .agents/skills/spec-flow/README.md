# Spec-Flow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Spec-driven development workflow for AI coding agents**

Spec-Flow transforms complex feature development into a guided, phase-by-phase workflow with living documentation. Works with any AI agent that supports the Skills format.

## Features

- **Phase-by-Phase Workflow**: Proposal → Requirements → Design → Tasks → Implementation
- **Interactive Confirmation**: Each phase waits for your approval before proceeding
- **Living Documentation**: Creates `.spec-flow/` directory with Markdown docs that guide implementation
- **EARS Requirements**: Industry-standard Easy Approach to Requirements Syntax
- **3 Execution Modes**: Step (default), Batch, Phase — choose your speed
- **Team Collaboration**: Git-friendly, commit specs with your project

## Installation

```bash
# Claude Code
cd ~/.claude/skills && git clone https://github.com/echoVic/spec-flow.git

# OpenClaw
cd ~/.openclaw/workspace/skills && git clone https://github.com/echoVic/spec-flow.git

# Blade
cd ~/.blade/skills && git clone https://github.com/echoVic/spec-flow.git

# Or any agent's skills directory
```

## Quick Start

Trigger with: `spec-flow`, `spec mode`, `need a plan`, `structured development`, `写个方案`, `做个规划`

```
User: spec-flow — add user authentication

AI: [Creates proposal.md] → waits for confirmation
User: continue
AI: [Creates requirements.md] → waits for confirmation
User: continue
AI: [Creates design.md] → waits for confirmation
User: continue
AI: [Creates tasks.md] → waits for confirmation
User: execute all tasks
AI: [Implements everything]
```

Parameters: `--fast` (skip confirmations), `--skip-design` (simple features)

## Five-Phase Workflow

```
┌──────────┐    ┌──────────────┐    ┌────────┐    ┌───────┐    ┌────────────────┐
│ Proposal │ → │ Requirements │ → │ Design │ → │ Tasks │ → │ Implementation │
└──────────┘    └──────────────┘    └────────┘    └───────┘    └────────────────┘
    WHY              WHAT              HOW        EXECUTE         BUILD
```

| Phase | Goal | Output |
|-------|------|--------|
| Proposal | Define WHY | Background, goals, non-goals, risks |
| Requirements | Define WHAT | FR/NFR in EARS format, acceptance criteria |
| Design | Define HOW | Architecture, API, data model (Mermaid) |
| Tasks | Break down | Granular tasks with dependencies |
| Implementation | Build | Code, tests, documentation |

## Execution Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Step** (default) | "start implementation" | One task → confirm → next |
| **Batch** | "execute all" / "全部执行" | All tasks consecutively |
| **Phase** | "execute setup phase" | All tasks in one phase → confirm |

## Directory Structure

```
.spec-flow/
├── steering/           # Optional: global project context
│   ├── constitution.md
│   ├── product.md
│   ├── tech.md
│   └── structure.md
├── active/             # Work in progress
│   └── <feature>/
│       ├── proposal.md
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── archive/            # Completed features
```

## File Structure

```
spec-flow/
├── SKILL.md                              # Checklist workflow
├── references/
│   ├── ears-format.md                    # EARS requirement syntax
│   ├── task-decomposition.md             # Task breakdown patterns
│   ├── workflow.md                       # Detailed workflow guide
│   ├── interaction-rules.md              # Confirmation rules
│   ├── execution-modes.md               # Step/Batch/Phase modes
│   └── examples/
├── templates/                            # Document templates
│   ├── proposal.md.template
│   ├── requirements.md.template
│   ├── design.md.template
│   ├── tasks.md.template
│   └── steering/
└── scripts/
    ├── init-spec-flow.sh                 # Initialize spec directory
    ├── validate-spec-flow.py             # Validate completeness
    └── execute-task.sh                   # Execute a task
```

## Language

- Workflow instructions: English
- Generated documents: Chinese (中文) by default

## License

MIT
