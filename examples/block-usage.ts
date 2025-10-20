/**
 * Block 和 BlockGenerator 类使用示例
 * 演示如何创建、操作和生成方块
 */

import { Block, BlockType } from '../assets/scripts/core/Block';
import { BlockGenerator, createDefaultGenerator, createTestGenerator } from '../assets/scripts/core/BlockGenerator';
import { Board } from '../assets/scripts/core/Board';

// 示例 1: 创建和操作基本方块
function example1_BasicBlockOperations() {
  console.log('=== 示例 1: 创建和操作基本方块 ===');
  
  // 创建不同类型的方块
  const single = Block.createBlock(BlockType.SINGLE);
  const line = Block.createBlock(BlockType.LINE_3);
  const lShape = Block.createBlock(BlockType.L_SMALL);
  const square = Block.createBlock(BlockType.SQUARE_2X2);
  
  console.log('单格方块格子数:', single.getCellCount());
  console.log('直线方块格子数:', line.getCellCount());
  console.log('L形方块格子数:', lShape.getCellCount());
  console.log('方块形状格子数:', square.getCellCount());
  
  // 获取方块的边界框
  console.log('\n边界框信息:');
  console.log('直线方块边界:', line.getBounds()); // { width: 3, height: 1 }
  console.log('L形方块边界:', lShape.getBounds()); // { width: 2, height: 2 }
  console.log('方块形状边界:', square.getBounds()); // { width: 2, height: 2 }
}

// 示例 2: 方块旋转
function example2_BlockRotation() {
  console.log('\n=== 示例 2: 方块旋转 ===');
  
  const line = Block.createBlock(BlockType.LINE_3);
  console.log('原始直线形状:', line.getShape());
  console.log('原始边界:', line.getBounds());
  
  const rotated = line.rotate();
  console.log('\n旋转后形状:', rotated.getShape());
  console.log('旋转后边界:', rotated.getBounds());
  console.log('旋转角度:', rotated.getRotation());
  
  // L形方块的旋转
  const lShape = Block.createBlock(BlockType.L_MEDIUM);
  console.log('\nL形原始:', lShape.getShape());
  
  let currentBlock = lShape;
  for (let i = 1; i <= 4; i++) {
    currentBlock = currentBlock.rotate();
    console.log(`旋转 ${i} 次 (${currentBlock.getRotation()}°):`, currentBlock.getShape());
  }
}

// 示例 3: 方块克隆和序列化
function example3_CloneAndSerialize() {
  console.log('\n=== 示例 3: 方块克隆和序列化 ===');
  
  const original = Block.createBlock(BlockType.T_SHAPE);
  const rotated = original.rotate();
  
  // 克隆
  const cloned = rotated.clone();
  console.log('原始方块旋转:', rotated.getRotation());
  console.log('克隆方块旋转:', cloned.getRotation());
  console.log('克隆是否相等:', JSON.stringify(rotated.serialize()) === JSON.stringify(cloned.serialize()));
  
  // 序列化
  const data = cloned.serialize();
  console.log('\n序列化数据:', JSON.stringify(data, null, 2));
  
  // 反序列化
  const deserialized = Block.deserialize(data);
  console.log('反序列化成功:', deserialized.getType() === cloned.getType());
  console.log('形状一致:', JSON.stringify(deserialized.getShape()) === JSON.stringify(cloned.getShape()));
}

// 示例 4: 使用 BlockGenerator 生成随机方块
function example4_BlockGeneration() {
  console.log('\n=== 示例 4: 使用 BlockGenerator 生成随机方块 ===');
  
  // 创建默认生成器（无种子）
  const generator = createDefaultGenerator();
  
  console.log('生成 5 个随机方块:');
  const blocks = generator.generateMultiple(5);
  blocks.forEach((block, index) => {
    console.log(`  方块 ${index + 1}: ${block.getType()}, 格子数: ${block.getCellCount()}`);
  });
  
  // 生成指定类型的方块
  console.log('\n生成指定类型:');
  const specificBlock = generator.generateType(BlockType.L_LARGE);
  console.log('指定类型方块:', specificBlock.getType());
}

// 示例 5: 使用种子生成确定性序列
function example5_SeededGeneration() {
  console.log('\n=== 示例 5: 使用种子生成确定性序列 ===');
  
  // 使用相同种子创建两个生成器
  const gen1 = createTestGenerator(12345);
  const gen2 = createTestGenerator(12345);
  
  console.log('生成器 1 的序列:');
  const sequence1 = gen1.generateMultiple(5);
  sequence1.forEach((block, i) => {
    console.log(`  ${i + 1}. ${block.getType()}`);
  });
  
  console.log('\n生成器 2 的序列（相同种子）:');
  const sequence2 = gen2.generateMultiple(5);
  sequence2.forEach((block, i) => {
    console.log(`  ${i + 1}. ${block.getType()}`);
  });
  
  // 验证序列相同
  const allSame = sequence1.every((block, i) => block.getType() === sequence2[i].getType());
  console.log('\n序列是否相同:', allSame);
}

