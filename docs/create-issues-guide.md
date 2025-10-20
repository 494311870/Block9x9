# 批量创建 GitHub Issues

本文档说明如何从 `docs/issues-list.md` 批量创建 GitHub issues。

## 方法一：使用 GitHub Actions（推荐）

### 操作步骤

1. 进入仓库的 **Actions** 标签页
2. 在左侧找到 **"Create Issues from Markdown"** workflow
3. 点击右侧的 **"Run workflow"** 按钮
4. 选择分支（通常是 `main`）
5. 如果想先预览而不实际创建，勾选 **"Dry run"** 选项
6. 点击 **"Run workflow"** 开始执行

### Workflow 说明

- **文件位置**: `.github/workflows/create-issues.yml`
- **触发方式**: 手动触发 (workflow_dispatch)
- **权限要求**: issues: write, contents: read
- **执行内容**: 
  - 解析 `docs/issues-list.md` 中的所有 issue
  - 按顺序创建 GitHub issues
  - 自动添加适当的标签（enhancement、bug、test、chore、documentation）
  - 在 issue 正文中包含依赖关系引用

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
