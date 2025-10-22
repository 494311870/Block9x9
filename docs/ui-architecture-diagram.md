# Block9x9 UI 架构图

## 组件层级结构

```
┌─────────────────────────────────────────────────────┐
│                     Canvas                          │
│                   (Root Node)                       │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  GameRoot    │  │ BoardContainer│  │CandidatePanel│
│              │  │               │  │              │
│ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────┐    │
│ │Controller│ │  │ │BoardView │ │  │ │Cand.0│    │
│ └──────────┘ │  │ │          │ │  │ ├──────┤    │
│              │  │ │┌────────┐│ │  │ │Cand.1│    │
│              │  │ ││Cells   ││ │  │ ├──────┤    │
│              │  │ │└────────┘│ │  │ │Cand.2│    │
│              │  │ └──────────┘ │  │ └──────┘    │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        └────────────────┬────────────────┐
                         │                │
                         ▼                ▼
                  ┌──────────────┐ ┌──────────────┐
                  │      UI      │ │GameOverDialog│
                  │              │ │              │
                  │ ┌──────────┐ │ │ ┌──────────┐│
                  │ │ScoreHUD  │ │ │ │FinalScore││
                  │ ├──────────┤ │ │ ├──────────┤│
                  │ │Buttons   │ │ │ │FinalMoves││
                  │ └──────────┘ │ │ └──────────┘│
                  └──────────────┘ └──────────────┘
```

## 组件交互流程

```
┌──────────────┐
│     User     │
│   (玩家)      │
└──────┬───────┘
       │ 1. 点击候选块
       │
       ▼
┌──────────────┐
│CandidateView │
│  (选中状态)   │
└──────┬───────┘
       │ 2. 触发选中事件
       │
       ▼
┌──────────────────────────┐
│    GameController        │
│  - 记录选中的候选块       │
│  - 更新视觉反馈           │
└──────┬───────────────────┘
       │ 3. 用户点击棋盘
       │
       ▼
┌──────────────┐
│  BoardView   │
│  (获取坐标)   │
└──────┬───────┘
       │ 4. 转换为格子位置
       │
       ▼
┌──────────────────────────┐
│    GameController        │
│  - 调用 GameSession      │
│  - placeCandidate()      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│     GameSession          │
│  - 验证放置合法性         │
│  - 更新棋盘              │
│  - 检测消除              │
│  - 计算分数              │
│  - 检测游戏结束           │
└──────┬───────────────────┘
       │ 5. 返回结果
       │
       ▼
┌──────────────────────────┐
│    GameController        │
│  - 更新 BoardView        │
│  - 更新 CandidateView    │
│  - 更新 ScoreHUD         │
│  - 显示 GameOverDialog?  │
└──────────────────────────┘
```

## 数据流向

```
Core Logic Layer (纯 TypeScript，不依赖引擎)
┌─────────────────────────────────────────────┐
│  GameSession                                │
│    ├── Board (9x9 棋盘状态)                 │
│    ├── CandidateQueue (候选块队列)           │
│    │    └── BlockGenerator (方块生成器)      │
│    └── PlacementManager (放置与消除逻辑)     │
└─────────────────┬───────────────────────────┘
                  │
                  │ 数据绑定
                  │
                  ▼
UI Layer (Cocos Creator 组件)
┌─────────────────────────────────────────────┐
│  GameController (协调层)                     │
│    ├── BoardView ──────► Board.getState()   │
│    ├── CandidateView ──► Queue.getCandidates│
│    ├── ScoreHUD ───────► Session.getScore() │
│    └── GameOverDialog ─► Session.isGameOver │
└─────────────────────────────────────────────┘
                  ▲
                  │
                  │ 用户输入
                  │
         ┌────────┴────────┐
         │   Touch Events  │
         │  - 点击候选块    │
         │  - 点击棋盘      │
         │  - 点击按钮      │
         └─────────────────┘
```

## 事件处理流程

