/**
 * UI 组件使用示例
 * 
 * 本文件展示如何在代码中使用 UI 组件
 * 注意：这只是示例代码，实际使用时需要在 Cocos Creator 场景中配置
 */

import { GameSession } from '../assets/scripts/core/GameSession';
import { Block } from '../assets/scripts/core/Block';

/**
 * 使用示例 1：手动创建游戏会话并进行游戏
 */
function exampleGameFlow() {
    console.log('=== Block9x9 UI 组件使用示例 ===\n');

    // 1. 创建游戏会话
    const gameSession = new GameSession();
    console.log('游戏会话已创建');

    // 2. 开始游戏
    gameSession.start();
    console.log('游戏已开始');
    console.log(`初始状态: 分数=${gameSession.getTotalScore()}, 步数=${gameSession.getMoveCount()}\n`);

    // 3. 查看候选块
    const candidates = gameSession.getCandidates();
    console.log('当前候选块:');
    candidates.forEach((block, index) => {
        if (block) {
            console.log(`  候选块 ${index}: ${block.getType()}, 格子数=${block.getCellCount()}`);
        }
    });
    console.log();

    // 4. 尝试放置第一个候选块
    const firstBlock = candidates[0];
    if (firstBlock) {
        console.log(`尝试放置候选块 0 (${firstBlock.getType()}) 到位置 (0, 0)...`);
        
        const result = gameSession.placeCandidate(0, 0, 0);
        
        if (result.success) {
            console.log('✓ 放置成功！');
            console.log(`  获得分数: +${result.score}`);
            console.log(`  消除行数: ${result.clearedRows.length}`);
            console.log(`  消除列数: ${result.clearedColumns.length}`);
            console.log(`  当前总分: ${gameSession.getTotalScore()}`);
            console.log(`  游戏结束: ${result.gameOver ? '是' : '否'}`);
        } else {
            console.log(`✗ 放置失败: ${result.reason}`);
        }
    }

    console.log('\n游戏状态:', gameSession.getGameState());
    console.log('最终分数:', gameSession.getTotalScore());
    console.log('总步数:', gameSession.getMoveCount());
}

/**
 * 使用示例 2：模拟 UI 组件的更新流程
 */
function exampleUIUpdate() {
    console.log('\n=== UI 组件更新流程示例 ===\n');

    const gameSession = new GameSession();
    gameSession.start();

    // 模拟 BoardView 更新
    console.log('1. BoardView 更新:');
    const board = gameSession.getBoard();
    const boardState = board.getState();
    console.log(`   棋盘大小: ${board.getSize()}x${board.getSize()}`);
    console.log(`   已占用格子数: ${board.getOccupiedCount()}`);

    // 模拟 CandidateView 更新
    console.log('\n2. CandidateView 更新:');
    const candidates = gameSession.getCandidates();
    candidates.forEach((block, index) => {
        if (block) {
            const bounds = block.getBounds();
            console.log(`   候选块 ${index}:`);
            console.log(`     类型: ${block.getType()}`);
            console.log(`     大小: ${bounds.width}x${bounds.height}`);
            console.log(`     格子数: ${block.getCellCount()}`);
        }
    });

    // 模拟 ScoreHUD 更新
    console.log('\n3. ScoreHUD 更新:');
    console.log(`   分数: ${gameSession.getTotalScore()}`);
    console.log(`   步数: ${gameSession.getMoveCount()}`);

    // 模拟放置操作
    const result = gameSession.placeCandidate(0, 0, 0);
    if (result.success) {
        console.log('\n4. 放置后 UI 更新:');
        console.log(`   分数: ${gameSession.getTotalScore()} (+${result.score})`);
        console.log(`   步数: ${gameSession.getMoveCount()}`);
        console.log(`   已占用格子数: ${board.getOccupiedCount()}`);
    }
}

/**
 * 使用示例 3：检查游戏结束条件
 */
function exampleGameOver() {
    console.log('\n=== 游戏结束检测示例 ===\n');

    // 创建一个固定种子的游戏，便于测试
    const gameSession = new GameSession({ seed: 12345 });
    gameSession.start();

    console.log('尝试多次放置直到游戏结束...');
    
    let moveCount = 0;
    const maxMoves = 100; // 防止无限循环

    while (!gameSession.isGameOver() && moveCount < maxMoves) {
        const candidates = gameSession.getCandidates();
        
        // 尝试放置第一个可放置的候选块
        let placed = false;
        for (let i = 0; i < candidates.length && !placed; i++) {
            const candidate = candidates[i];
            if (!candidate) continue;

            // 尝试在棋盘上找一个可以放置的位置
            for (let row = 0; row < 9 && !placed; row++) {
                for (let col = 0; col < 9 && !placed; col++) {
                    if (gameSession.canPlaceCandidate(i, row, col)) {
                        const result = gameSession.placeCandidate(i, row, col);
                        if (result.success) {
                            placed = true;
                            moveCount++;
                            
                            if (result.clearedRows.length > 0 || result.clearedColumns.length > 0) {
                                console.log(`步数 ${moveCount}: 放置并消除了 ${result.clearedRows.length} 行 ${result.clearedColumns.length} 列, +${result.score} 分`);
                            }
                        }
                    }
                }
            }
        }

        if (!placed) {
            console.log('无法找到可放置的位置');
            break;
        }
    }

    console.log('\n游戏结束！');
    console.log(`最终分数: ${gameSession.getTotalScore()}`);
    console.log(`总步数: ${gameSession.getMoveCount()}`);
    console.log(`游戏状态: ${gameSession.getGameState()}`);
}

/**
 * 运行所有示例
 */
function runAllExamples() {
    exampleGameFlow();
    exampleUIUpdate();
    exampleGameOver();
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
    runAllExamples();
}

export {
    exampleGameFlow,
    exampleUIUpdate,
    exampleGameOver,
    runAllExamples
};
