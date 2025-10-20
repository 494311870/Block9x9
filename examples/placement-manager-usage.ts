/**
 * PlacementManager 使用示例
 * 演示如何使用 PlacementManager 管理方块放置、消除和计分
 */

import { Board } from '../assets/scripts/core/Board';
import { Block, BlockType } from '../assets/scripts/core/Block';
import { PlacementManager } from '../assets/scripts/core/PlacementManager';

console.log('=== Block9x9 PlacementManager 使用示例 ===\n');

// 1. 创建棋盘和放置管理器
console.log('1. 初始化棋盘和管理器');
const board = new Board();
const manager = new PlacementManager(board);

console.log(`   棋盘大小: ${board.getSize()}x${board.getSize()}`);
console.log(`   初始占用: ${board.getOccupiedCount()} 格\n`);

// 2. 放置第一个方块 - 基础示例
console.log('2. 放置单格方块');
const singleBlock = Block.createBlock(BlockType.SINGLE);
const singlePos = singleBlock.getAbsolutePositions(4, 4);
const result1 = manager.place(singlePos);

console.log(`   放置结果: ${result1.success ? '成功' : '失败'}`);
console.log(`   得分: ${result1.score}`);
console.log(`   棋盘占用: ${board.getOccupiedCount()} 格\n`);

// 3. 放置直线方块
console.log('3. 放置 3 格直线方块');
const lineBlock = Block.createBlock(BlockType.LINE_3);
const linePos = lineBlock.getAbsolutePositions(0, 0);
const result2 = manager.place(linePos);

console.log(`   放置结果: ${result2.success ? '成功' : '失败'}`);
console.log(`   得分: ${result2.score} (3格 × 1分/格)`);
console.log(`   棋盘占用: ${board.getOccupiedCount()} 格\n`);

// 4. 演示放置失败
console.log('4. 尝试放置到已占用位置（应该失败）');
const failPos = singleBlock.getAbsolutePositions(4, 4); // 与第一个方块重叠
const result3 = manager.place(failPos);

console.log(`   放置结果: ${result3.success ? '成功' : '失败'}`);
if (!result3.success) {
  console.log(`   失败原因: ${result3.reason}`);
}
console.log(`   得分: ${result3.score}`);
console.log(`   棋盘占用: ${board.getOccupiedCount()} 格（未变化）\n`);

// 5. 演示消除行
console.log('5. 演示消除满行');
board.reset(); // 重置棋盘

// 填满第 0 行的前 8 格
for (let col = 0; col < 8; col++) {
  board.setCell(0, col, true);
}
console.log(`   准备阶段: 第 0 行已填充 8 格`);

// 放置最后一格触发消除
const triggerBlock = Block.createBlock(BlockType.SINGLE);
const triggerPos = triggerBlock.getAbsolutePositions(0, 8);
const result4 = manager.place(triggerPos);

console.log(`   放置结果: ${result4.success ? '成功' : '失败'}`);
console.log(`   消除的行: [${result4.clearedRows}]`);
console.log(`   得分: ${result4.score} = 1(放置) + 10(消行)`);
console.log(`   棋盘占用: ${board.getOccupiedCount()} 格（行已被清除）\n`);

// 6. 演示连消奖励
console.log('6. 演示连消奖励（同时消除多行）');
board.reset();

// 准备 3 行，各留最后一格
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 8; col++) {
    board.setCell(row, col, true);
  }
}
console.log(`   准备阶段: 3 行各填充 8 格`);

// 放置垂直 3 格方块完成 3 行
const verticalBlock = Block.createBlock(BlockType.LINE_3).rotate();
const verticalPos = verticalBlock.getAbsolutePositions(0, 8);
const result5 = manager.place(verticalPos);

console.log(`   放置结果: ${result5.success ? '成功' : '失败'}`);
console.log(`   消除的行: [${result5.clearedRows}]`);
console.log(`   得分明细:`);
console.log(`     - 放置分: 3 (3格 × 1)`);
console.log(`     - 消除分: 30 (3行 × 10)`);
console.log(`     - 连消奖励: 30 (30 × (3-1) × 0.5)`);
console.log(`     - 总分: ${result5.score}`);
console.log(`   棋盘占用: ${board.getOccupiedCount()} 格\n`);

// 7. 演示同时消除行和列
console.log('7. 演示同时消除行和列');
board.reset();

