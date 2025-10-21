# GameSession 游戏会话管理

## 概述

`GameSession` 类是 Block9x9 的核心游戏会话管理器，它整合了棋盘（Board）、候选块队列（CandidateQueue）、方块生成器（BlockGenerator）和放置管理器（PlacementManager），提供完整的游戏流程控制。

## 主要特性

- ✅ 完整的游戏状态管理（READY/PLAYING/GAME_OVER）
- ✅ 自动候选块补充与管理
- ✅ 放置合法性检查
- ✅ 自动游戏结束检测
- ✅ 分数统计与步数记录
- ✅ 游戏重置功能
- ✅ 支持可重现的游戏（种子）

## 快速开始

### 基本使用

```typescript
import { GameSession } from './GameSession';

// 1. 创建游戏会话
const session = new GameSession();

// 2. 开始游戏
session.start();

// 3. 放置候选块
const result = session.placeCandidate(
  0,    // 候选块索引（0-2）
  4,    // 目标行
  4     // 目标列
);

if (result.success) {
  console.log(`得分：+${result.score}`);
  console.log(`总分：${session.getTotalScore()}`);
}

// 4. 检查游戏状态
if (session.isGameOver()) {
  console.log('游戏结束！');
}
```

### 高级配置

```typescript
// 自定义配置
const session = new GameSession({
  queueCapacity: 5,    // 候选块队列容量
  seed: 12345          // 随机种子（可重现）
});
```

## API 文档

### 构造函数

```typescript
constructor(config?: GameSessionConfig)
```

**参数：**
- `config`: 可选配置
  - `queueCapacity`: 候选块队列容量（默认 3）
  - `seed`: 随机种子（用于可重现的游戏）

### 游戏控制

#### `start(): void`
开始游戏，将状态设置为 PLAYING。

#### `reset(): void`
重置游戏到初始状态：
- 清空棋盘
- 重置候选块队列
- 分数归零
- 步数归零
- 状态设为 READY

### 核心游戏操作

#### `placeCandidate(candidateIndex: number, row: number, col: number): PlaceCandidateResult`
放置候选块到棋盘。

**参数：**
- `candidateIndex`: 候选块在队列中的索引（0-2）
- `row`: 目标行坐标
- `col`: 目标列坐标

**返回：** PlaceCandidateResult 对象
```typescript
interface PlaceCandidateResult {
  success: boolean;           // 是否放置成功
  clearedRows: number[];      // 消除的行索引
  clearedColumns: number[];   // 消除的列索引
  score: number;              // 本次得分
  gameOver: boolean;          // 游戏是否结束
  reason?: string;            // 失败原因（如果失败）
}
```

**示例：**
```typescript
const result = session.placeCandidate(0, 4, 4);

if (result.success) {
  console.log(`成功！得分 ${result.score}`);
  
  if (result.clearedRows.length > 0) {
    console.log(`消除了 ${result.clearedRows.length} 行`);
  }
  
  if (result.gameOver) {
    console.log('游戏结束！');
  }
} else {
  console.log(`失败：${result.reason}`);
}
```

#### `canPlaceCandidate(candidateIndex: number, row: number, col: number): boolean`
检查候选块是否可以在指定位置放置（不实际放置）。

**用途：** UI 预览、高亮可放置区域等

**示例：**
```typescript
// 检查候选块 0 是否可以放在 (4, 4)
if (session.canPlaceCandidate(0, 4, 4)) {
  // 显示绿色预览
} else {
  // 显示红色预览
}
```

### 状态查询

#### `getGameState(): GameState`
获取当前游戏状态。

```typescript
enum GameState {
  READY = 'READY',         // 准备就绪
  PLAYING = 'PLAYING',     // 游戏中
  GAME_OVER = 'GAME_OVER'  // 游戏结束
}
```

#### `isPlaying(): boolean`
检查游戏是否进行中。

#### `isGameOver(): boolean`
检查游戏是否结束。

#### `getTotalScore(): number`
获取当前总分。

#### `getMoveCount(): number`
获取当前移动次数。

### 候选块访问

#### `getCandidates(): (Block | null)[]`
获取所有候选块。

#### `getCandidate(index: number): Block | null`
获取指定候选块。

### 组件访问

#### `getBoard(): Board`
获取棋盘实例（只读访问）。

#### `getCandidateQueue(): CandidateQueue`
获取候选队列实例（只读访问）。

#### `getPlacementManager(): PlacementManager`
获取放置管理器实例。

## 游戏结束逻辑

游戏结束条件：**所有候选块都无法在棋盘上找到任何合法放置位置**

```typescript
// 自动检测示例
const result = session.placeCandidate(0, 4, 4);

if (result.gameOver) {
  console.log('游戏结束！');
  console.log(`最终得分：${session.getTotalScore()}`);
  console.log(`总步数：${session.getMoveCount()}`);
}
```

## 使用场景

### 场景 1：标准游戏流程