```
1. 游戏初始化
   GameController.onLoad()
      └─> new GameSession()
      └─> 绑定各组件引用
      └─> 注册事件监听器

2. 开始游戏
   StartButton.onClick()
      └─> GameSession.start()
      └─> GameController.updateUI()
           ├─> BoardView.updateView()
           ├─> CandidateView.setBlock()
           └─> ScoreHUD.setScore()

3. 选择候选块
   CandidateView.onTouch()
      └─> GameController.onCandidateClicked()
           └─> selectedIndex = index
           └─> CandidateView.setSelected(true)

4. 放置方块
   BoardView.onTouch()
      └─> GameController.onBoardClicked()
           ├─> getGridPosition()
           ├─> GameSession.placeCandidate()
           ├─> if success:
           │    ├─> updateUI()
           │    └─> if gameOver:
           │         └─> showGameOverDialog()
           └─> if fail:
                └─> console.log(reason)

5. 重新开始
   RestartButton.onClick()
      └─> GameController.onRestartGame()
           ├─> GameSession.start()
           ├─> GameOverDialog.hide()
           └─> updateUI()
```

## 文件依赖关系

```
GameController.ts
    ├─> 导入 core/GameSession
    ├─> 导入 core/Block
    ├─> 导入 components/BoardView
    ├─> 导入 components/CandidateView
    ├─> 导入 components/ScoreHUD
    └─> 导入 components/GameOverDialog

BoardView.ts
    └─> 导入 core/Board

CandidateView.ts
    └─> 导入 core/Block

ScoreHUD.ts
    └─> (独立组件，无依赖)

GameOverDialog.ts
    └─> (独立组件，无依赖)

Core Logic (无循环依赖)
GameSession
    ├─> Board
    ├─> BlockGenerator
    ├─> CandidateQueue
    │    └─> BlockGenerator
    │    └─> Block
    ├─> PlacementManager
    │    └─> Board
    │    └─> Block
    └─> Block
```

## 状态机

```
GameSession 状态转换:

    ┌─────────┐
    │  READY  │ (初始状态)
    └────┬────┘
         │
         │ start()
         ▼
    ┌─────────┐
    │ PLAYING │ (游戏进行中)
    └────┬────┘
         │
         │ placeCandidate()
         │ + 所有候选块无法放置
         ▼
    ┌──────────┐
    │GAME_OVER │ (游戏结束)
    └────┬─────┘
         │
         │ start() / reset()
         │
         └──────────────────┐
                            │
                            ▼
                       ┌─────────┐
                       │  READY  │
                       └─────────┘
```

## 布局示意图

```
┌────────────────────────────────────────┐
│ ScoreHUD          [Start] [Restart]    │ ← 顶部 UI
├────────────────────────────────────────┤
│                                        │
│          ┌─────────────────┐           │
│          │                 │           │
│          │   BoardView     │           │ ← 中间棋盘
│          │   (9x9 grid)    │           │
│          │                 │           │
│          └─────────────────┘           │
│                                        │
├────────────────────────────────────────┤
│   [Cand.0]  [Cand.1]  [Cand.2]        │ ← 底部候选区
└────────────────────────────────────────┘

当游戏结束时，显示对话框:
┌────────────────────────────────────────┐
│                                        │
│     ┌──────────────────────┐           │
│     │   游戏结束！         │           │
│     │   最终分数: 250     │           │
│     │   移动次数: 35      │           │
│     │   [重新开始]        │           │
│     └──────────────────────┘           │
│                                        │
└────────────────────────────────────────┘
```

## 坐标系统

### BoardView 坐标转换

```
屏幕坐标 (Touch Event)
        │
        ▼
世界坐标 (World Position)
        │ getGridPositionFromWorld()
        ▼
格子索引 (row, col)
        │ 0 ≤ row < 9
        │ 0 ≤ col < 9
        ▼
Block.getAbsolutePositions(row, col)
        │
        ▼
实际占用的格子位置数组
```

### CandidateView 坐标

```
Block 相对坐标 (Block.shape)
        │ {row: 0, col: 0} 为锚点
        │ 其他格子相对于锚点
        ▼
显示坐标 (CandidateView)
        │ 自动居中
        │ 考虑 cellSize 和 cellGap
        ▼
最终渲染位置
```