// 填满第 4 行（除了中心点 4,4）
for (let col = 0; col < 9; col++) {
  if (col !== 4) {
    board.setCell(4, col, true);
  }
}

// 填满第 4 列（除了中心点 4,4）
for (let row = 0; row < 9; row++) {
  if (row !== 4) {
    board.setCell(row, 4, true);
  }
}

console.log(`   准备阶段: 第 4 行和第 4 列各填充 8 格（留中心点）`);

// 放置中心点，同时完成行和列
const centerBlock = Block.createBlock(BlockType.SINGLE);
const centerPos = centerBlock.getAbsolutePositions(4, 4);
const result6 = manager.place(centerPos);

console.log(`   放置结果: ${result6.success ? '成功' : '失败'}`);
console.log(`   消除的行: [${result6.clearedRows}]`);
console.log(`   消除的列: [${result6.clearedColumns}]`);
console.log(`   得分明细:`);
console.log(`     - 放置分: 1`);
console.log(`     - 消除分: 20 (2条线 × 10)`);
console.log(`     - 连消奖励: 10 (20 × (2-1) × 0.5)`);
console.log(`     - 总分: ${result6.score}`);
console.log(`   棋盘占用: ${board.getOccupiedCount()} 格\n`);

// 8. 自定义得分配置
console.log('8. 使用自定义得分配置');
board.reset();

const customManager = new PlacementManager(board, {
  cellPlacementScore: 5,    // 每格 5 分
  lineScore: 50,            // 每行/列 50 分
  comboMultiplier: 2.0      // 连消系数 2.0
});

const config = customManager.getScoreConfig();
console.log(`   配置: 格分=${config.cellPlacementScore}, 行分=${config.lineScore}, 连消=${config.comboMultiplier}`);

const customBlock = Block.createBlock(BlockType.SQUARE_2X2);
const customPos = customBlock.getAbsolutePositions(0, 0);
const result7 = customManager.place(customPos);

console.log(`   放置 2×2 方块 (4格)`);
console.log(`   得分: ${result7.score} (4格 × 5分/格 = 20)`);
console.log();

// 9. 预测得分（使用 calculateScore）
console.log('9. 预测得分功能');
const predictScore1 = manager.calculateScore(5, 2, 1);
console.log(`   预测: 放置5格 + 消2行1列 = ${predictScore1}分`);
console.log(`     计算: 5 + (3×10) + (30×(3-1)×0.5) = 5 + 30 + 30 = 65`);

const predictScore2 = manager.calculateScore(9, 0, 0);
console.log(`   预测: 放置9格 + 不消除 = ${predictScore2}分`);
console.log();

// 10. 游戏场景模拟
console.log('10. 完整游戏流程模拟');
board.reset();
let totalScore = 0;
let moves = 0;

console.log('   开始游戏...\n');

// 第一步：放置 L 形方块
const move1 = Block.createBlock(BlockType.L_SMALL);
const move1Pos = move1.getAbsolutePositions(0, 0);
const move1Result = manager.place(move1Pos);
totalScore += move1Result.score;
moves++;
console.log(`   第 ${moves} 步: 放置 L 形方块 → 得分 ${move1Result.score} (总分: ${totalScore})`);

// 第二步：放置直线方块
const move2 = Block.createBlock(BlockType.LINE_4);
const move2Pos = move2.getAbsolutePositions(2, 0);
const move2Result = manager.place(move2Pos);
totalScore += move2Result.score;
moves++;
console.log(`   第 ${moves} 步: 放置直线方块 → 得分 ${move2Result.score} (总分: ${totalScore})`);

// 第三步：放置方块方块
const move3 = Block.createBlock(BlockType.SQUARE_2X2);
const move3Pos = move3.getAbsolutePositions(4, 4);
const move3Result = manager.place(move3Pos);
totalScore += move3Result.score;
moves++;
console.log(`   第 ${moves} 步: 放置 2×2 方块 → 得分 ${move3Result.score} (总分: ${totalScore})`);

console.log(`\n   游戏统计:`);
console.log(`     - 总步数: ${moves}`);
console.log(`     - 总得分: ${totalScore}`);
console.log(`     - 棋盘占用: ${board.getOccupiedCount()} / 81 格`);
console.log(`     - 占用率: ${(board.getOccupiedCount() / 81 * 100).toFixed(1)}%`);

console.log('\n=== 示例结束 ===');