```typescript
// 完整的游戏循环
const session = new GameSession();
session.start();

while (session.isPlaying()) {
  // 1. 显示候选块
  const candidates = session.getCandidates();
  displayCandidates(candidates);
  
  // 2. 等待玩家选择
  const { index, row, col } = await waitForPlayerInput();
  
  // 3. 放置候选块
  const result = session.placeCandidate(index, row, col);
  
  if (result.success) {
    // 4. 更新 UI
    updateScore(session.getTotalScore());
    updateBoard(session.getBoard());
    
    // 5. 检查消除
    if (result.clearedRows.length > 0 || result.clearedColumns.length > 0) {
      playLineClearAnimation();
    }
    
    // 6. 检查游戏结束
    if (result.gameOver) {
      showGameOverDialog(session.getTotalScore());
      break;
    }
  } else {
    showError(result.reason);
  }
}
```

### 场景 2：放置预览

```typescript
// 实时显示放置预览
function updatePreview(candidateIndex: number, row: number, col: number) {
  const canPlace = session.canPlaceCandidate(candidateIndex, row, col);
  const candidate = session.getCandidate(candidateIndex);
  
  if (candidate && canPlace) {
    // 显示绿色预览
    const positions = candidate.getAbsolutePositions(row, col);
    showPreview(positions, 'green');
  } else if (candidate) {
    // 显示红色预览（无法放置）
    const positions = candidate.getAbsolutePositions(row, col);
    showPreview(positions, 'red');
  }
}
```

### 场景 3：可重现的游戏（挑战模式）

```typescript
// 创建每日挑战
const today = new Date().toISOString().split('T')[0];
const seed = hashString(today);  // 根据日期生成种子

const dailyChallenge = new GameSession({ seed });
dailyChallenge.start();

// 所有玩家在同一天会得到相同的候选块序列
```

### 场景 4：游戏回放

```typescript
// 记录游戏
const session = new GameSession({ seed: recordedSeed });
const moves: Move[] = [];

// 游戏进行中记录每步操作
const result = session.placeCandidate(index, row, col);
if (result.success) {
  moves.push({ index, row, col, score: result.score });
}

// 回放
const replaySession = new GameSession({ seed: recordedSeed });
replaySession.start();

for (const move of moves) {
  await sleep(1000);  // 延迟播放
  const result = replaySession.placeCandidate(move.index, move.row, move.col);
  updateUI(replaySession);
}
```

### 场景 5：AI 训练

```typescript
// 使用固定种子进行 AI 训练
function trainAI() {
  const session = new GameSession({ seed: 12345 });
  session.start();
  
  while (session.isPlaying()) {
    // AI 决策
    const { index, row, col } = aiDecideMove(session);
    
    const result = session.placeCandidate(index, row, col);
    
    if (result.success) {
      // 更新 AI 奖励
      updateReward(result.score);
    }
  }
  
  return session.getTotalScore();
}
```

## 最佳实践

### 1. 始终检查游戏状态

```typescript
if (session.isPlaying()) {
  const result = session.placeCandidate(index, row, col);
} else {
  console.log('游戏未开始或已结束');
}
```

### 2. 处理放置失败

```typescript
const result = session.placeCandidate(index, row, col);

if (!result.success) {
  switch (result.reason) {
    case 'Game not started':
      showMessage('请先开始游戏');
      break;
    case 'Invalid candidate index':
      showMessage('无效的候选块');
      break;
    case 'Position occupied':
      showMessage('该位置已被占用');
      break;
    case 'Out of bounds':
      showMessage('超出棋盘范围');
      break;
  }
}
```

### 3. 实时更新 UI

```typescript
const result = session.placeCandidate(index, row, col);

if (result.success) {
  // 更新分数
  updateScoreDisplay(session.getTotalScore());
  
  // 更新步数
  updateMoveCount(session.getMoveCount());
  
  // 更新棋盘
  updateBoardDisplay(session.getBoard());
  
  // 更新候选块
  updateCandidatesDisplay(session.getCandidates());
}
```

### 4. 优雅处理游戏结束

```typescript
const result = session.placeCandidate(index, row, col);

if (result.gameOver) {
  // 显示最终统计
  showGameOverDialog({
    score: session.getTotalScore(),
    moves: session.getMoveCount(),
    occupancy: session.getBoard().getOccupiedCount()
  });
  
  // 询问是否重新开始
  if (await askPlayAgain()) {
    session.reset();
    session.start();
  }
}
```

## 性能优化建议

### 1. 预检查放置可能性

```typescript
// 在拖拽过程中预检查，避免无效操作
onDragMove(candidateIndex, row, col) {
  if (session.canPlaceCandidate(candidateIndex, row, col)) {
    showValidPlacement();
  } else {
    showInvalidPlacement();
  }
}
```

### 2. 批量状态更新

```typescript
// 避免频繁的 UI 更新
let pendingUpdate = false;

function requestUpdate() {
  if (!pendingUpdate) {
    pendingUpdate = true;
    requestAnimationFrame(() => {
      updateUI(session);
      pendingUpdate = false;
    });
  }
}
```

## 测试

运行单元测试：

```bash
npm test -- GameSession.test.ts
```

查看使用示例：

```bash
npm run example:game
```

## 相关文档

- [CandidateQueue 文档](./CandidateQueue.README.md)
- [Board 文档](./README.md)
- [PlacementManager 文档](./PlacementManager.README.md)
- [BlockGenerator 文档](./BlockGenerator.README.md)
