# Block9x9 UI 组件文档

## 概述

本目录包含 Block9x9 游戏的所有 UI 组件，使用 Cocos Creator 3.8.7 实现。

## 组件列表

### 1. GameController

主游戏控制器，整合所有 UI 组件和游戏逻辑。

**职责：**
- 管理游戏会话（GameSession）
- 协调各个 UI 组件的更新
- 处理用户输入（候选块选择、棋盘点击）
- 控制游戏流程（开始、重启、游戏结束）

**属性：**
- `boardView`: BoardView 组件引用
- `candidateViews`: CandidateView 组件数组（通常为 3 个）
- `scoreHUD`: ScoreHUD 组件引用
- `gameOverDialog`: GameOverDialog 组件引用
- `startButton`: 开始按钮
- `restartButton`: 重新开始按钮

### 2. BoardView

9x9 棋盘可视化组件。

**职责：**
- 渲染 9x9 棋盘格子
- 根据 Board 数据更新格子状态
- 提供坐标转换功能（世界坐标 ↔ 格子位置）
- 显示放置预览（可选）

**属性：**
- `cellContainer`: 格子容器节点
- `cellSize`: 格子大小（默认 50）
- `cellGap`: 格子间距（默认 2）
- `emptyCellColor`: 空格子颜色
- `filledCellColor`: 已填充格子颜色

**主要方法：**
- `setBoard(board: Board)`: 设置绑定的棋盘数据
- `updateView()`: 更新视图显示
- `getGridPositionFromWorld(x, y)`: 根据世界坐标获取格子位置

### 3. CandidateView

候选块显示组件。

**职责：**
- 显示单个候选块的形状
- 支持选中状态显示
- 支持可用/不可用状态显示

**属性：**
- `cellContainer`: 格子容器节点
- `cellSize`: 格子大小（默认 30）
- `cellGap`: 格子间距（默认 2）
- `blockColor`: 块颜色
- `candidateIndex`: 候选块索引（0-2）

**主要方法：**
- `setBlock(block: Block | null)`: 设置候选块数据
- `setSelected(selected: boolean)`: 设置选中状态
- `setEnabled(enabled: boolean)`: 设置可用状态

### 4. ScoreHUD

分数和步数显示组件。

**职责：**
- 显示当前分数
- 显示移动次数

**属性：**
- `scoreLabel`: 分数标签
- `moveLabel`: 步数标签

**主要方法：**
- `setScore(score: number)`: 设置分数
- `setMoves(moves: number)`: 设置移动次数
- `setScoreAndMoves(score, moves)`: 同时设置分数和步数
- `reset()`: 重置显示

### 5. GameOverDialog

游戏结束对话框组件。

**职责：**
- 显示游戏结束信息
- 显示最终分数和移动次数

**属性：**
- `finalScoreLabel`: 最终分数标签
- `finalMovesLabel`: 最终移动次数标签

**主要方法：**
- `show(score: number, moves: number)`: 显示对话框
- `hide()`: 隐藏对话框

## 使用指南

### 在 Cocos Creator 中设置场景

1. **创建主场景**
   - 在 `assets/scenes/` 目录创建新场景 `MainGame.scene`

2. **创建节点层级结构**
   ```
   Canvas
   ├── GameController (挂载 GameController 组件)
   ├── BoardView (挂载 BoardView 组件)
   │   └── CellContainer (Node)
   ├── CandidatePanel
   │   ├── Candidate0 (挂载 CandidateView 组件)
   │   │   └── CellContainer (Node)
   │   ├── Candidate1 (挂载 CandidateView 组件)
   │   │   └── CellContainer (Node)
   │   └── Candidate2 (挂载 CandidateView 组件)
   │       └── CellContainer (Node)
   ├── ScoreHUD (挂载 ScoreHUD 组件)
   │   ├── ScoreLabel (Label)
   │   └── MoveLabel (Label)
   ├── ButtonPanel
   │   ├── StartButton (Button)
   │   └── RestartButton (Button)
   └── GameOverDialog (挂载 GameOverDialog 组件)
       ├── Background
       ├── FinalScoreLabel (Label)
       ├── FinalMovesLabel (Label)
       └── RestartButton (Button)
   ```

3. **配置组件引用**
   - 在 GameController 组件中设置各个子组件的引用
   - 在 BoardView 中设置 cellContainer 引用
   - 在各 CandidateView 中设置 cellContainer 和 candidateIndex
   - 在 ScoreHUD 中设置 scoreLabel 和 moveLabel
   - 在 GameOverDialog 中设置标签引用

## 游戏流程

1. **游戏初始化**
   - GameController 创建 GameSession 实例
   - 所有 UI 组件初始化并等待开始

2. **点击开始按钮**
   - GameSession.start() 被调用
   - 棋盘重置，候选块生成
   - UI 更新显示初始状态

3. **游戏进行中**
   - 玩家点击候选块选中
   - 玩家点击棋盘放置方块
   - 自动检测消除行/列
   - 更新分数和候选块

4. **游戏结束**
   - 当所有候选块都无法放置时触发
   - 显示游戏结束对话框
   - 玩家可以点击重新开始

## 注意事项

1. 所有组件都使用 `@ccclass` 和 `@property` 装饰器，符合 Cocos Creator 规范
2. 组件间通过 GameController 进行协调，避免直接耦合
3. UI 组件只负责显示，游戏逻辑由 core 目录下的类处理
4. 事件处理在 GameController 中集中管理

## 待扩展功能

以下功能可在后续版本中添加：

- 拖拽放置（当前只支持点击）
- 放置预览（绿色可放/红色不可放）
- 动画效果（放置、消除、得分）
- 音效支持
- 更精美的 UI 样式
