# AGENTS.md

## Git Commit

- Keep commit messages **short and concise**
- Use the format: `<type>: <brief description>`

## Release

When the user says **"发布一下"**, execute the following steps in order:

1. `git add` and `git commit` all staged changes
2. `pnpm release` (bumps version, updates CHANGELOG, creates git tag)
3. `git push --follow-tags origin master`

## Development Guide

- When developing a new module, please refer to the [How to Build a New Module](./docs/how-to-build-a-new-module.md) document.
