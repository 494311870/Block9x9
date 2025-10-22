# Block9x9 UI 设置指南

本指南说明如何在 Cocos Creator 3.8.7 中设置游戏主界面。

## 前提条件

- 已安装 Cocos Creator 3.8.7
- 已克隆本项目

## 设置步骤

### 1. 在 Cocos Creator 中打开项目

1. 启动 Cocos Creator 3.8.7
2. 点击 "打开其他项目"
3. 选择本项目的根目录（包含 `assets` 文件夹的目录）
4. 等待项目加载和资源导入完成

### 2. 创建主场景

1. 在 Cocos Creator 的 "资源管理器" 中，右键点击 `assets/scenes` 文件夹
2. 选择 "新建 -> Scene"
3. 将场景命名为 `MainGame`

### 3. 设置场景节点结构

在 "层级管理器" 中创建以下节点结构：

```
Canvas (2D)
├── GameRoot (Empty Node)
│   └── GameController (挂载 GameController 组件)
│
├── BoardContainer (Empty Node)
│   └── BoardView (Empty Node, 挂载 BoardView 组件)
│       └── CellContainer (Empty Node)
│
├── CandidatePanel (Empty Node)
│   ├── Candidate0 (Empty Node, 挂载 CandidateView 组件)
│   │   └── CellContainer (Empty Node)
│   ├── Candidate1 (Empty Node, 挂载 CandidateView 组件)
│   │   └── CellContainer (Empty Node)
│   └── Candidate2 (Empty Node, 挂载 CandidateView 组件)
│       └── CellContainer (Empty Node)
│
├── UI (Empty Node)
│   ├── ScoreHUD (Empty Node, 挂载 ScoreHUD 组件)
│   │   ├── ScoreLabel (Label)
│   │   └── MoveLabel (Label)
│   │
│   └── ButtonPanel (Empty Node)
│       ├── StartButton (Button)
│       └── RestartButton (Button)
│
└── GameOverDialog (Empty Node, 挂载 GameOverDialog 组件)
    ├── Background (Sprite)
    ├── Title (Label - "游戏结束")
    ├── FinalScoreLabel (Label)
    ├── FinalMovesLabel (Label)
    └── CloseButton (Button)
```

### 4. 配置各个组件

#### GameController 组件配置

在 GameRoot/GameController 节点上：
1. 添加 `GameController` 组件
2. 在属性面板中设置：
   - `Board View`: 拖入 BoardView 节点
   - `Candidate Views`: 点击 "+" 添加 3 个元素，分别拖入 Candidate0、Candidate1、Candidate2
   - `Score HUD`: 拖入 ScoreHUD 节点
   - `Game Over Dialog`: 拖入 GameOverDialog 节点
   - `Start Button`: 拖入 StartButton 组件
   - `Restart Button`: 拖入 RestartButton 组件

#### BoardView 组件配置

在 BoardContainer/BoardView 节点上：
1. 添加 `BoardView` 组件
2. 在属性面板中设置：
   - `Cell Container`: 拖入 CellContainer 节点
   - `Cell Size`: 50 (默认)
   - `Cell Gap`: 2 (默认)
   - `Empty Cell Color`: RGB(240, 240, 240)
   - `Filled Cell Color`: RGB(100, 150, 255)

#### CandidateView 组件配置

对于每个候选块节点（Candidate0、Candidate1、Candidate2）：
1. 添加 `CandidateView` 组件
2. 在属性面板中设置：
   - `Cell Container`: 拖入对应的 CellContainer 子节点
   - `Cell Size`: 30 (默认)
   - `Cell Gap`: 2 (默认)
   - `Block Color`: RGB(100, 150, 255)
   - `Candidate Index`: 分别设置为 0、1、2

#### ScoreHUD 组件配置

在 UI/ScoreHUD 节点上：
1. 添加 `ScoreHUD` 组件
2. 在属性面板中设置：
   - `Score Label`: 拖入 ScoreLabel 节点
   - `Move Label`: 拖入 MoveLabel 节点

3. 配置 ScoreLabel：
   - 设置文本为 "分数: 0"
   - 字体大小：24
   - 颜色：黑色

4. 配置 MoveLabel：
   - 设置文本为 "步数: 0"
   - 字体大小：24
   - 颜色：黑色

#### GameOverDialog 组件配置

在 GameOverDialog 节点上：
1. 添加 `GameOverDialog` 组件
2. 在属性面板中设置：
   - `Final Score Label`: 拖入 FinalScoreLabel 节点
   - `Final Moves Label`: 拖入 FinalMovesLabel 节点

3. 配置 Background：
   - 添加 Sprite 组件
   - 设置颜色为半透明黑色 RGBA(0, 0, 0, 180)
   - 调整大小覆盖整个屏幕

4. 配置标签和按钮样式（根据需要）

### 5. 布局调整

#### Canvas 设置
- Design Resolution: 1280x720
- Fit Height: true
- Fit Width: true

#### BoardContainer 位置
- Position: (0, 100, 0) - 居中偏上

#### CandidatePanel 位置
- Position: (0, -250, 0) - 底部
- 三个候选块横向排列，间距约 120

#### UI/ScoreHUD 位置
- Position: (-500, 320, 0) - 左上角

#### UI/ButtonPanel 位置
- Position: (500, 320, 0) - 右上角

#### GameOverDialog 位置
- Position: (0, 0, 0) - 居中
- Scale: (1, 1, 1)

### 6. 运行和测试

1. 保存场景
2. 点击编辑器顶部的 "运行" 按钮（或按 Ctrl+P）
3. 测试游戏功能：
   - 点击 "开始游戏" 按钮
   - 点击候选块选中
   - 点击棋盘格子放置方块
   - 验证分数更新
   - 验证消除行/列功能
   - 验证游戏结束提示

## 常见问题

### Q: 组件无法添加到节点
A: 确保已经保存所有 TypeScript 文件，并等待 Cocos Creator 编译完成。

### Q: 点击没有反应
A: 检查以下几点：
- GameController 的所有引用是否正确设置
- Button 组件是否添加了 UITransform 组件
- Canvas 节点是否有 Canvas 组件

### Q: 格子显示不正确
A: 检查：
- BoardView 的 Cell Container 引用是否正确
- Cell Size 和 Cell Gap 设置是否合理

## 下一步

完成基础 UI 设置后，可以：
1. 美化 UI 样式（添加精美的背景、按钮样式等）
2. 添加动画效果
3. 实现拖拽功能
4. 添加音效
5. 添加更多游戏功能（撤销、提示等）

更多信息请参考：
- `assets/scripts/components/README.md` - UI 组件详细文档
- `assets/scripts/core/README.md` - 核心逻辑文档
