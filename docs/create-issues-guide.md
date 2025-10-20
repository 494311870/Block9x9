# 批量创建 GitHub Issues

本文档说明如何从 `docs/issues-list.md` 批量创建 GitHub issues。

## 快速开始（推荐步骤）

如果你是第一次使用，建议按以下步骤操作：

1. **先预览（Dry Run）**
   - 进入仓库的 Actions 页面
   - 选择 "Create Issues from Markdown" workflow
   - 点击 "Run workflow"
   - ✅ **勾选 "Dry run" 选项**
   - 运行并查看日志，确认要创建的 issues 正确

2. **正式创建**
   - 再次运行 "Create Issues from Markdown" workflow
   - ❌ **不勾选 "Dry run" 选项**
   - 运行完成后，在仓库的 Issues 页面查看创建的 issues

3. **验证结果**
   - 检查是否所有 issues 都已创建（当前 issues-list.md 包含 11 个 issue）
   - 验证依赖关系是否正确（issue 中的 #N 引用）
   - 确认标签是否正确添加

## 方法一：使用 GitHub Actions（推荐）

这是最简单的方法，不需要在本地安装任何工具，完全在 GitHub 网页上操作。

### 操作步骤

1. 进入仓库的 **Actions** 标签页（在仓库页面顶部）
2. 在左侧工作流列表中找到 **"Create Issues from Markdown"** workflow
3. 点击右侧的 **"Run workflow"** 下拉按钮
4. 选择要运行的分支（通常选择 `main` 或 `master`）
5. **建议第一次运行时勾选 "Dry run" 选项**，这样会先预览要创建的 issues 而不实际创建
6. 点击绿色的 **"Run workflow"** 按钮开始执行

### 查看执行结果

- 点击运行的 workflow，可以看到执行日志
- 在日志中会显示每个 issue 的创建状态
- 如果是 dry run 模式，日志会显示预览信息
- 如果成功创建，日志会显示每个 issue 的编号和链接

### Workflow 说明

- **文件位置**: `.github/workflows/create-issues.yml`
- **触发方式**: 手动触发 (workflow_dispatch)
- **权限要求**: issues: write, contents: read（由 GitHub 自动提供）
- **执行内容**: 
  1. 检查并创建必需的标签（如果不存在）
  2. 解析 `docs/issues-list.md` 中的所有 issue
  3. 按顺序创建 GitHub issues
  4. 自动添加适当的标签（enhancement、bug、test、chore、documentation）
  5. 在 issue 正文中包含依赖关系引用

### 支持的 Issue 格式

issues-list.md 中的每个 issue 应遵循以下格式：

```markdown
## N. type(scope): 标题

描述：功能或任务的详细描述

验收准则：
- 验收条件 1
- 验收条件 2

依赖：1,2（或"无"）

估时：X 人日
```

支持的类型（type）：
- `feat`: 新功能（标签：enhancement）
- `fix`: 修复问题（标签：bug）
- `test`: 测试相关（标签：test）
- `chore`: 杂项任务（标签：chore）
- `docs`: 文档（标签：documentation）

## 方法二：本地运行脚本

如果你需要在本地测试或运行此脚本：

### 前置要求

1. 安装 Node.js (>=18)
2. 获取 GitHub Personal Access Token (需要 `repo` 权限)

### 操作步骤

```bash
# 1. 安装依赖
npm install @octokit/rest

# 2. 设置环境变量
export GITHUB_TOKEN="your_github_token_here"

# 3. 运行脚本
node .github/scripts/create-issues-from-md.js

# 或者先进行干运行（不实际创建）
DRY_RUN=true node .github/scripts/create-issues-from-md.js
```

## 脚本功能

### 解析规则

- 自动识别 issue 标题格式：`type(scope): 标题` 或 `type: 标题`
- 提取描述、验收准则、依赖关系和估时信息
- 将验收准则转换为 GitHub 的任务列表（checkbox）
- 自动处理依赖关系，生成 issue 引用链接

### 标签策略

根据 issue 类型自动添加标签：

| Type | GitHub Label |
|------|--------------|
| feat | enhancement  |
| fix  | bug          |
| test | test         |
| chore| chore        |
| docs | documentation|

### 创建顺序

脚本按照 issues-list.md 中的顺序依次创建 issues，确保依赖关系的 issue 编号正确。每次创建后会等待 500ms 以避免触发 GitHub API 速率限制。

## 注意事项

1. **幂等性**: 此脚本不检查重复，每次运行都会创建新的 issues。建议在空仓库或使用 dry run 模式先测试。

2. **依赖关系**: 依赖关系是通过 issue 编号引用的。如果手动创建过其他 issues，编号可能不匹配。

3. **标签要求**: 确保仓库中已存在相应的标签（enhancement、bug、test、chore、documentation），或在第一次运行时允许自动创建。

4. **速率限制**: GitHub API 有速率限制。脚本已内置延迟，但如果创建大量 issues 仍可能触发限制。

## 常见问题 FAQ

### Q: 为什么要先运行 Dry Run？

A: Dry Run 模式可以让你预览将要创建的 issues，而不实际创建它们。这样可以：
- 验证解析是否正确
- 检查标题、描述、依赖关系格式
- 避免创建重复或错误的 issues

### Q: 如果已经创建了一些 issues，再运行会怎样？

A: 脚本会创建新的 issues，不会检查重复。建议：
- 在空仓库或专门用于测试的仓库先运行
- 或者手动删除已创建的 test issues 后再运行
- 未来可以添加检查重复的功能

### Q: 可以修改 issues-list.md 后重新运行吗？

A: 可以，但请注意：
- 如果已经创建了 issues，再次运行会创建新的（不会更新已存在的）
- 建议只在清空所有 issues 后重新运行，或者手动更新已创建的 issues

### Q: 依赖关系的 issue 编号会自动对应吗？

A: 是的，脚本会按照 issues-list.md 中的顺序创建，因此编号会对应。**但前提是仓库中没有其他已存在的 issues**。

例如，在一个空仓库中：
- issues-list.md 中的第 1 个 issue 会成为 GitHub issue #1
- issues-list.md 中的第 2 个 issue 会成为 GitHub issue #2
- 依赖关系 "依赖：1,2" 会生成 "依赖 issue #1, #2"

**重要提示**：如果仓库中已有其他 issues（例如已有 5 个 issues），则编号会从 #6 开始，这样依赖关系的编号就会不一致。

**建议**：
- 在项目初期（还没有创建任何 issues 时）运行此脚本
- 或在专门的测试仓库中运行
- 如果已有 issues，建议手动创建或手动调整依赖关系

## 问题排查

### Workflow 执行失败

检查以下几点：
- 仓库的 Actions 权限是否启用
- Workflow 文件语法是否正确
- `docs/issues-list.md` 文件是否存在且格式正确

### 本地脚本执行失败

- 确认 GITHUB_TOKEN 环境变量已正确设置
- 确认 token 有足够的权限（repo scope）
- 检查网络连接和 GitHub API 访问

### 解析错误

如果某些 issue 未被正确解析：
- 检查 issues-list.md 的格式是否符合要求
- 确保使用正确的标题格式：`## N. type(scope): 标题`
- 确保各部分（描述、验收准则等）的标签正确

## 相关文件

- `.github/workflows/create-issues.yml` - GitHub Actions workflow
- `.github/scripts/create-issues-from-md.js` - 核心脚本
- `docs/issues-list.md` - Issue 列表源文件

## 贡献

如需改进此功能，请：
1. 修改脚本或 workflow 文件
2. 在 PR 中详细说明改动
3. 确保测试通过（可使用 dry run 模式测试）
