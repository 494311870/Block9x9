# Block 和 BlockGenerator API 文档

## 概述

`Block` 类表示游戏中的木块（方块），支持多种预定义形状、旋转、克隆和序列化功能。`BlockGenerator` 类负责随机生成方块，支持种子以实现可重现的随机序列，便于测试。

---

## Block 类

### 类型定义

#### BlockType（枚举）

```typescript
enum BlockType {
  SINGLE = 'SINGLE',           // 单格（1格）
  LINE_2 = 'LINE_2',           // 2格直线
  LINE_3 = 'LINE_3',           // 3格直线
  LINE_4 = 'LINE_4',           // 4格直线
  LINE_5 = 'LINE_5',           // 5格直线
  SQUARE_2X2 = 'SQUARE_2X2',   // 2x2方块（4格）
  SQUARE_3X3 = 'SQUARE_3X3',   // 3x3方块（9格）
  L_SMALL = 'L_SMALL',         // 小L形（3格）
  L_MEDIUM = 'L_MEDIUM',       // 中L形（4格）
  L_LARGE = 'L_LARGE',         // 大L形（5格）
  T_SHAPE = 'T_SHAPE',         // T形（5格）
}
```

#### Position（接口）

```typescript
interface Position {
  row: number;
  col: number;
}
```

#### BlockData（接口）

```typescript
interface BlockData {
  type: BlockType;
  shape: Position[];
  rotation: number;
}
```

### 创建方块

#### `static createBlock(type: BlockType): Block`

创建指定类型的预定义方块。

```typescript
const line = Block.createBlock(BlockType.LINE_3);
const lShape = Block.createBlock(BlockType.L_SMALL);
const square = Block.createBlock(BlockType.SQUARE_2X2);
```

### 基本方法

#### `getType(): BlockType`

获取方块的类型。

```typescript
const block = Block.createBlock(BlockType.L_SMALL);
console.log(block.getType()); // 'L_SMALL'
```

#### `getShape(): Position[]`

获取方块的形状（相对坐标数组）。返回的是副本，修改不会影响原方块。

```typescript
const block = Block.createBlock(BlockType.L_SMALL);
const shape = block.getShape();
// [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }]
```

#### `getCellCount(): number`

获取方块包含的格子数量。

```typescript
const line = Block.createBlock(BlockType.LINE_3);
console.log(line.getCellCount()); // 3
```

#### `getBounds(): { width: number; height: number }`

获取方块的边界框大小。

```typescript
const line = Block.createBlock(BlockType.LINE_3);
console.log(line.getBounds()); // { width: 3, height: 1 }

const rotated = line.rotate();
console.log(rotated.getBounds()); // { width: 1, height: 3 }
```

### 位置计算

#### `getAbsolutePositions(baseRow: number, baseCol: number): Position[]`

获取方块在棋盘上指定位置的绝对坐标。

```typescript
const block = Block.createBlock(BlockType.L_SMALL);
// 形状: [(0,0), (1,0), (1,1)]

const positions = block.getAbsolutePositions(2, 3);
// 结果: [(2,3), (3,3), (3,4)]
```

### 旋转功能

#### `rotate(): Block`

顺时针旋转方块 90 度，返回新的 Block 实例。

```typescript
const line = Block.createBlock(BlockType.LINE_3);
// 水平: [(0,0), (0,1), (0,2)]

const rotated = line.rotate();
// 垂直: [(0,0), (1,0), (2,0)]

console.log(rotated.getRotation()); // 90
```

#### `getRotation(): number`

获取当前旋转角度（0, 90, 180, 270）。

```typescript
let block = Block.createBlock(BlockType.L_SMALL);
console.log(block.getRotation()); // 0

block = block.rotate();
console.log(block.getRotation()); // 90
```

**注意**：旋转 4 次会回到原始形状（360° = 0°）。

### 克隆

#### `clone(): Block`

创建方块的独立副本。

```typescript
const original = Block.createBlock(BlockType.T_SHAPE);
const cloned = original.clone();

// 克隆体是独立的
const rotatedClone = cloned.rotate();
console.log(original.getRotation()); // 0
console.log(rotatedClone.getRotation()); // 90
```

