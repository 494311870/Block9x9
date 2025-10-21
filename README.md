# Block9x9

简短说明：Block9x9 是基于 Cocos Creator 3.8.7 的 TypeScript 游戏项目，实现了经典的 9x9 木块拼图游戏。

## 快速开始

### 游戏开发

1. 安装并打开 Cocos Creator 3.8.7 编辑器。
2. 在编辑器中打开本项目目录。
3. 在 `assets/` 下添加场景（`assets/scenes/`）、脚本（`assets/scripts/`）和资源（`assets/resources/`）。
4. 使用编辑器的构建面板生成构建输出。

### 核心逻辑开发与测试

项目包含了核心游戏逻辑的 TypeScript 实现和单元测试：

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage

# 运行示例代码
npm run example              # Board 使用示例
npm run example:block        # Block 使用示例  
npm run example:placement    # PlacementManager 使用示例
npm run example:game         # GameSession 与 CandidateQueue 使用示例
npm run example:ui           # UI 组件使用示例
```

### 已实现功能

- **Board 类**：9x9 棋盘数据结构
  - 初始化和重置棋盘
  - 放置/移除方块
  - 检测满行/满列
  - 获取棋盘状态
  - 详细 API 文档见：[assets/scripts/core/README.md](assets/scripts/core/README.md)

- **Block 类**：木块模型与形状定义
  - 支持多种预定义形状（单格、直线、L形、方块、T形等）
  - 方块旋转、克隆、序列化
  - 详细 API 文档见：[assets/scripts/core/Block.README.md](assets/scripts/core/Block.README.md)

- **BlockGenerator 类**：随机方块生成器
  - 支持随机生成和种子控制
  - 详细 API 文档见：[assets/scripts/core/BlockGenerator.README.md](assets/scripts/core/BlockGenerator.README.md)

- **PlacementManager 类**：放置判定与消除逻辑
  - 放置合法性校验
  - 自动检测并消除满行/满列
  - 得分计算（基础分 + 连消奖励）
  - 详细 API 文档见：[assets/scripts/core/PlacementManager.README.md](assets/scripts/core/PlacementManager.README.md)

- **CandidateQueue 类**：候选块队列管理
  - 固定容量的候选块槽位（默认 3 个）
  - 自动/手动补充候选块
  - 选择并取出候选块
  - 队列状态查询与重置
  - 详细 API 文档见：[assets/scripts/core/CandidateQueue.README.md](assets/scripts/core/CandidateQueue.README.md)

- **GameSession 类**：完整游戏会话管理
  - 整合棋盘、候选队列、生成器和放置管理器
  - 游戏状态管理（READY/PLAYING/GAME_OVER）
  - 自动游戏结束检测
  - 分数统计与步数记录
  - 支持可重现的游戏（种子）
  - 详细 API 文档见：[assets/scripts/core/GameSession.README.md](assets/scripts/core/GameSession.README.md)

- **UI 组件**：Cocos Creator 游戏界面组件
  - **BoardView**：9x9 棋盘可视化组件
  - **CandidateView**：候选块显示组件
  - **ScoreHUD**：分数和步数显示组件
  - **GameOverDialog**：游戏结束对话框
  - **GameController**：游戏主控制器，整合所有 UI 和逻辑
  - 详细文档见：[assets/scripts/components/README.md](assets/scripts/components/README.md)
  - 设置指南见：[docs/ui-setup-guide.md](docs/ui-setup-guide.md)

项目约定：

- 所有游戏脚本放在 `assets/scripts/`（使用 Cocos Creator 的组件和装饰器）。
- 核心逻辑类（不依赖 Cocos Creator API）也放在 `assets/scripts/core/`。
- 单元测试放在 `tests/` 目录，镜像 `assets/scripts/` 的结构。
- 不要在 `library/`, `temp/`, `profiles/`, `settings/` 中直接编辑文件（这些是编辑器生成的缓存/配置）。

## 测试

项目使用 Jest 进行单元测试：

- 测试文件：`tests/**/*.test.ts`
- 运行所有测试：`npm test`
- 当前测试覆盖：209 个测试，全部通过 ✓

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
