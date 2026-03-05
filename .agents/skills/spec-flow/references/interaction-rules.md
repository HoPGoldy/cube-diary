# 交互规则

## 确认模板

每个阶段完成后，必须使用此格式请求确认：

```
📋 **[Phase Name] Complete**

Created `.spec-flow/active/<feature>/<file>.md` containing:
- [Key content summary]

**Please review**:
1. [Review question]?
2. [Review question]?

✅ Say "continue" to proceed to next phase
✏️ Tell me what to modify if needed
```

## 用户确认信号

以下表达视为确认：
- "continue", "ok", "next", "looks good", "lgtm"
- "继续", "好", "下一步", "没问题", "可以"

## ❌ 禁止行为

| 禁止 | 原因 |
|------|------|
| 一次生成多个阶段的文档 | 用户无法逐步审查 |
| 未经确认自动进入下一阶段 | 违反 phase-by-phase 原则 |
| 同一个回复中创建 proposal + requirements | 跳过了确认节点 |
| 假设用户想跳过确认 | 必须用户明确请求 fast mode |

## ✅ 正确流程

```
User: I want to implement user authentication
AI: [Creates only proposal.md] + confirmation prompt

User: continue
AI: [Creates only requirements.md] + confirmation prompt

User: looks good, next
AI: [Creates only design.md] + confirmation prompt

User: continue
AI: [Creates only tasks.md] + confirmation prompt
```

## Fast Mode

仅当用户明确请求时启用（`--fast` 或说 "generate all at once"）：
- 一次性生成所有文档
- 最后整体确认
