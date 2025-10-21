# 候选块队列系统 - 快速开始指南

本指南介绍如何使用新实现的候选块队列系统来构建完整的 Block9x9 游戏。

## 核心概念

### 1. CandidateQueue（候选块队列）
管理玩家可选择的候选木块，通常显示在游戏界面下方。

**主要特点：**
- 固定容量（默认 3 个槽位）
- 自动从 BlockGenerator 补充新块
- 支持选择并取出候选块

### 2. GameSession（游戏会话）
整合所有游戏组件，提供完整的游戏流程控制。

**主要特点：**
- 管理游戏状态（READY/PLAYING/GAME_OVER）
- 自动检测游戏结束
- 统计分数和步数
- 支持游戏重置

## 最小可用示例

```typescript
import { GameSession } from './assets/scripts/core/GameSession';

// 1. 创建游戏会话
const session = new GameSession();

// 2. 开始游戏
session.start();

// 3. 获取候选块
const candidates = session.getCandidates();
console.log(`当前候选块：${candidates.map(b => b?.getType()).join(', ')}`);

// 4. 放置候选块
const result = session.placeCandidate(
  0,    // 选择第一个候选块
  4,    // 放到第 4 行
  4     // 放到第 4 列
);

if (result.success) {
  console.log(`成功！得分：${result.score}`);
  console.log(`总分：${session.getTotalScore()}`);
} else {
  console.log(`失败：${result.reason}`);
}

// 5. 检查游戏状态
if (session.isGameOver()) {
  console.log(`游戏结束！最终得分：${session.getTotalScore()}`);
}
```

## 完整游戏循环示例

```typescript
import { GameSession } from './assets/scripts/core/GameSession';

async function playGame() {
  // 创建并开始游戏
  const session = new GameSession({ seed: 12345 });
  session.start();
  
  console.log('游戏开始！\n');
  
  // 游戏主循环
  while (session.isPlaying()) {
    // 显示当前状态
    console.log(`步数：${session.getMoveCount()}`);
    console.log(`分数：${session.getTotalScore()}`);
    
    // 显示候选块
    const candidates = session.getCandidates();
    console.log('\n可用候选块：');
    candidates.forEach((block, i) => {
      if (block) {
        console.log(`  [${i}] ${block.getType()} (${block.getCellCount()}格)`);
      }
    });
    
    // 获取玩家输入（这里简化为自动选择）
    const { index, row, col } = await getPlayerMove(session);
    
    // 放置候选块
    const result = session.placeCandidate(index, row, col);
    
    if (result.success) {
      console.log(`\n✓ 放置成功！得分 +${result.score}`);
      
      if (result.clearedRows.length > 0 || result.clearedColumns.length > 0) {
        console.log(`⭐ 消除了 ${result.clearedRows.length} 行和 ${result.clearedColumns.length} 列`);
      }
      
      if (result.gameOver) {
        console.log('\n游戏结束！');
        break;
      }
    } else {
      console.log(`\n✗ 放置失败：${result.reason}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  // 显示最终统计
  console.log('最终统计：');
  console.log(`  总分：${session.getTotalScore()}`);
  console.log(`  总步数：${session.getMoveCount()}`);
  console.log(`  棋盘占用：${session.getBoard().getOccupiedCount()} / 81 格`);
}

// 模拟获取玩家移动（实际游戏中应该等待用户输入）
async function getPlayerMove(session: GameSession) {
  // 简单策略：尝试将第一个候选块放在第一个可用位置
  for (let index = 0; index < 3; index++) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (session.canPlaceCandidate(index, row, col)) {
          return { index, row, col };
        }
      }
    }
  }
  
  // 如果没有可用位置，游戏会自动结束
  return { index: 0, row: 0, col: 0 };
}

playGame();
```

## UI 集成示例

### 1. 显示候选块

```typescript
// 在 Cocos Creator 中更新候选块显示
function updateCandidateDisplay() {
  const candidates = session.getCandidates();
  
  candidates.forEach((block, index) => {
    if (block) {
      const node = candidateNodes[index];
      
      // 清空之前的显示
      node.removeAllChildren();
      
      // 渲染方块形状
      const shape = block.getShape();
      shape.forEach(pos => {
        const cellNode = createCellNode();
        cellNode.setPosition(pos.col * CELL_SIZE, -pos.row * CELL_SIZE);
        node.addChild(cellNode);
      });
      
      // 添加点击事件
      node.on(Node.EventType.TOUCH_END, () => {
        onCandidateSelected(index);
      });
    }
  });
}
```

### 2. 放置预览

```typescript
// 显示放置预览
function showPlacementPreview(candidateIndex: number, row: number, col: number) {
  const canPlace = session.canPlaceCandidate(candidateIndex, row, col);
  const candidate = session.getCandidate(candidateIndex);
  
  if (!candidate) return;
  
  const positions = candidate.getAbsolutePositions(row, col);
  
  positions.forEach(pos => {
    const cell = getBoardCell(pos.row, pos.col);
    if (canPlace) {
      cell.setColor(Color.GREEN);  // 可以放置
    } else {
      cell.setColor(Color.RED);    // 不可放置
    }
  });
}
```

### 3. 处理玩家操作

```typescript
// 处理候选块选择
let selectedCandidate: number | null = null;

