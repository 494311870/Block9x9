# Block9x9 快速开始指南

本指南帮助开发者快速上手 Block9x9 游戏项目。

## 前提条件

- Node.js (v16 或更高)
- Cocos Creator 3.8.7
- Git

## 1. 克隆项目

```bash
git clone https://github.com/494311870/Block9x9.git
cd Block9x9
```

## 2. 安装依赖

```bash
npm install
```

## 3. 运行测试

```bash
# 运行所有单元测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 4. 运行示例

```bash
# 核心逻辑示例
npm run example              # Board 使用示例
npm run example:block        # Block 使用示例
npm run example:placement    # PlacementManager 使用示例
npm run example:game         # GameSession 使用示例

# UI 组件示例
npm run example:ui           # UI 组件使用示例
```

## 5. 在 Cocos Creator 中运行

### 5.1 打开项目

1. 启动 Cocos Creator 3.8.7
2. 点击 "打开其他项目"
3. 选择项目根目录
4. 等待资源导入完成

### 5.2 创建游戏场景

由于场景文件较大且是二进制格式，需要在编辑器中手动创建。

**方法 1: 按照设置指南手动创建**

参考 `docs/ui-setup-guide.md` 详细步骤，手动创建场景和配置组件。

**方法 2: 最小化快速测试**

如果只想快速测试功能，可以创建简化版场景：

1. 在 `assets/scenes/` 创建新场景 `MainGame`
2. 在场景中添加以下节点：
   ```
   Canvas
   └── GameController (空节点 + GameController 组件)
   ```
3. 在 GameController 组件的 `onLoad` 方法中添加测试代码
4. 点击运行

### 5.3 完整场景设置

完整的场景设置需要以下步骤：

1. **创建节点层级** - 按照 `docs/ui-setup-guide.md` 的结构
2. **添加组件** - 为各节点添加相应组件
3. **配置引用** - 在 GameController 中设置所有子组件引用
4. **调整布局** - 设置节点位置和大小
5. **测试运行** - 点击运行按钮测试

详细步骤见：`docs/ui-setup-guide.md`

## 6. 项目结构

```
Block9x9/
├── assets/                    # Cocos Creator 资源
│   ├── scenes/               # 场景文件（需手动创建）
│   └── scripts/              # 游戏脚本
│       ├── core/             # 核心逻辑（纯 TS）
│       │   ├── Board.ts
│       │   ├── Block.ts
│       │   ├── BlockGenerator.ts
│       │   ├── CandidateQueue.ts
│       │   ├── GameSession.ts
│       │   └── PlacementManager.ts
│       └── components/       # UI 组件（Cocos Creator）
│           ├── BoardView.ts
│           ├── CandidateView.ts
│           ├── GameController.ts
│           ├── GameOverDialog.ts
│           └── ScoreHUD.ts
├── tests/                     # 单元测试
│   └── core/                 # 核心逻辑测试
├── examples/                  # 使用示例
│   ├── board-usage.ts
│   ├── block-usage.ts
│   ├── game-session-usage.ts
│   ├── placement-manager-usage.ts
│   └── ui-components-usage.ts
├── docs/                      # 文档
│   ├── ui-setup-guide.md     # UI 设置指南
│   ├── ui-implementation-summary.md
│   └── ui-architecture-diagram.md
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 7. 开发工作流

### 7.1 开发核心逻辑

核心逻辑位于 `assets/scripts/core/`，不依赖 Cocos Creator。

```bash
# 1. 编写代码
# 2. 编写测试（tests/core/）
# 3. 运行测试
npm test

# 4. 查看示例
npm run example:game
```

### 7.2 开发 UI 组件

UI 组件位于 `assets/scripts/components/`，使用 Cocos Creator API。

```bash
# 1. 编写组件代码
# 2. 在 Cocos Creator 中测试
# 3. （可选）编写使用示例
```

### 7.3 提交代码

项目使用 Conventional Commits 规范：

```bash
# 格式：<type>(<scope>): <subject>
git commit -m "feat(ui): 添加拖拽功能"
git commit -m "fix(board): 修复边界检查问题"
git commit -m "docs(readme): 更新安装说明"
```

类型（type）包括：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `test`: 测试相关
- `chore`: 构建/工具相关

## 8. 常见任务

### 添加新的方块类型

1. 在 `Block.ts` 的 `BlockType` 枚举中添加新类型
2. 在 `createBlock()` 方法中定义形状
3. 在 `BlockGenerator.ts` 中添加到生成池
4. 编写测试

### 修改计分规则

1. 编辑 `PlacementManager.ts` 的 `calculateScore()` 方法
2. 或者在 GameSession 创建时传入自定义 `scoreConfig`
3. 更新测试

### 添加新的 UI 组件

1. 在 `assets/scripts/components/` 创建新组件
2. 使用 `@ccclass` 和 `@property` 装饰器
3. 在 GameController 中集成
4. 更新 `components/index.ts`

### 调试技巧

1. **核心逻辑调试**
   - 使用 `console.log()`
   - 运行单元测试
   - 使用 VS Code 调试器

2. **UI 调试**
   - Cocos Creator 控制台
   - Chrome DevTools（浏览器预览时）
   - 场景编辑器

## 9. 文档资源

### 项目文档
- `README.md` - 项目概览
- `docs/ui-setup-guide.md` - UI 设置详细步骤
- `docs/ui-implementation-summary.md` - UI 实现总结
- `docs/ui-architecture-diagram.md` - 架构图和数据流
- `assets/scripts/components/README.md` - UI 组件 API
- `assets/scripts/core/README.md` - 核心逻辑 API

### 外部文档
- [Cocos Creator 3.8 文档](https://docs.cocos.com/creator/3.8/manual/zh/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Jest 测试框架](https://jestjs.io/docs/getting-started)

## 10. 故障排除

### 问题：npm test 失败

**解决方案：**
```bash
# 删除 node_modules 和锁文件
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 再次运行测试
npm test
```

### 问题：Cocos Creator 无法识别组件

**解决方案：**
1. 检查 `.ts` 文件是否有对应的 `.meta` 文件
2. 等待编辑器编译完成（查看右下角进度）
3. 刷新资源（右键资源管理器 -> 刷新）
4. 重启 Cocos Creator

### 问题：TypeScript 编译错误

**解决方案：**
- 检查 `tsconfig.json` 配置
- 确保安装了 `@types` 包
- Cocos Creator 的 `cc` 模块在编辑器中可用，命令行编译时的错误可忽略

### 问题：场景运行时报错

**解决方案：**
1. 检查 GameController 的所有引用是否已设置
2. 检查节点名称是否正确
3. 查看控制台的详细错误信息
4. 确保场景中有 Canvas 组件

## 11. 下一步

完成快速开始后，可以：

1. 🎮 **体验游戏** - 在 Cocos Creator 中运行场景
2. 📚 **深入学习** - 阅读各模块的 README
3. 🔧 **添加功能** - 参考 `docs/issues-list.md` 的待开发功能
4. 🎨 **美化 UI** - 添加图片、动画、音效
5. 🚀 **优化性能** - 分析和改进渲染性能

## 12. 获取帮助

- 📖 查看项目文档
- 🐛 提交 GitHub Issue
- 💬 查看代码注释
- 🔍 运行示例代码

祝开发愉快！🎉
