# PlacementManager API 文档

## 概述

`PlacementManager` 类负责管理方块放置的完整流程，包括：
1. 验证放置位置的合法性
2. 执行方块放置
3. 检测满行/满列
4. 自动消除满行/满列
5. 计算得分（包括连消奖励）

## 类接口

### 构造函数

```typescript
constructor(board: Board, scoreConfig?: Partial<ScoreConfig>)
```

**参数：**
- `board`: Board 实例，用于管理棋盘状态
- `scoreConfig` (可选): 得分配置对象

**示例：**
```typescript
const board = new Board();
const manager = new PlacementManager(board);

// 使用自定义得分配置
const customManager = new PlacementManager(board, {
  cellPlacementScore: 2,
  lineScore: 20,
  comboMultiplier: 2.0
});
```

### 主要方法

#### place(positions: Position[]): PlacementResult

执行完整的放置流程：验证 → 放置 → 检测 → 消除 → 计分

**参数：**
- `positions`: 要放置的位置数组，格式为 `{ row: number, col: number }[]`

**返回值：** `PlacementResult` 对象
```typescript
{
  success: boolean;         // 是否放置成功
  clearedRows: number[];    // 被消除的行索引数组
  clearedColumns: number[]; // 被消除的列索引数组
  score: number;            // 本次获得的分数
  reason?: string;          // 失败原因（仅当 success 为 false 时）
}
```

**示例：**
```typescript
const block = Block.createBlock(BlockType.LINE_3);
const positions = block.getAbsolutePositions(0, 0);

const result = manager.place(positions);

if (result.success) {
  console.log(`放置成功！得分: ${result.score}`);
  console.log(`消除的行: ${result.clearedRows}`);
  console.log(`消除的列: ${result.clearedColumns}`);
} else {
  console.log(`放置失败: ${result.reason}`);
}
```

#### calculateScore(cellCount: number, rowCount: number, columnCount: number): number

计算得分（可单独调用用于预测得分）

**参数：**
- `cellCount`: 放置的格子数量
- `rowCount`: 消除的行数
- `columnCount`: 消除的列数

**返回值：** 总得分

**得分规则：**
1. **基础分** = `cellCount × cellPlacementScore`
2. **消除分** = `(rowCount + columnCount) × lineScore`
3. **连消奖励**（当消除 ≥2 条线时）:
   - 额外分 = `消除分 × (消除线数 - 1) × (comboMultiplier - 1)`

**示例：**
```typescript
// 默认配置：cellPlacementScore=1, lineScore=10, comboMultiplier=1.5
const score1 = manager.calculateScore(3, 0, 0);  // 3 分（仅放置）
const score2 = manager.calculateScore(1, 1, 0);  // 11 分（放置1格 + 消除1行）
const score3 = manager.calculateScore(1, 1, 1);  // 31 分（放置1格 + 消除2条线 + 连消奖励）
```

#### getScoreConfig(): ScoreConfig

获取当前的得分配置

**返回值：**
```typescript
{
  cellPlacementScore: number;  // 每格基础分
  lineScore: number;           // 每行/列消除分
  comboMultiplier: number;     // 连消系数
}
```

#### updateScoreConfig(config: Partial<ScoreConfig>): void

动态更新得分配置

**参数：**
- `config`: 部分配置对象，只更新指定的字段

**示例：**
```typescript
manager.updateScoreConfig({
  lineScore: 50  // 只更新消行分，其他配置保持不变
});
```

## 得分配置详解

### ScoreConfig 接口

```typescript
interface ScoreConfig {
  cellPlacementScore: number;  // 每放置一个格子的基础分
  lineScore: number;           // 每消除一行/列的基础分
  comboMultiplier: number;     // 连消奖励系数
}
```

### 默认配置

```typescript
{
  cellPlacementScore: 1,
  lineScore: 10,
  comboMultiplier: 1.5
}
```

### 得分计算示例

#### 示例 1：仅放置（无消除）
```typescript
// 放置 3×3 方块（9格）
放置分 = 9 × 1 = 9
总分 = 9
```

#### 示例 2：消除单行
```typescript
// 放置 1 格，触发 1 行消除
放置分 = 1 × 1 = 1
消除分 = 1 × 10 = 10
连消奖励 = 0（只有1条线）
总分 = 1 + 10 = 11
```

#### 示例 3：同时消除行和列
```typescript
// 放置 1 格，同时触发 1 行 + 1 列消除（共 2 条线）
放置分 = 1 × 1 = 1
消除分 = 2 × 10 = 20
连消奖励 = 20 × (2-1) × (1.5-1) = 10
总分 = 1 + 20 + 10 = 31
```

#### 示例 4：消除 3 条线
```typescript
// 放置 3 格，触发 3 行消除
放置分 = 3 × 1 = 3
消除分 = 3 × 10 = 30
连消奖励 = 30 × (3-1) × 0.5 = 30
总分 = 3 + 30 + 30 = 63
```

## 失败原因

`PlacementResult.reason` 可能的值：
- `"Out of bounds"`: 位置越界
- `"Position occupied"`: 位置已被占用
- `"Unknown error"`: 未知错误（理论上不应出现）

## 完整使用示例

```typescript
import { Board } from './Board';
import { Block, BlockType } from './Block';
import { PlacementManager } from './PlacementManager';

// 1. 创建棋盘和管理器
const board = new Board();
const manager = new PlacementManager(board, {
  cellPlacementScore: 1,
  lineScore: 10,
  comboMultiplier: 1.5
});

let totalScore = 0;

// 2. 放置第一个方块
const block1 = Block.createBlock(BlockType.LINE_3);
const positions1 = block1.getAbsolutePositions(0, 0);
const result1 = manager.place(positions1);

if (result1.success) {
  totalScore += result1.score;
  console.log(`第一次放置成功，得分: ${result1.score}`);
}

// 3. 准备触发消除
// 填满第 0 行的其余部分
for (let col = 3; col < 9; col++) {
  board.setCell(0, col, true);
}

// 4. 放置触发消除的方块
const block2 = Block.createBlock(BlockType.SINGLE);
const positions2 = block2.getAbsolutePositions(5, 5);
const result2 = manager.place(positions2);

// 假设某个操作触发了行消除
if (result2.clearedRows.length > 0) {
  console.log(`消除了 ${result2.clearedRows.length} 行！`);
  console.log(`连消得分: ${result2.score}`);
  totalScore += result2.score;
}

console.log(`总分: ${totalScore}`);
```

## 注意事项

1. **原子性**: `place()` 方法保证原子性 - 要么完全成功，要么完全失败，不会出现部分放置的情况。

2. **自动消除**: 放置成功后会自动检测并消除所有满行/满列，无需手动调用。

3. **得分即时性**: 返回的 `score` 是本次放置的即时得分，游戏总分需要外部维护。

4. **配置独立性**: 每个 `PlacementManager` 实例有独立的得分配置，互不影响。

5. **Board 状态**: `PlacementManager` 会直接修改传入的 `Board` 实例的状态，确保在多个地方使用同一个 Board 实例。

## 单元测试

完整的单元测试位于 `tests/core/PlacementManager.test.ts`，覆盖：
- ✅ 基本放置功能（成功/失败）
- ✅ 边界检测（越界、负数坐标）
- ✅ 得分计算（基础分、消除分、连消奖励）
- ✅ 消除检测（单行、单列、多行列）
- ✅ 复杂场景（连续放置、消除后再放置）
- ✅ 得分配置（自定义、动态更新）
- ✅ 边界条件（空数组、状态不变性）
