/**
 * Board 类使用示例
 * 演示如何使用 Board 类进行基本操作
 */

import { Board } from '../assets/scripts/core/Board';

// 示例 1: 基本操作
function example1_BasicOperations() {
  console.log('=== 示例 1: 基本操作 ===');
  const board = new Board();
  
  // 检查初始状态
  console.log('棋盘大小:', board.getSize());
  console.log('初始占用数:', board.getOccupiedCount());
  
  // 放置单个格子
  board.setCell(0, 0, true);
  board.setCell(0, 1, true);
  console.log('放置两个格子后，占用数:', board.getOccupiedCount());
  
  // 重置棋盘
  board.reset();
  console.log('重置后，占用数:', board.getOccupiedCount());
}

// 示例 2: 放置方块
function example2_PlaceBlock() {
  console.log('\n=== 示例 2: 放置方块 ===');
  const board = new Board();
  
  // 定义一个 L 形方块
  const lBlock = [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
    { row: 2, col: 1 }
  ];
  
  // 检查是否可以放置
  if (board.canPlaceBlock(lBlock)) {
    console.log('可以放置 L 形方块');
    board.placeBlock(lBlock);
    console.log('放置后，占用数:', board.getOccupiedCount());
  }
  
  // 尝试在已占用位置放置
  const overlappingBlock = [
    { row: 0, col: 0 },  // 已被占用
    { row: 0, col: 1 }
  ];
  
  if (!board.canPlaceBlock(overlappingBlock)) {
    console.log('无法放置重叠方块（符合预期）');
  }
}

// 示例 3: 检测和清除满行满列
function example3_FullRowsAndColumns() {
  console.log('\n=== 示例 3: 检测和清除满行满列 ===');
  const board = new Board();
  
  // 填满第 0 行
  console.log('填满第 0 行...');
  for (let col = 0; col < 9; col++) {
    board.setCell(0, col, true);
  }
  
  // 检测满行
  const fullRows = board.getFullRows();
  console.log('满行:', fullRows); // 应该是 [0]
  
  // 填满第 0 列
  console.log('填满第 0 列...');
  for (let row = 0; row < 9; row++) {
    board.setCell(row, 0, true);
  }
  
  // 检测满列
  const fullCols = board.getFullColumns();
  console.log('满列:', fullCols); // 应该是 [0]
  
  // 清除满行满列
  console.log('清除前，占用数:', board.getOccupiedCount());
  board.clearRows(fullRows);
  board.clearColumns(fullCols);
  console.log('清除后，占用数:', board.getOccupiedCount());
}

// 示例 4: 游戏流程模拟
function example4_GameFlow() {
  console.log('\n=== 示例 4: 游戏流程模拟 ===');
  const board = new Board();
  
  // 玩家放置第一个方块（直线）
  const line1 = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 }
  ];
  board.placeBlock(line1);
  console.log('放置直线 1，占用数:', board.getOccupiedCount());
  
  // 玩家放置第二个方块（直线）
  const line2 = [
    { row: 0, col: 3 },
    { row: 0, col: 4 },
    { row: 0, col: 5 }
  ];
  board.placeBlock(line2);
  console.log('放置直线 2，占用数:', board.getOccupiedCount());
  
  // 玩家放置第三个方块（直线）- 填满第 0 行
  const line3 = [
    { row: 0, col: 6 },
    { row: 0, col: 7 },
    { row: 0, col: 8 }
  ];
  board.placeBlock(line3);
  console.log('放置直线 3，占用数:', board.getOccupiedCount());
  
  // 检测并清除满行
  const fullRows = board.getFullRows();
  if (fullRows.length > 0) {
    console.log('检测到满行:', fullRows);
    board.clearRows(fullRows);
    console.log('清除满行后，占用数:', board.getOccupiedCount());
    console.log('得分: +', fullRows.length * 10); // 每行 10 分
  }
}

// 示例 5: 获取棋盘状态
function example5_GetState() {
  console.log('\n=== 示例 5: 获取棋盘状态 ===');
  const board = new Board();
  
  // 放置一些方块
  board.setCell(0, 0, true);
  board.setCell(1, 1, true);
  board.setCell(2, 2, true);
  
  // 获取状态（深拷贝）
  const state = board.getState();
  console.log('棋盘是', state.length, 'x', state[0].length, '的矩阵');
  console.log('左上角 (0,0):', state[0][0] ? '占用' : '空闲');
  console.log('中间 (1,1):', state[1][1] ? '占用' : '空闲');
  console.log('对角线 (2,2):', state[2][2] ? '占用' : '空闲');
  console.log('右下角 (8,8):', state[8][8] ? '占用' : '空闲');
  
  // 修改返回的状态不会影响原始棋盘
  state[0][0] = false;
  console.log('修改返回的 state 后，原棋盘 (0,0):', board.getCell(0, 0) ? '占用' : '空闲');
}

// 运行所有示例
if (require.main === module) {
  example1_BasicOperations();
  example2_PlaceBlock();
  example3_FullRowsAndColumns();
  example4_GameFlow();
  example5_GetState();
  
  console.log('\n=== 所有示例运行完成 ===');
}