### 序列化

#### `serialize(): BlockData`

将方块序列化为可 JSON 化的数据对象。

```typescript
const block = Block.createBlock(BlockType.L_SMALL);
const data = block.serialize();
const json = JSON.stringify(data);
```

#### `static deserialize(data: BlockData): Block`

从序列化数据重建方块。

```typescript
const original = Block.createBlock(BlockType.T_SHAPE).rotate();
const data = original.serialize();
const restored = Block.deserialize(data);

console.log(restored.getRotation()); // 90
```

---

## BlockGenerator 类

### 创建生成器

#### `constructor(config?: BlockGeneratorConfig)`

创建方块生成器。

```typescript
// 默认生成器（无种子，真随机）
const generator = new BlockGenerator();

// 带种子的生成器（确定性随机）
const seededGen = new BlockGenerator({ seed: 12345 });

// 限制可生成类型
const limitedGen = new BlockGenerator({
  blockTypes: [BlockType.SINGLE, BlockType.LINE_2, BlockType.LINE_3]
});

// 同时配置种子和类型
const customGen = new BlockGenerator({
  seed: 999,
  blockTypes: [BlockType.L_SMALL, BlockType.L_MEDIUM, BlockType.L_LARGE]
});
```

#### `createDefaultGenerator(): BlockGenerator`

快捷方法：创建默认生成器（无种子）。

```typescript
import { createDefaultGenerator } from './BlockGenerator';

const generator = createDefaultGenerator();
```

#### `createTestGenerator(seed?: number): BlockGenerator`

快捷方法：创建测试用生成器（带种子，默认种子 12345）。

```typescript
import { createTestGenerator } from './BlockGenerator';

const generator = createTestGenerator(999);
```

### 生成方法

#### `generate(): Block`

生成一个随机方块。

```typescript
const generator = new BlockGenerator();
const block = generator.generate();
```

#### `generateMultiple(count: number): Block[]`

生成多个随机方块。

```typescript
const generator = new BlockGenerator();
const blocks = generator.generateMultiple(5);
```

#### `generateType(type: BlockType): Block`

生成指定类型的方块（该类型必须在可用类型列表中）。

```typescript
const generator = new BlockGenerator();
const lShape = generator.generateType(BlockType.L_SMALL);
```

### 类型管理

#### `getAvailableTypes(): BlockType[]`

获取可生成的方块类型列表。返回的是副本。

```typescript
const generator = new BlockGenerator();
const types = generator.getAvailableTypes();
console.log(types); // 所有 11 种类型
```

#### `setAvailableTypes(types: BlockType[]): void`

动态设置可生成的方块类型。

```typescript
const generator = new BlockGenerator();
generator.setAvailableTypes([
  BlockType.SINGLE,
  BlockType.LINE_2,
  BlockType.LINE_3
]);
```

**注意**：类型数组不能为空，否则会抛出错误。

### 种子管理

#### `resetSeed(seed: number): void`

重置随机种子，使生成序列重新开始。

```typescript
const generator = new BlockGenerator({ seed: 12345 });
const firstBatch = generator.generateMultiple(5);

generator.resetSeed(12345);
const secondBatch = generator.generateMultiple(5);

// firstBatch 和 secondBatch 的类型序列相同
```

---

## 使用示例

### 示例 1：在棋盘上放置方块

```typescript
import { Board } from './Board';
import { Block, BlockType } from './Block';

const board = new Board();
const lShape = Block.createBlock(BlockType.L_SMALL);

// 获取方块在 (2, 3) 位置的绝对坐标
const positions = lShape.getAbsolutePositions(2, 3);

// 检查是否可以放置
if (board.canPlaceBlock(positions)) {
  board.placeBlock(positions);
  console.log('放置成功！');
}
```

### 示例 2：旋转方块找到合适位置

