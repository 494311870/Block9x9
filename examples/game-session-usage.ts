/**
 * CandidateQueue 和 GameSession 使用示例
 * 演示候选块队列与完整游戏流程的使用
 */

import { GameSession, GameState } from '../assets/scripts/core/GameSession';
import { CandidateQueue } from '../assets/scripts/core/CandidateQueue';
import { BlockGenerator } from '../assets/scripts/core/BlockGenerator';
import { BlockType } from '../assets/scripts/core/Block';

console.log('=== Block9x9 候选块队列与游戏会话示例 ===\n');

// ===== 第一部分：CandidateQueue 基础用法 =====
console.log('【第一部分】CandidateQueue 基础用法\n');

// 1. 创建候选队列
console.log('1. 创建候选队列');
const generator = new BlockGenerator({ seed: 12345 });
const queue = new CandidateQueue(generator, { capacity: 3 });

console.log(`   队列容量: ${queue.getCapacity()}`);
console.log(`   自动补充: ${queue.isAutoRefillEnabled() ? '启用' : '禁用'}`);
console.log(`   当前候选数: ${queue.getCount()}\n`);

// 2. 查看所有候选块
console.log('2. 查看所有候选块');
const candidates = queue.getAllCandidates();
candidates.forEach((block, index) => {
  if (block) {
    console.log(`   [${index}] ${block.getType()} - ${block.getCellCount()}格`);
  }
});
console.log();

// 3. 选择并使用候选块
console.log('3. 选择第一个候选块');
const selected = queue.selectCandidate(0);
if (selected) {
  console.log(`   选中: ${selected.getType()}`);
  console.log(`   自动补充后队列状态: ${queue.isFull() ? '已满' : '未满'}`);
}
console.log();

// 4. 手动管理候选块
console.log('4. 禁用自动补充，手动管理');
queue.setAutoRefill(false);
queue.selectCandidate(1);
console.log(`   选择候选块后: ${queue.getCount()} 个候选块`);

queue.refillSlot(1);
console.log(`   手动补充后: ${queue.getCount()} 个候选块`);

queue.setAutoRefill(true);
console.log();

// ===== 第二部分：GameSession 完整游戏流程 =====
console.log('【第二部分】GameSession 完整游戏流程\n');

// 1. 创建并启动游戏会话
console.log('1. 创建并启动游戏');
const session = new GameSession({ seed: 12345 });

console.log(`   初始状态: ${session.getGameState()}`);
console.log(`   初始分数: ${session.getTotalScore()}`);
console.log(`   初始步数: ${session.getMoveCount()}`);

session.start();
console.log(`   游戏状态: ${session.getGameState()}`);
console.log();

// 2. 查看当前候选块
console.log('2. 当前可用的候选块');
const gameCandidates = session.getCandidates();
gameCandidates.forEach((block, index) => {
  if (block) {
    const bounds = block.getBounds();
    console.log(`   [${index}] ${block.getType()} (${bounds.width}×${bounds.height}, ${block.getCellCount()}格)`);
  }
});
console.log();

// 3. 检查放置可能性
console.log('3. 检查候选块 [0] 的放置可能性');
const testPositions = [
  { row: 0, col: 0 },
  { row: 4, col: 4 },
  { row: 8, col: 8 }
];

testPositions.forEach(pos => {
  const canPlace = session.canPlaceCandidate(0, pos.row, pos.col);
  console.log(`   位置 (${pos.row}, ${pos.col}): ${canPlace ? '✓ 可放置' : '✗ 不可放置'}`);
});
console.log();

// 4. 执行第一次放置
console.log('4. 放置第一个候选块');
const result1 = session.placeCandidate(0, 0, 0);

console.log(`   放置结果: ${result1.success ? '成功' : '失败'}`);
if (result1.success) {
  console.log(`   获得分数: ${result1.score}`);
  console.log(`   消除行数: ${result1.clearedRows.length}`);
  console.log(`   消除列数: ${result1.clearedColumns.length}`);
  console.log(`   游戏结束: ${result1.gameOver ? '是' : '否'}`);
}
console.log(`   当前总分: ${session.getTotalScore()}`);
console.log(`   当前步数: ${session.getMoveCount()}`);
console.log(`   棋盘占用: ${session.getBoard().getOccupiedCount()} / 81 格`);
console.log();

// 5. 连续放置多个候选块
console.log('5. 连续放置候选块');
const placements = [
  { index: 0, row: 2, col: 2, desc: '第二个候选块' },
  { index: 1, row: 4, col: 4, desc: '第三个候选块' },
  { index: 2, row: 6, col: 6, desc: '第四个候选块' }
];

