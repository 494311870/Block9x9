# PR 指南（Pull Request Guidelines）

此文档补充 `.github/PULL_REQUEST_TEMPLATE.md`，给出更详细的 PR 规范与合并前检查项。

1. PR 标题与描述
   - 标题：请使用中文，简洁说明变更点（例如 `修复资源加载崩溃`）。
   - 描述：说明原因、解决思路、影响范围、回退风险。

2. 关联 Issue
   - 如果相关，请在 PR 描述中引用 Issue（`Fixes #123` 或 `Fixes Issue-123`）。

3. 测试
   - 提供清晰的测试步骤，使 reviewer 能本地重现。
   - 如果修改了场景或资源，标明 Cocos Creator 版本（本项目使用 3.8.7）。

4. 提交历史（Squash）
   - 建议将多次开发提交在合并前 squash 为一个或少数历史明确的提交（例如 `feat(scope): 描述`），以便 CHANGELOG 自动化。

5. 代码审查关注点
   - 资源（`assets/`）改动是否包含对应 meta/uuid 变更？
   - 是否误改了 `library/`, `temp/`, `profiles/`, `settings/`（这些应为自动生成文件）？若改动确实需提交，请在描述中说明原因并标注 `chore`。

6. 安全与合规
   - 不要提交敏感配置或凭证（`.env`、私钥等）。

7. CI 与 自动化
   - PR 会触发 commitlint 检查，若不合规请根据提示修正提交历史或在本地使用 `git commit --amend` / `git rebase -i` 进行整理。

8. 合并策略
   - 建议使用 Squash merging 到主分支，或在合并时保留一个语义化的合并提交（由 reviewer 选择）。

---

如需我把 PR 模板扩展为多项检查（例如自动在 PR 中添加不合规说明），我可以添加 GitHub Action 来注释 PR 并列出不合规的 commit 信息。