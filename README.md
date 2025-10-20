# Block9x9

简短说明：Block9x9 是基于 Cocos Creator 3.8.7 的 TypeScript 游戏项目骨架（当前为空项目）。

快速开始：

1. 安装并打开 Cocos Creator 3.8.7 编辑器。
2. 在编辑器中打开本项目目录 (`e:/Game/AIGame/Block9x9`)。
3. 在 `assets/` 下添加场景（`assets/scenes/`）、脚本（`assets/scripts/`）和资源（`assets/resources/`）。
4. 使用编辑器的构建面板生成构建输出。

项目约定：

- 所有游戏脚本放在 `assets/`（使用 Cocos Creator 的组件和装饰器）。
- 不要在 `library/`, `temp/`, `profiles/`, `settings/` 中直接编辑文件（这些是编辑器生成的缓存/配置）。

贡献与提交规范：

- 本项目遵循简化的 Conventional Commits 规范：`<type>(<scope>): <summary>`。
- type 保持英文（例如 `feat`, `fix`, `docs`, `chore`），但提交内容请使用中文。
- 详细规范见 `docs/commit-guidelines.md`。

## 批量创建 Issues

本项目提供了从 `docs/issues-list.md` 批量创建 GitHub issues 的自动化工具。

### 使用方法

1. 进入 GitHub 仓库的 **Actions** 标签页
2. 选择 **"Create Issues from Markdown"** workflow
3. 点击 **"Run workflow"**
4. 可选择 "Dry run" 模式先预览（不实际创建）
5. 运行成功后，所有 issues 将按顺序创建

详细说明请参考：[docs/create-issues-guide.md](docs/create-issues-guide.md)
如需我为仓库添加 husky 钩子示例配置，请回复确认，我可以添加示例配置文件。
