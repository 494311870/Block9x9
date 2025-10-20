# 提交规范（Commit Guidelines）

本文件对 `.github/copilot-instructions.md` 中的提交规范作更详细说明，示例和自动化建议。

1. 格式：

   <type>(<scope>): <短语（中文）>

   例如：

   feat(scripts): 添加 TileSpawner 组件以生成方格

2. type（必须，英文）：

   - feat: 新功能
   - fix: 修复 bug
   - docs: 文档变更
   - style: 格式或风格修改（不影响功能）
   - refactor: 重构（既不是 bug 修复也不是新功能）
   - perf: 性能优化
   - test: 添加或修改测试
   - chore: 杂项（例如更新生成的文件）
   - build: 构建相关
   - ci: CI 配置相关
   - revert: 回退提交

3. scope（可选）：

   - 请优先使用目录名或模块名，如 `assets`, `scripts`, `scenes`, `ui`, `build`。

4. short summary：

   - 请使用中文描述，长度不超过 72 个字符，首字母小写，末尾不加句号。

5. 主体（可选）：

   - 空行后写更详细的变更说明，说明为什么要改、变更要点、注意事项等。

6. 页脚（可选）：

   - 用于引用 issue 或 BREAKING CHANGE。
   - BREAKING CHANGE 只在资源或 API 格式不兼容时使用（例如删除/重命名 scene/prefab 的 UUID），并在页脚中写明迁移步骤。
   - 示例： `Fixes Issue-123`，`See Issue-45`。

7. 项目特定规则：

   - 对仅修改 `library/`, `temp/`, `profiles/`, `settings/` 的自动生成文件请使用 `chore`，并在摘要中带上 `generated` 或 `editor`：

     chore(library): update generated asset metadata

   - 合并大型功能时，鼓励在 PR 合并前将多次开发提交 squash 为一个 `feat(scope): ...` 提交，以便自动化 CHANGELOG。

8. 自动化建议：

   - 建议使用 `husky` 强制提交信息格式的本地钩子。若需要我可以添加示例配置（`package.json`、`.husky/commit-msg`）。