// 示例 6: 限制可生成的方块类型
function example6_LimitedBlockTypes() {
  console.log('\n=== 示例 6: 限制可生成的方块类型 ===');
  
  // 只生成小型方块
  const smallBlockTypes = [
    BlockType.SINGLE,
    BlockType.LINE_2,
    BlockType.LINE_3,
    BlockType.L_SMALL
  ];
  
  const generator = new BlockGenerator({
    seed: 999,
    blockTypes: smallBlockTypes
  });
  
  console.log('可用类型:', generator.getAvailableTypes());
  console.log('\n生成 10 个小型方块:');
  
  const blocks = generator.generateMultiple(10);
  const typeCounts = new Map<BlockType, number>();
  
  blocks.forEach(block => {
    const type = block.getType();
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  });
  
  console.log('类型分布:');
  typeCounts.forEach((count, type) => {
    console.log(`  ${type}: ${count} 个`);
  });
}

// 示例 7: 在棋盘上放置生成的方块
function example7_PlaceBlocksOnBoard() {
  console.log('\n=== 示例 7: 在棋盘上放置生成的方块 ===');
  
  const board = new Board();
  const generator = createTestGenerator(777);
  
  console.log('尝试放置 5 个随机方块:');
  
  for (let i = 0; i < 5; i++) {
    const block = generator.generate();
    console.log(`\n方块 ${i + 1}: ${block.getType()}`);
    
    // 尝试在不同位置放置
    let placed = false;
    for (let row = 0; row < 9 && !placed; row++) {
      for (let col = 0; col < 9 && !placed; col++) {
        const positions = block.getAbsolutePositions(row, col);
        if (board.canPlaceBlock(positions)) {
          board.placeBlock(positions);
          console.log(`  成功放置在 (${row}, ${col})`);
          placed = true;
        }
      }
    }
    
    if (!placed) {
      console.log('  无法找到合适位置');
    }
  }
  
  console.log('\n棋盘占用格子数:', board.getOccupiedCount(), '/ 81');
  
  // 检测满行满列
  const fullRows = board.getFullRows();
  const fullCols = board.getFullColumns();
  
  if (fullRows.length > 0) {
    console.log('满行:', fullRows);
  }
  if (fullCols.length > 0) {
    console.log('满列:', fullCols);
  }
}

// 示例 8: 旋转方块以适应空间
function example8_RotateToFit() {
  console.log('\n=== 示例 8: 旋转方块以适应空间 ===');
  
  const board = new Board();
  
  // 在左上角占用一些空间
  board.setCell(0, 1, true);
  board.setCell(0, 2, true);
  
  const line = Block.createBlock(BlockType.LINE_3);
  console.log('原始直线边界:', line.getBounds());
  
  // 尝试水平放置
  let horizontal = line.getAbsolutePositions(0, 0);
  console.log('水平放置可行:', board.canPlaceBlock(horizontal));
  
  // 旋转为垂直
  const rotated = line.rotate();
  console.log('旋转后边界:', rotated.getBounds());
  
  let vertical = rotated.getAbsolutePositions(0, 0);
  console.log('垂直放置可行:', board.canPlaceBlock(vertical));
  
  if (board.canPlaceBlock(vertical)) {
    board.placeBlock(vertical);
    console.log('成功放置垂直直线');
  }
}

// 示例 9: 统计所有方块类型的特性
function example9_BlockStatistics() {
  console.log('\n=== 示例 9: 统计所有方块类型的特性 ===');
  
  const allTypes = [
    BlockType.SINGLE,
    BlockType.LINE_2,
    BlockType.LINE_3,
    BlockType.LINE_4,
    BlockType.LINE_5,
    BlockType.SQUARE_2X2,
    BlockType.SQUARE_3X3,
    BlockType.L_SMALL,
    BlockType.L_MEDIUM,
    BlockType.L_LARGE,
    BlockType.T_SHAPE
  ];
  
  console.log('类型\t\t格子数\t宽度x高度');
  console.log('─'.repeat(50));
  
  allTypes.forEach(type => {
    const block = Block.createBlock(type);
    const bounds = block.getBounds();
    console.log(
      `${type.padEnd(16)}\t${block.getCellCount()}\t${bounds.width}x${bounds.height}`
    );
  });
}

// 运行所有示例
if (require.main === module) {
  example1_BasicBlockOperations();
  example2_BlockRotation();
  example3_CloneAndSerialize();
  example4_BlockGeneration();
  example5_SeededGeneration();
  example6_LimitedBlockTypes();
  example7_PlaceBlocksOnBoard();
  example8_RotateToFit();
  example9_BlockStatistics();
  
  console.log('\n=== 所有示例运行完成 ===');
}
