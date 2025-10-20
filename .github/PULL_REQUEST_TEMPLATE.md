## 变更类型（请选择）
- [ ] feat（新功能）
- [ ] fix（修复 bug）
- [ ] docs（文档）
- [ ] style（格式）
- [ ] refactor（重构）
- [ ] perf（性能）
- [ ] test（测试）
- [ ] chore（杂项）

## PR 标题（建议）
- 请使用简短的中文标题，首字母小写。例如：`添加 TileSpawner 以生成方格`。

## 关联 Issue
- Issue 链接或编号（例如：`Issue-123` 或 GitHub `#123`）。

## 变更说明
- 用中文简要说明本次变更的目的与关键点。

## 变更影响
- 是否有破坏性变更（BREAKING CHANGE）？若有，请描述迁移步骤。

## 测试步骤
- 列出复现/验证步骤，方便 reviewer 本地验证。

## 截图 / 演示
- 如有 UI 变更，请提供截图或短视频。

## 提交历史建议
- 请在 PR 合并前，将相关开发提交 squash 为一个或少数具有语义的提交（例如 `feat(scripts): 添加 TileSpawner`），以便 CHANGELOG 自动化。

## Reviewer
- 指定 1~2 名 reviewer（按模块所有者）。

---

（本模板与 `docs/pr-guidelines.md` 保持一致，PR 检查会在 CI 中运行 commitlint 来校验提交信息格式。）