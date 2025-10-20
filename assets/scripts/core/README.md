# Board 类 API 文档

## 概述

`Board` 类是 Block9x9 游戏的核心数据结构，负责管理 9x9 棋盘的状态和基本操作。

## 类结构

```typescript
export class Board {
  constructor()
}
```

## 主要方法

### 初始化与重置

#### `constructor()`
创建一个新的 9x9 空棋盘。

#### `reset(): void`
重置棋盘，清空所有已占用的格子。

#### `getSize(): number`
获取棋盘大小（固定为 9）。

### 单个格子操作

#### `getCell(row: number, col: number): boolean`
获取指定位置的状态。
- **参数**：
  - `row`: 行索引 (0-8)
  - `col`: 列索引 (0-8)
- **返回**：该位置是否被占用，无效位置返回 `false`

#### `setCell(row: number, col: number, occupied: boolean): boolean`
设置单个格子的状态。
- **参数**：
  - `row`: 行索引
  - `col`: 列索引
  - `occupied`: 是否占用
- **返回**：是否设置成功（无效位置返回 `false`）

### 方块操作

#### `placeBlock(positions: {row: number, col: number}[]): boolean`
放置一组格子（方块）。
- **参数**：要放置的位置数组
- **返回**：是否放置成功
- **注意**：
  - 所有位置必须有效且未被占用
  - 原子性操作：要么全部放置成功，要么全部失败

**示例**：
```typescript
const board = new Board();
const lBlock = [
  { row: 0, col: 0 },
  { row: 1, col: 0 },
  { row: 2, col: 0 },
  { row: 2, col: 1 }
];
board.placeBlock(lBlock); // true
```

#### `removeBlock(positions: {row: number, col: number}[]): boolean`
移除一组格子。
- **参数**：要移除的位置数组
- **返回**：是否移除成功（位置无效返回 `false`）

#### `canPlaceBlock(positions: {row: number, col: number}[]): boolean`
检查是否可以在指定位置放置方块。
- **参数**：要检查的位置数组
- **返回**：是否可以放置

### 满行/满列检测

#### `getFullRows(): number[]`
获取所有满行的行索引。
- **返回**：满行索引数组，例如 `[0, 2, 5]`

#### `getFullColumns(): number[]`
获取所有满列的列索引。
- **返回**：满列索引数组

**示例**：
```typescript
// 填满第 0 行
for (let col = 0; col < 9; col++) {
  board.setCell(0, col, true);
}
const fullRows = board.getFullRows(); // [0]
```

### 清除操作

#### `clearRows(rows: number[]): void`
清除指定的行。
- **参数**：要清除的行索引数组

#### `clearColumns(columns: number[]): void`
清除指定的列。
- **参数**：要清除的列索引数组

**示例**：
```typescript
const fullRows = board.getFullRows();
const fullCols = board.getFullColumns();
board.clearRows(fullRows);
board.clearColumns(fullCols);
```

### 状态查询

#### `getState(): boolean[][]`
获取当前棋盘状态矩阵（深拷贝）。
- **返回**：9x9 的布尔矩阵，`true` 表示占用，`false` 表示空闲

#### `getOccupiedCount(): number`
获取已占用格子的数量。
- **返回**：占用的格子数

## 使用示例

```typescript
import { Board } from './Board';

// 创建棋盘
const board = new Board();

// 放置方块
const block = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 }
];

if (board.canPlaceBlock(block)) {
  board.placeBlock(block);
}

// 检测满行满列
const fullRows = board.getFullRows();
const fullCols = board.getFullColumns();

// 清除满行满列
if (fullRows.length > 0) {
  board.clearRows(fullRows);
}
if (fullCols.length > 0) {
  board.clearColumns(fullCols);
}

// 获取状态
const state = board.getState();
const occupiedCount = board.getOccupiedCount();

console.log(`棋盘上有 ${occupiedCount} 个占用的格子`);
```

## 边界条件处理

- 所有位置参数都经过验证，无效位置（负数或超过 8）会被安全处理
- `placeBlock` 是原子性操作：如果任何位置无效或已占用，整个操作失败
- `getCell` 对无效位置返回 `false`
- `clearRows` 和 `clearColumns` 会忽略无效的索引

## 测试覆盖

该类有 32 个单元测试覆盖以下场景：
- 初始化和重置
- 边界放置（左上角、右下角、越界）
- 满行/满列检测
- 清除操作
- 复杂场景（同时消除多行多列）

运行测试：
```bash
npm test
```
