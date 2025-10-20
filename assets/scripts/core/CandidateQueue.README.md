# CandidateQueue 候选块队列

## 概述

`CandidateQueue` 类负责管理玩家下方的候选木块队列。它提供了候选块的存储、选择、自动补充等功能，是游戏玩法流程的核心组件之一。

## 主要特性

- ✅ 固定容量的候选块队列（默认 3 个槽位）
- ✅ 自动/手动补充候选块
- ✅ 选择并取出候选块
- ✅ 队列状态查询（满/空/数量）
- ✅ 重置与清空功能
- ✅ 支持更换生成器

## 快速开始

### 基本使用

```typescript
import { CandidateQueue } from './CandidateQueue';
import { BlockGenerator } from './BlockGenerator';

// 1. 创建生成器和队列
const generator = new BlockGenerator();
const queue = new CandidateQueue(generator);

// 2. 查看候选块
const candidates = queue.getAllCandidates();
console.log(`当前有 ${queue.getCount()} 个候选块`);

// 3. 选择并使用候选块
const selected = queue.selectCandidate(0);
if (selected) {
  console.log(`选中了 ${selected.getType()}`);
  // 队列会自动补充新的候选块
}
```

### 自定义配置

```typescript
// 自定义容量和自动补充
const queue = new CandidateQueue(generator, {
  capacity: 5,        // 5 个槽位
  autoRefill: false   // 禁用自动补充
});

// 手动补充
queue.selectCandidate(0);
queue.refillSlot(0);  // 手动补充槽位 0
```

## API 文档

### 构造函数

```typescript
constructor(generator: BlockGenerator, config?: CandidateQueueConfig)
```

**参数：**
- `generator`: 方块生成器实例
- `config`: 可选配置
  - `capacity`: 队列容量（默认 3）
  - `autoRefill`: 是否自动补充（默认 true）

### 查询方法

#### `getCapacity(): number`
获取队列容量。

#### `getCandidate(index: number): Block | null`
获取指定位置的候选块。

**参数：**
- `index`: 队列索引（0 到 capacity-1）

**返回：** Block 实例或 null（如果索引无效或位置为空）

#### `getAllCandidates(): (Block | null)[]`
获取所有候选块的浅拷贝数组。

#### `getCount(): number`
获取当前有效候选块的数量。

#### `isFull(): boolean`
检查队列是否已满。

#### `isEmpty(): boolean`
检查队列是否为空。

#### `hasCandidate(index: number): boolean`
检查指定位置是否有候选块。

### 操作方法

#### `selectCandidate(index: number): Block | null`
选择并取出候选块。如果启用了自动补充，会立即补充该位置。

**参数：**
- `index`: 队列索引

**返回：** 取出的 Block 实例或 null

**示例：**
```typescript
const block = queue.selectCandidate(0);
if (block) {
  // 使用该方块...
  const positions = block.getAbsolutePositions(row, col);
}
```

#### `refillSlot(index: number): boolean`
手动补充指定位置。

**返回：** 是否补充成功

#### `refillAll(): void`
填满所有空位。

#### `reset(): void`
重置队列（清空并重新填充）。

#### `clear(): void`
清空队列（不重新填充）。

### 配置方法

#### `setAutoRefill(enable: boolean): void`
设置自动补充开关。

#### `isAutoRefillEnabled(): boolean`
获取自动补充状态。

#### `setGenerator(generator: BlockGenerator): void`
更换生成器实例。

#### `getGenerator(): BlockGenerator`
获取当前生成器实例。

## 使用场景

### 场景 1：标准游戏流程

```typescript
// 初始化
const generator = new BlockGenerator();
const queue = new CandidateQueue(generator);

// 玩家选择候选块
const selectedBlock = queue.selectCandidate(playerChoice);
if (selectedBlock) {
  // 尝试放置到棋盘
  const positions = selectedBlock.getAbsolutePositions(row, col);
  board.placeBlock(positions);
  // 队列自动补充
}
```

### 场景 2：特殊玩法（有限候选块）

```typescript
// 创建不自动补充的队列
const queue = new CandidateQueue(generator, { autoRefill: false });

// 玩家使用所有候选块
queue.selectCandidate(0);
queue.selectCandidate(1);
queue.selectCandidate(2);

// 队列为空
console.log(queue.isEmpty()); // true

// 通过特殊道具或奖励补充
if (playerUsedPowerUp) {
  queue.refillAll();
}
```

### 场景 3：可重现的游戏

```typescript
// 使用种子生成器
const generator = new BlockGenerator({ seed: 12345 });
const queue = new CandidateQueue(generator);

// 每次使用相同种子，候选块序列都相同
// 适用于：回放、挑战模式、调试等
```

### 场景 4：动态调整队列

```typescript
const queue = new CandidateQueue(generator, { capacity: 3 });

// 游戏进行中...
const currentCandidates = queue.getAllCandidates();

// 更换生成器（例如进入新关卡）
const newGenerator = new BlockGenerator({ 
  blockTypes: [BlockType.SINGLE, BlockType.LINE_2] 
});
queue.setGenerator(newGenerator);
queue.reset(); // 使用新生成器重新填充
```

## 最佳实践

### 1. 始终检查返回值

```typescript
const block = queue.selectCandidate(index);
if (block !== null) {
  // 使用方块
}
```

### 2. 合理使用自动补充

```typescript
// 标准玩法：启用自动补充
const normalQueue = new CandidateQueue(generator);

// 特殊模式：禁用自动补充
const limitedQueue = new CandidateQueue(generator, { autoRefill: false });
```

### 3. 定期检查队列状态

```typescript
// 在每次放置后
if (queue.isEmpty()) {
  console.log('警告：队列已空！');
} else if (!queue.isFull()) {
  console.log(`剩余候选块：${queue.getCount()}`);
}
```

### 4. 正确处理重置

```typescript
// 游戏重新开始
queue.reset();  // 推荐：清空并重新填充

// 仅清空（不推荐，除非有特殊需求）
queue.clear();
```

## 与其他组件集成

### 与 Board 集成

```typescript
import { Board } from './Board';
import { CandidateQueue } from './CandidateQueue';

const board = new Board();
const queue = new CandidateQueue(generator);

// 放置流程
const block = queue.selectCandidate(0);
if (block) {
  const positions = block.getAbsolutePositions(row, col);
  if (board.canPlaceBlock(positions)) {
    board.placeBlock(positions);
  }
}
```

### 与 PlacementManager 集成

```typescript
import { PlacementManager } from './PlacementManager';

const manager = new PlacementManager(board);
const block = queue.selectCandidate(index);

if (block) {
  const positions = block.getAbsolutePositions(row, col);
  const result = manager.place(positions);
  
  if (result.success) {
    console.log(`得分：${result.score}`);
  }
}
```

### 与 GameSession 集成

推荐使用 `GameSession` 类来自动管理所有组件的集成，无需手动处理：

```typescript
import { GameSession } from './GameSession';

const session = new GameSession();
session.start();

// 直接使用高层 API
const result = session.placeCandidate(0, row, col);
```

## 测试

运行单元测试：

```bash
npm test -- CandidateQueue.test.ts
```

查看使用示例：

```bash
npm run example:game
```

## 相关文档

- [BlockGenerator 文档](./BlockGenerator.README.md)
- [GameSession 文档](./GameSession.README.md)
- [Block 文档](./Block.README.md)