```typescript
const board = new Board();
const line = Block.createBlock(BlockType.LINE_3);

let currentBlock = line;
let placed = false;

// 尝试 4 个旋转角度
for (let i = 0; i < 4 && !placed; i++) {
  const positions = currentBlock.getAbsolutePositions(5, 5);
  
  if (board.canPlaceBlock(positions)) {
    board.placeBlock(positions);
    console.log(`成功放置（旋转 ${currentBlock.getRotation()}°）`);
    placed = true;
  } else {
    currentBlock = currentBlock.rotate();
  }
}
```

### 示例 3：使用生成器创建随机关卡

```typescript
import { BlockGenerator } from './BlockGenerator';

const generator = new BlockGenerator({ seed: 12345 });

// 为玩家生成 3 个候选方块
const candidates = generator.generateMultiple(3);

candidates.forEach((block, index) => {
  console.log(`候选 ${index + 1}: ${block.getType()}, ${block.getCellCount()} 格`);
});
```

### 示例 4：序列化保存游戏状态

```typescript
// 保存方块状态
const block = Block.createBlock(BlockType.T_SHAPE).rotate();
const savedData = JSON.stringify(block.serialize());

// 恢复方块状态
const parsedData = JSON.parse(savedData);
const restoredBlock = Block.deserialize(parsedData);

console.log(restoredBlock.getRotation()); // 90
```

### 示例 5：测试确定性

```typescript
import { createTestGenerator } from './BlockGenerator';

// 测试中使用固定种子
const generator = createTestGenerator(777);

const sequence1 = generator.generateMultiple(10);
generator.resetSeed(777);
const sequence2 = generator.generateMultiple(10);

// sequence1 和 sequence2 的类型序列完全相同
```

---

## 方块形状参考

| 类型 | 格子数 | 边界框 | 形状示例 |
|------|--------|--------|----------|
| SINGLE | 1 | 1×1 | ■ |
| LINE_2 | 2 | 2×1 | ■■ |
| LINE_3 | 3 | 3×1 | ■■■ |
| LINE_4 | 4 | 4×1 | ■■■■ |
| LINE_5 | 5 | 5×1 | ■■■■■ |
| SQUARE_2X2 | 4 | 2×2 | ■■<br>■■ |
| SQUARE_3X3 | 9 | 3×3 | ■■■<br>■■■<br>■■■ |
| L_SMALL | 3 | 2×2 | ■<br>■■ |
| L_MEDIUM | 4 | 2×3 | ■<br>■<br>■■ |
| L_LARGE | 5 | 2×4 | ■<br>■<br>■<br>■■ |
| T_SHAPE | 5 | 3×3 | ■■■<br>&nbsp;■<br>&nbsp;■ |

---

## 测试覆盖

### Block 类测试

- ✓ 创建和操作基本方块
- ✓ 绝对位置计算
- ✓ 旋转功能（包括 4 次旋转回到原始）
- ✓ 克隆独立性
- ✓ 序列化与反序列化
- ✓ 边界框计算
- ✓ 格子数统计

### BlockGenerator 类测试

- ✓ 基本生成功能
- ✓ 种子确定性（相同种子产生相同序列）
- ✓ 可用类型管理
- ✓ 随机性验证
- ✓ 边界条件处理

### Block 放置合法性测试

- ✓ 基本放置测试（各种形状）
- ✓ 边界检测（上下左右）
- ✓ 重叠检测
- ✓ 旋转后的放置
- ✓ 与 Board 集成测试

运行测试：
```bash
npm test
```

查看示例：
```bash
npm run example:block
```

---

## 设计注意事项

1. **不可变性**：`rotate()` 和 `clone()` 返回新实例，不修改原对象
2. **归一化**：方块坐标始终从 (0, 0) 开始，确保一致性
3. **确定性**：使用种子可以获得可重现的随机序列，便于测试和回放
4. **类型安全**：所有方法都有明确的类型定义
5. **深拷贝**：`getShape()` 等方法返回副本，防止意外修改

---

## 相关文档

- [Board 类 API 文档](./README.md)
- [示例代码](../../../examples/block-usage.ts)
- [单元测试](../../../tests/core/Block.test.ts)