placements.forEach(placement => {
  const result = session.placeCandidate(placement.index, placement.row, placement.col);
  if (result.success) {
    console.log(`   ${placement.desc} → 成功 (+${result.score}分)`);
  } else {
    console.log(`   ${placement.desc} → 失败 (${result.reason})`);
  }
});

console.log(`   累计得分: ${session.getTotalScore()}`);
console.log(`   累计步数: ${session.getMoveCount()}`);
console.log();

// 6. 演示消除功能
console.log('6. 演示行列消除');
const demoSession = new GameSession({ seed: 99999 });
demoSession.start();

// 准备一行，只留最后一格
const board = demoSession.getBoard();
for (let col = 0; col < 8; col++) {
  board.setCell(0, col, true);
}
console.log(`   准备阶段: 第 0 行已填充 8 格`);

// 尝试放置候选块完成这一行
const clearResult = demoSession.placeCandidate(0, 0, 8);
if (clearResult.success) {
  console.log(`   放置结果: 成功`);
  console.log(`   消除的行: [${clearResult.clearedRows}]`);
  console.log(`   获得分数: ${clearResult.score}`);
  
  if (clearResult.clearedRows.length > 0) {
    console.log(`   ⭐ 成功触发消除！`);
  }
}
console.log();

// 7. 游戏状态管理
console.log('7. 游戏状态管理');
console.log(`   是否游戏中: ${session.isPlaying() ? '是' : '否'}`);
console.log(`   是否结束: ${session.isGameOver() ? '是' : '否'}`);
console.log(`   当前状态: ${session.getGameState()}`);
console.log();

// 8. 重置游戏
console.log('8. 重置游戏');
console.log(`   重置前 - 分数: ${session.getTotalScore()}, 步数: ${session.getMoveCount()}`);

session.reset();

console.log(`   重置后 - 分数: ${session.getTotalScore()}, 步数: ${session.getMoveCount()}`);
console.log(`   游戏状态: ${session.getGameState()}`);
console.log(`   棋盘占用: ${session.getBoard().getOccupiedCount()} 格`);
console.log(`   候选块数: ${session.getCandidateQueue().getCount()}`);
console.log();

// 9. 可重现的游戏（使用种子）
console.log('9. 使用种子实现可重现的游戏');
const game1 = new GameSession({ seed: 77777 });
const game2 = new GameSession({ seed: 77777 });

game1.start();
game2.start();

console.log(`   游戏1 候选块: ${game1.getCandidates().map(b => b?.getType()).join(', ')}`);
console.log(`   游戏2 候选块: ${game2.getCandidates().map(b => b?.getType()).join(', ')}`);
console.log(`   候选块序列相同: ${
  JSON.stringify(game1.getCandidates().map(b => b?.getType())) === 
  JSON.stringify(game2.getCandidates().map(b => b?.getType())) ? '是' : '否'
}`);
console.log();

// 10. 完整游戏模拟
console.log('10. 完整游戏模拟');
const fullGame = new GameSession({ seed: 55555 });
fullGame.start();

console.log(`   开始游戏...`);
console.log();

let moveNum = 1;
let continueGame = true;

// 模拟10步游戏
while (continueGame && moveNum <= 10) {
  // 尝试放置第一个候选块到不同位置
  let placed = false;
  
  for (let row = 0; row < 9 && !placed; row++) {
    for (let col = 0; col < 9 && !placed; col++) {
      if (fullGame.canPlaceCandidate(0, row, col)) {
        const result = fullGame.placeCandidate(0, row, col);
        if (result.success) {
          const block = fullGame.getCandidate(0);
          console.log(`   第 ${moveNum} 步: 放置 ${block?.getType() || '???'} 到 (${row},${col})`);
          console.log(`           得分: +${result.score} (总分: ${fullGame.getTotalScore()})`);
          
          if (result.clearedRows.length > 0 || result.clearedColumns.length > 0) {
            console.log(`           ⭐ 消除 ${result.clearedRows.length} 行 ${result.clearedColumns.length} 列`);
          }
          
          if (result.gameOver) {
            console.log(`           ⚠️  游戏结束！`);
            continueGame = false;
          }
          
          placed = true;
          moveNum++;
        }
      }
    }
  }
  
  if (!placed) {
    console.log(`   无法放置候选块，游戏结束`);
    break;
  }
}

console.log();
console.log(`   游戏统计:`);
console.log(`     - 总步数: ${fullGame.getMoveCount()}`);
console.log(`     - 总得分: ${fullGame.getTotalScore()}`);
console.log(`     - 棋盘占用: ${fullGame.getBoard().getOccupiedCount()} / 81 格`);
console.log(`     - 占用率: ${(fullGame.getBoard().getOccupiedCount() / 81 * 100).toFixed(1)}%`);
console.log(`     - 游戏状态: ${fullGame.getGameState()}`);

console.log('\n=== 示例结束 ===');
