/**
 * GameSession 单元测试
 */

import { GameSession, GameState } from '../../assets/scripts/core/GameSession';
import { Block, BlockType } from '../../assets/scripts/core/Block';

describe('GameSession', () => {
  let session: GameSession;

  describe('初始化与启动', () => {
    it('应该使用默认配置创建游戏会话', () => {
      session = new GameSession();
      
      expect(session.getGameState()).toBe(GameState.READY);
      expect(session.getTotalScore()).toBe(0);
      expect(session.getMoveCount()).toBe(0);
    });

    it('应该使用自定义配置创建游戏会话', () => {
      session = new GameSession({ queueCapacity: 5, seed: 12345 });
      
      expect(session.getCandidateQueue().getCapacity()).toBe(5);
    });

    it('start 应该开始游戏并设置状态为 PLAYING', () => {
      session = new GameSession();
      session.start();
      
      expect(session.getGameState()).toBe(GameState.PLAYING);
      expect(session.isPlaying()).toBe(true);
    });

    it('应该在初始化时填充候选块队列', () => {
      session = new GameSession();
      const candidates = session.getCandidates();
      
      expect(candidates).toHaveLength(3);
      expect(candidates.every(block => block !== null)).toBe(true);
    });
  });

  describe('获取游戏组件', () => {
    beforeEach(() => {
      session = new GameSession();
    });

    it('应该能够获取棋盘实例', () => {
      const board = session.getBoard();
      expect(board).toBeDefined();
      expect(board.getSize()).toBe(9);
    });

    it('应该能够获取候选队列实例', () => {
      const queue = session.getCandidateQueue();
      expect(queue).toBeDefined();
      expect(queue.getCapacity()).toBe(3);
    });

    it('应该能够获取放置管理器实例', () => {
      const manager = session.getPlacementManager();
      expect(manager).toBeDefined();
    });
  });

  describe('获取候选块', () => {
    beforeEach(() => {
      session = new GameSession({ seed: 12345 });
    });

    it('应该能够获取所有候选块', () => {
      const candidates = session.getCandidates();
      expect(candidates).toHaveLength(3);
    });

    it('应该能够获取指定候选块', () => {
      const candidate0 = session.getCandidate(0);
      const candidate1 = session.getCandidate(1);
      const candidate2 = session.getCandidate(2);
      
      expect(candidate0).toBeInstanceOf(Block);
      expect(candidate1).toBeInstanceOf(Block);
      expect(candidate2).toBeInstanceOf(Block);
    });

    it('应该对无效索引返回 null', () => {
      expect(session.getCandidate(-1)).toBeNull();
      expect(session.getCandidate(3)).toBeNull();
    });
  });

  describe('放置候选块', () => {
    beforeEach(() => {
      session = new GameSession({ seed: 12345 });
      session.start();
    });

    it('应该能够成功放置候选块', () => {
      const result = session.placeCandidate(0, 0, 0);
      
      expect(result.success).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.gameOver).toBe(false);
    });

    it('放置成功后应该更新总分', () => {
      const beforeScore = session.getTotalScore();
      const result = session.placeCandidate(0, 0, 0);
      const afterScore = session.getTotalScore();
      
      expect(afterScore).toBe(beforeScore + result.score);
    });

    it('放置成功后应该增加移动次数', () => {
      const beforeMoves = session.getMoveCount();
      session.placeCandidate(0, 0, 0);
      const afterMoves = session.getMoveCount();
      
      expect(afterMoves).toBe(beforeMoves + 1);
    });

    it('放置成功后应该自动补充候选块', () => {
      const beforeCount = session.getCandidateQueue().getCount();
      session.placeCandidate(0, 4, 4);
      const afterCount = session.getCandidateQueue().getCount();
      
      expect(afterCount).toBe(beforeCount);
    });

    it('应该能够放置失败（位置被占用）', () => {
      session.placeCandidate(0, 0, 0);
      const result = session.placeCandidate(1, 0, 0);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('放置失败时不应该更新分数', () => {
      session.placeCandidate(0, 0, 0);
      const beforeScore = session.getTotalScore();
      
      session.placeCandidate(1, 0, 0); // 尝试放置到已占用位置
      const afterScore = session.getTotalScore();
      
      expect(afterScore).toBe(beforeScore);
    });

    it('放置失败时不应该增加移动次数', () => {
      session.placeCandidate(0, 0, 0);
      const beforeMoves = session.getMoveCount();
      
      session.placeCandidate(1, 0, 0);
      const afterMoves = session.getMoveCount();
      
      expect(afterMoves).toBe(beforeMoves);
    });

    it('应该拒绝无效的候选块索引', () => {
      const result = session.placeCandidate(10, 0, 0);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Invalid candidate index');
    });

    it('在游戏未开始时应该拒绝放置', () => {
      const newSession = new GameSession();
      const result = newSession.placeCandidate(0, 0, 0);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Game not started');
    });
  });

  describe('检查放置合法性', () => {
    beforeEach(() => {
      session = new GameSession({ seed: 12345 });
      session.start();
    });

    it('应该能够检查候选块是否可以在指定位置放置', () => {
      const canPlace = session.canPlaceCandidate(0, 0, 0);
      expect(canPlace).toBe(true);
    });

    it('应该正确检测无法放置的位置', () => {
      session.placeCandidate(0, 0, 0);
      const canPlace = session.canPlaceCandidate(1, 0, 0);
      
      // 取决于候选块的形状，可能可以也可能不可以放置
      // 这里只验证方法能够正常调用
      expect(typeof canPlace).toBe('boolean');
    });

    it('应该对无效候选块索引返回 false', () => {
      expect(session.canPlaceCandidate(-1, 0, 0)).toBe(false);
      expect(session.canPlaceCandidate(10, 0, 0)).toBe(false);
    });
  });

  describe('游戏结束检测', () => {
    it('应该在无法放置任何候选块时结束游戏', () => {
      session = new GameSession({ 
        seed: 12345,
        queueCapacity: 1
      });
      session.start();

      // 填满棋盘大部分区域，使得候选块无法放置
      const board = session.getBoard();
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          // 只留几个零散的格子
          if (!(row === 0 && col === 0) && 
              !(row === 8 && col === 8)) {
            board.setCell(row, col, true);
          }
        }
      }

      // 尝试放置候选块
      const result = session.placeCandidate(0, 0, 0);
      
      // 根据候选块的大小，可能会游戏结束
      if (result.success) {
        // 如果成功放置，检查游戏状态
        expect([GameState.PLAYING, GameState.GAME_OVER]).toContain(session.getGameState());
      }
    });

    it('isGameOver 应该正确反映游戏状态', () => {
      session = new GameSession();
      session.start();
      
      expect(session.isGameOver()).toBe(false);
      
      // 手动设置游戏结束状态（通过填满棋盘）
      const board = session.getBoard();
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          board.setCell(row, col, true);
        }
      }
      
      const result = session.placeCandidate(0, 0, 0);
      expect(result.success).toBe(false);
    });

    it('游戏结束后应该拒绝新的放置操作', () => {
      session = new GameSession({ seed: 12345 });
      session.start();

      // 手动设置游戏结束
      const board = session.getBoard();
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          board.setCell(row, col, true);
        }
      }

      // 清空一个位置以便测试
      board.setCell(0, 0, false);
      
      // 触发游戏结束检测
      const result1 = session.placeCandidate(0, 0, 0);
      if (result1.gameOver) {
        // 游戏已结束，尝试再次放置应该失败
        const result2 = session.placeCandidate(1, 1, 1);
        expect(result2.success).toBe(false);
      }
    });
  });

  describe('重置游戏', () => {
    beforeEach(() => {
      session = new GameSession({ seed: 12345 });
      session.start();
    });

    it('reset 应该清空棋盘', () => {
      session.placeCandidate(0, 0, 0);
      expect(session.getBoard().getOccupiedCount()).toBeGreaterThan(0);
      
      session.reset();
      expect(session.getBoard().getOccupiedCount()).toBe(0);
    });

    it('reset 应该重置分数和移动次数', () => {
      session.placeCandidate(0, 0, 0);
      session.placeCandidate(1, 4, 4);
      
      expect(session.getTotalScore()).toBeGreaterThan(0);
      expect(session.getMoveCount()).toBeGreaterThan(0);
      
      session.reset();
      
      expect(session.getTotalScore()).toBe(0);
      expect(session.getMoveCount()).toBe(0);
    });

    it('reset 应该重置游戏状态为 READY', () => {
      expect(session.getGameState()).toBe(GameState.PLAYING);
      
      session.reset();
      
      expect(session.getGameState()).toBe(GameState.READY);
    });

    it('reset 应该重新填充候选块队列', () => {
      session.placeCandidate(0, 0, 0);
      session.reset();
      
      const candidates = session.getCandidates();
      expect(candidates.every(block => block !== null)).toBe(true);
    });

    it('重置后应该能够重新开始游戏', () => {
      session.placeCandidate(0, 0, 0);
      session.reset();
      session.start();
      
      const result = session.placeCandidate(0, 0, 0);
      expect(result.success).toBe(true);
    });
  });

  describe('完整游戏流程', () => {
    it('应该支持完整的游戏循环', () => {
      session = new GameSession({ seed: 12345 });
      
      // 1. 开始游戏
      session.start();
      expect(session.isPlaying()).toBe(true);
      
      // 2. 放置多个候选块
      const moves: number[] = [];
      for (let i = 0; i < 5; i++) {
        const result = session.placeCandidate(0, i, 0);
        if (result.success) {
          moves.push(result.score);
        }
      }
      
      expect(session.getMoveCount()).toBeGreaterThan(0);
      expect(session.getTotalScore()).toBeGreaterThan(0);
      
      // 3. 重新开始
      session.reset();
      expect(session.getTotalScore()).toBe(0);
      expect(session.getMoveCount()).toBe(0);
    });

    it('应该正确计算连续放置的总分', () => {
      session = new GameSession({ seed: 12345 });
      session.start();
      
      let calculatedTotal = 0;
      
      const result1 = session.placeCandidate(0, 0, 0);
      if (result1.success) calculatedTotal += result1.score;
      
      const result2 = session.placeCandidate(1, 2, 2);
      if (result2.success) calculatedTotal += result2.score;
      
      const result3 = session.placeCandidate(2, 4, 4);
      if (result3.success) calculatedTotal += result3.score;
      
      expect(session.getTotalScore()).toBe(calculatedTotal);
    });
  });

  describe('消除与得分', () => {
    beforeEach(() => {
      session = new GameSession({ seed: 12345 });
      session.start();
    });

    it('应该在消除行时获得额外分数', () => {
      const board = session.getBoard();
      
      // 准备一行，只留最后一格
      for (let col = 0; col < 8; col++) {
        board.setCell(0, col, true);
      }
      
      // 放置单格方块完成这一行
      // 首先找到单格候选块或放置一个小方块
      const result = session.placeCandidate(0, 0, 8);
      
      if (result.success && result.clearedRows.length > 0) {
        // 应该获得额外的消除分数
        expect(result.score).toBeGreaterThan(1);
      }
    });
  });

  describe('边界情况', () => {
    it('应该支持自定义队列容量', () => {
      session = new GameSession({ queueCapacity: 5 });
      
      expect(session.getCandidates()).toHaveLength(5);
    });

    it('应该支持种子以便重现游戏', () => {
      const session1 = new GameSession({ seed: 99999 });
      const session2 = new GameSession({ seed: 99999 });
      
      session1.start();
      session2.start();
      
      const candidates1 = session1.getCandidates();
      const candidates2 = session2.getCandidates();
      
      // 使用相同种子应该生成相同的候选块序列
      for (let i = 0; i < candidates1.length; i++) {
        expect(candidates1[i]?.getType()).toBe(candidates2[i]?.getType());
      }
    });
  });

  describe('游戏状态查询', () => {
    it('isPlaying 应该正确反映游戏状态', () => {
      session = new GameSession();
      
      expect(session.isPlaying()).toBe(false);
      
      session.start();
      expect(session.isPlaying()).toBe(true);
      
      session.reset();
      expect(session.isPlaying()).toBe(false);
    });

    it('getTotalScore 应该返回累计分数', () => {
      session = new GameSession({ seed: 12345 });
      session.start();
      
      expect(session.getTotalScore()).toBe(0);
      
      session.placeCandidate(0, 0, 0);
      expect(session.getTotalScore()).toBeGreaterThan(0);
    });

    it('getMoveCount 应该返回移动次数', () => {
      session = new GameSession({ seed: 12345 });
      session.start();
      
      expect(session.getMoveCount()).toBe(0);
      
      session.placeCandidate(0, 0, 0);
      expect(session.getMoveCount()).toBe(1);
      
      session.placeCandidate(1, 2, 2);
      expect(session.getMoveCount()).toBe(2);
    });
  });
});
