# Contributing to Spec-Flow

Thank you for your interest in contributing to Spec-Flow! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue with details
- **Feature Requests**: Have an idea? Share it in the issues
- **Documentation**: Improve README, examples, or references
- **Code**: Fix bugs, add features, improve templates
- **Templates**: Create new templates or improve existing ones
- **Examples**: Add real-world usage examples

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/spec-flow.git
cd spec-flow
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

- Follow the existing code style
- Update documentation if needed
- Test your changes with Claude Code
- Add examples if introducing new features

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add support for custom templates"
# or
git commit -m "fix: resolve task dependency checking"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Test your changes with Claude Code
- [ ] Update relevant documentation
- [ ] Add examples if needed
- [ ] Ensure templates follow existing format
- [ ] Check for typos and grammar

### PR Description Should Include

- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How did you test it?

### Example PR Description

```markdown
## What
Adds support for custom template directories

## Why
Users want to use their own templates instead of the defaults

## How
- Added `SPEC_FLOW_TEMPLATES` environment variable
- Modified template loading logic in SKILL.md
- Updated documentation

## Testing
- Tested with custom template directory
- Verified fallback to default templates
- Checked with both Claude Code and Blade
```

## 🎯 Development Guidelines

### Templates

- Use `.template` extension
- Include clear comments in Chinese and English
- Follow Markdown best practices
- Use Mermaid for diagrams

### Scripts

- Add shebang (`#!/bin/bash` or `#!/usr/bin/env python3`)
- Make executable (`chmod +x`)
- Include usage instructions
- Handle errors gracefully

### Documentation

- Keep README.md up to date
- Update SKILL.md for workflow changes
- Add examples for new features
- Use clear, concise language

### References

- Cite sources for methodologies (e.g., EARS)
- Include real-world examples
- Explain "why" not just "how"

## 🧪 Testing

### Manual Testing

```bash
# Install in Claude Code
cp -r spec-flow ~/.claude/skills/

# Test the skill
# 1. Start Claude Code in a project
# 2. Say "spec-flow" to trigger
# 3. Go through all phases
# 4. Verify documents are created correctly
```

### Validation Script

```bash
# Test the validation script
python3 scripts/validate-spec-flow.py
```

## 📝 Code Style

### Markdown
- Use ATX-style headers (`#`, `##`, `###`)
- Add blank lines around headers and code blocks
- Use tables for structured data
- Use emojis sparingly, only for visual hierarchy

### Shell Scripts
- Use `shellcheck` if possible
- Quote variables
- Check for command existence
- Provide helpful error messages

### Python
- Follow PEP 8
- Use type hints
- Add docstrings
- Handle exceptions

## 🐛 Reporting Issues

### Bug Reports Should Include

- **Description**: Clear description of the bug
- **Steps to Reproduce**: How to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Claude Code version, OS, etc.

### Example Bug Report

```markdown
## Description
Tasks are not being marked as completed in tasks.md

## Steps to Reproduce
1. Start spec-flow workflow
2. Complete all phases
3. Execute tasks in batch mode
4. Check tasks.md

## Expected Behavior
Tasks should have `- [x]` checkmarks

## Actual Behavior
Tasks still show `- [ ]`

## Environment
- Claude Code: v1.2.3
- OS: macOS 14.0
- Skill version: v1.0.0
```

## 💬 Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Open an Issue
- **Feature Requests**: Open an Issue with [Feature Request] label
- **Security Issues**: Email (add your email here)

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

## 🙏 Thank You!

Every contribution, no matter how small, makes a difference. Thank you for helping make Spec-Flow better!

---

**Happy Contributing! 🎉**