function onCandidateSelected(index: number) {
  selectedCandidate = index;
  console.log(`选中候选块 ${index}`);
}

// 处理棋盘点击
function onBoardCellClicked(row: number, col: number) {
  if (selectedCandidate === null) {
    console.log('请先选择候选块');
    return;
  }
  
  const result = session.placeCandidate(selectedCandidate, row, col);
  
  if (result.success) {
    // 更新 UI
    updateBoardDisplay();
    updateCandidateDisplay();
    updateScoreDisplay(session.getTotalScore());
    
    // 播放音效
    playSoundEffect('place');
    
    if (result.clearedRows.length > 0 || result.clearedColumns.length > 0) {
      // 播放消除动画
      playLineClearAnimation(result.clearedRows, result.clearedColumns);
      playSoundEffect('clear');
    }
    
    if (result.gameOver) {
      showGameOverDialog();
    }
    
    selectedCandidate = null;
  } else {
    // 显示错误提示
    showError(result.reason);
  }
}
```

## 高级功能

### 1. 可重现的游戏（挑战模式）

```typescript
// 创建每日挑战
const today = new Date().toISOString().split('T')[0];
const seed = hashString(today);

const dailyChallenge = new GameSession({ seed });
dailyChallenge.start();

// 所有玩家在同一天会得到相同的候选块序列
```

### 2. 游戏回放

```typescript
interface Move {
  index: number;
  row: number;
  col: number;
}

// 记录游戏
const moves: Move[] = [];
const recordedSeed = 12345;
const session = new GameSession({ seed: recordedSeed });

// 记录每步操作
function recordMove(index: number, row: number, col: number) {
  const result = session.placeCandidate(index, row, col);
  if (result.success) {
    moves.push({ index, row, col });
  }
}

// 回放游戏
async function replayGame() {
  const replaySession = new GameSession({ seed: recordedSeed });
  replaySession.start();
  
  for (const move of moves) {
    await sleep(1000);  // 延迟 1 秒
    replaySession.placeCandidate(move.index, move.row, move.col);
    updateUI(replaySession);
  }
}
```

### 3. 仅使用 CandidateQueue（无游戏状态）

如果你只需要候选块管理功能，也可以单独使用 CandidateQueue：

```typescript
import { CandidateQueue } from './assets/scripts/core/CandidateQueue';
import { BlockGenerator } from './assets/scripts/core/BlockGenerator';
import { Board } from './assets/scripts/core/Board';
import { PlacementManager } from './assets/scripts/core/PlacementManager';

// 创建组件
const generator = new BlockGenerator();
const queue = new CandidateQueue(generator);
const board = new Board();
const manager = new PlacementManager(board);

// 手动管理游戏流程
const block = queue.selectCandidate(0);
if (block) {
  const positions = block.getAbsolutePositions(row, col);
  const result = manager.place(positions);
  // 处理结果...
}
```

## 运行示例

查看完整的工作示例：

```bash
# 运行游戏会话示例
npm run example:game
```

这个示例展示了：
- CandidateQueue 基础用法
- GameSession 完整游戏流程
- 候选块选择与放置
- 游戏状态管理
- 分数计算与消除
- 游戏重置
- 可重现游戏
- 完整游戏模拟

## 测试

运行单元测试以了解更多用法：

```bash
# 运行所有测试
npm test

# 只运行候选块队列测试
npm test -- CandidateQueue.test.ts

# 只运行游戏会话测试
npm test -- GameSession.test.ts
```

## 下一步

现在你已经有了完整的游戏逻辑层，可以：

1. **在 Cocos Creator 中创建 UI**
   - 创建棋盘渲染组件
   - 创建候选块显示组件
   - 添加拖拽/点击交互

2. **添加音效和动画**
   - 放置音效
   - 消除动画
   - 得分特效

3. **实现更多游戏模式**
   - 时间挑战模式
   - 关卡模式
   - 多人对战模式

4. **添加数据持久化**
   - 保存最高分
   - 保存游戏进度
   - 统计游戏数据

## 相关文档

- [CandidateQueue API 文档](assets/scripts/core/CandidateQueue.README.md)
- [GameSession API 文档](assets/scripts/core/GameSession.README.md)
- [Board API 文档](assets/scripts/core/README.md)
- [PlacementManager API 文档](assets/scripts/core/PlacementManager.README.md)
