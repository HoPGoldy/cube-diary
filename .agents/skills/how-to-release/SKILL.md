---
name: how-to-release
description: 当用户要求发布新版本、打 release、打 tag 或推 Docker 镜像时使用。
---

# How to Release

## 一、必要知识

- 发布物只有 Docker Hub 镜像，不发 npm。稳定 semver tag（如 `v3.3.1`）会推 `hopgoldy/cube-diary:<版本号>` 和 `latest`；预发布（如 `v3.3.1-rc.1`）只推版本号。`latest` 由 `docker/metadata-action` 的 `flavor.latest=auto` 判断。
- 发布通过 github actions 实现，本地只需要更新 git tag。
- 版本号只改**仓库根** `package.json` 的 `version`。`packages/*` 的版本不要动。

## 二、发布步骤

1. 确认在 `master`、与 `origin/master` 同步、工作区干净；确认上一 tag 之后的 commit 信息能推出正确的 bump。
2. 在仓库根执行：

   ```bash
   pnpm release
   ```

   指定版本：

   ```bash
   pnpm release --release-as X.Y.Z
   ```

3. 检查 `package.json` 的 `version`、`CHANGELOG.md` 新章节、最新 commit 与 tag（`git log -1`、`git tag --list 'v*'`）。不对就停，不要推。
4. 推送 commit 和 tag：

   ```bash
   git push
   git push origin vX.Y.Z
   ```

   `X.Y.Z` 换成第 3 步看到的版本号。
5. 打开 GitHub Actions 的 `release` workflow，确认镜像推送成功。稳定版应同时有 `hopgoldy/cube-diary:X.Y.Z` 和 `latest`。
