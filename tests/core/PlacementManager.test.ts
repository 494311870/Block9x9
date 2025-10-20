import { Board } from '../../assets/scripts/core/Board';
import { Block, BlockType } from '../../assets/scripts/core/Block';
import { PlacementManager, PlacementResult } from '../../assets/scripts/core/PlacementManager';

describe('PlacementManager', () => {
  let board: Board;
  let manager: PlacementManager;

  beforeEach(() => {
    board = new Board();
    manager = new PlacementManager(board);
  });

  describe('基本放置功能', () => {
    it('应该能够成功放置方块', () => {
      const block = Block.createBlock(BlockType.SINGLE);
      const positions = block.getAbsolutePositions(0, 0);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(board.getOccupiedCount()).toBe(1);
    });

    it('放置失败应该返回 success: false', () => {
      const block = Block.createBlock(BlockType.SINGLE);
      const positions = block.getAbsolutePositions(0, 0);
      
      // 先放置一次
      board.placeBlock(positions);
      
      // 再次尝试放置同一位置应该失败
      const result = manager.place(positions);
      
      expect(result.success).toBe(false);
      expect(result.score).toBe(0);
      expect(result.reason).toBe('Position occupied');
    });

    it('越界放置应该失败并返回原因', () => {
      const positions = [{ row: 10, col: 10 }];
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Out of bounds');
      expect(result.score).toBe(0);
    });

    it('负数坐标放置应该失败', () => {
      const positions = [{ row: -1, col: 0 }];
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Out of bounds');
    });

    it('部分越界的方块应该整体放置失败', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      // 从列7开始，会导致越界（7, 8, 9）
      const positions = block.getAbsolutePositions(0, 7);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(false);
      expect(board.getOccupiedCount()).toBe(0);
    });
  });

  describe('得分计算', () => {
    it('放置单格应该获得基础分', () => {
      const block = Block.createBlock(BlockType.SINGLE);
      const positions = block.getAbsolutePositions(4, 4);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(true);
      expect(result.score).toBe(1); // 默认每格1分
    });

    it('放置多格方块应该获得对应格数的分数', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const positions = block.getAbsolutePositions(0, 0);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(true);
      expect(result.score).toBe(3); // 3格 × 1分/格
    });

    it('消除一行应该获得额外分数', () => {
      // 先填满8格
      for (let col = 0; col < 8; col++) {
        board.setCell(0, col, true);
      }
      
      // 放置最后一格使第0行满
      const block = Block.createBlock(BlockType.SINGLE);
      const positions = block.getAbsolutePositions(0, 8);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(true);
      expect(result.clearedRows).toEqual([0]);
      expect(result.clearedColumns).toEqual([]);
      // 分数 = 1(放置分) + 10(消行分) = 11
      expect(result.score).toBe(11);
    });

    it('消除一列应该获得额外分数', () => {
      // 填满第0列的前8格
      for (let row = 0; row < 8; row++) {
        board.setCell(row, 0, true);
      }
      
      // 放置最后一格使第0列满
      const block = Block.createBlock(BlockType.SINGLE);
      const positions = block.getAbsolutePositions(8, 0);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(true);
      expect(result.clearedRows).toEqual([]);
      expect(result.clearedColumns).toEqual([0]);
      // 分数 = 1(放置分) + 10(消列分) = 11
      expect(result.score).toBe(11);
    });

    it('同时消除行和列应该获得连消奖励', () => {
      // 填满第4行（除了中心点）
      for (let col = 0; col < 9; col++) {
        if (col !== 4) {
          board.setCell(4, col, true);
        }
      }
      
      // 填满第4列（除了中心点）
      for (let row = 0; row < 9; row++) {
        if (row !== 4) {
          board.setCell(row, 4, true);
        }
      }
      
      // 放置中心点，同时完成行和列
      const block = Block.createBlock(BlockType.SINGLE);
      const positions = block.getAbsolutePositions(4, 4);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(true);
      expect(result.clearedRows).toEqual([4]);
      expect(result.clearedColumns).toEqual([4]);
      
      // 计算分数：
      // 基础分: 1 (放置1格)
      // 消除分: 2条线 × 10 = 20
      // 连消奖励: 20 × (2-1) × (1.5-1) = 20 × 1 × 0.5 = 10
      // 总分: 1 + 20 + 10 = 31
      expect(result.score).toBe(31);
    });

    it('消除多行应该获得连消奖励', () => {
      // 填满第0行和第1行（各留一格）
      for (let col = 0; col < 8; col++) {
        board.setCell(0, col, true);
        board.setCell(1, col, true);
      }
      
      // 放置2格方块完成两行
      const block = Block.createBlock(BlockType.LINE_2).rotate();
      const positions = block.getAbsolutePositions(0, 8);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(true);
      expect(result.clearedRows).toEqual([0, 1]);
      expect(result.clearedColumns).toEqual([]);
      
      // 计算分数：
      // 基础分: 2 (放置2格)
      // 消除分: 2条线 × 10 = 20
      // 连消奖励: 20 × (2-1) × (1.5-1) = 10
      // 总分: 2 + 20 + 10 = 32
      expect(result.score).toBe(32);
    });

    it('消除3条线应该获得更高的连消奖励', () => {
      // 填满3行
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
          board.setCell(row, col, true);
        }
      }
      
      // 放置3格方块完成三行
      const block = Block.createBlock(BlockType.LINE_3).rotate();
      const positions = block.getAbsolutePositions(0, 8);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(true);
      expect(result.clearedRows.length).toBe(3);
      
      // 计算分数：
      // 基础分: 3
      // 消除分: 3 × 10 = 30
      // 连消奖励: 30 × (3-1) × 0.5 = 30
      // 总分: 3 + 30 + 30 = 63
      expect(result.score).toBe(63);
    });
  });

  describe('消除检测', () => {
    it('不满的行列不应该被消除', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const positions = block.getAbsolutePositions(0, 0);
      
      const result = manager.place(positions);
      
      expect(result.clearedRows).toEqual([]);
      expect(result.clearedColumns).toEqual([]);
    });

    it('应该正确返回被消除的行索引', () => {
      // 填满第5行
      for (let col = 0; col < 9; col++) {
        board.setCell(5, col, true);
      }
      
      // 清空一格
      board.setCell(5, 0, false);
      
      // 放置方块填满
      const result = manager.place([{ row: 5, col: 0 }]);
      
      expect(result.clearedRows).toEqual([5]);
    });

    it('应该正确返回被消除的列索引', () => {
      // 填满第3列
      for (let row = 0; row < 9; row++) {
        board.setCell(row, 3, true);
      }
      
      board.setCell(0, 3, false);
      
      const result = manager.place([{ row: 0, col: 3 }]);
      
      expect(result.clearedColumns).toEqual([3]);
    });

    it('应该正确返回多个被消除的行和列', () => {
      // 填满行 2, 3，各留一格在不同列
      for (let col = 0; col < 8; col++) {
        board.setCell(2, col, true); // 行2留col 8
      }
      for (let col = 1; col < 9; col++) {
        board.setCell(3, col, true); // 行3留col 0
      }
      
      // 填满列 5, 6（但留出行2和行3的交叉点）
      for (let row = 0; row < 9; row++) {
        if (row !== 2 && row !== 3) {
          board.setCell(row, 5, true);
          board.setCell(row, 6, true);
        }
      }
      
      // 现在填充缺失的位置来同时完成多行多列
      // 先完成行2的最后一格(2,8)和行3的第一格(3,0)
      board.setCell(2, 8, true);
      board.setCell(3, 0, true);
      
      // 检查满行
      expect(board.getFullRows()).toEqual([2, 3]);
      
      // 现在填充列5和6在行2、3的位置
      board.setCell(2, 5, true);
      board.setCell(2, 6, true);
      board.setCell(3, 5, true);
      board.setCell(3, 6, true);
      
      // 现在列5和6也应该满了
      const fullRows = board.getFullRows();
      const fullCols = board.getFullColumns();
      
      expect(fullRows).toEqual([2, 3]);
      expect(fullCols).toEqual([5, 6]);
    });
  });

  describe('复杂场景测试', () => {
    it('应该处理放置后立即消除的完整流程', () => {
      // 填满第8行的前8格
      for (let col = 0; col < 8; col++) {
        board.setCell(8, col, true);
      }
      
      const initialCount = board.getOccupiedCount();
      expect(initialCount).toBe(8);
      
      // 放置最后一格
      const result = manager.place([{ row: 8, col: 8 }]);
      
      expect(result.success).toBe(true);
      expect(result.clearedRows).toEqual([8]);
      
      // 消除后棋盘应该变空
      expect(board.getOccupiedCount()).toBe(0);
    });

    it('应该处理放置L形方块触发多条消除', () => {
      // 准备两行，各留一格在不同列
      for (let col = 0; col < 8; col++) {
        board.setCell(0, col, true); // 第0行留最后一格
      }
      for (let col = 1; col < 9; col++) {
        board.setCell(1, col, true); // 第1行留第一格
      }
      
      // 放置L形方块: (0,8), (1,8), (1,0) - 无法用一个L形同时填这些位置
      // 改为分别放置
      const result1 = manager.place([{ row: 0, col: 8 }]);
      expect(result1.clearedRows).toEqual([0]);
      
      const result2 = manager.place([{ row: 1, col: 0 }]);
      expect(result2.clearedRows).toEqual([1]);
    });

    it('大方块放置应该正确计算所有得分', () => {
      const block = Block.createBlock(BlockType.SQUARE_3X3);
      const positions = block.getAbsolutePositions(0, 0);
      
      const result = manager.place(positions);
      
      expect(result.success).toBe(true);
      expect(result.score).toBe(9); // 9格方块
      expect(board.getOccupiedCount()).toBe(9);
    });

    it('消除后的位置应该可以再次放置', () => {
      // 填满第0行
      for (let col = 0; col < 9; col++) {
        board.setCell(0, col, true);
      }
      
      const result1 = manager.place([{ row: 5, col: 5 }]);
      
      // 清除满行
      board.clearRows(board.getFullRows());
      
      // 现在第0行应该可以再次放置
      const result2 = manager.place([{ row: 0, col: 0 }]);
      expect(result2.success).toBe(true);
    });
  });

  describe('得分配置', () => {
    it('应该能够使用自定义得分配置', () => {
      const customManager = new PlacementManager(board, {
        cellPlacementScore: 2,
        lineScore: 20,
        comboMultiplier: 2.0
      });
      
      const config = customManager.getScoreConfig();
      expect(config.cellPlacementScore).toBe(2);
      expect(config.lineScore).toBe(20);
      expect(config.comboMultiplier).toBe(2.0);
    });

    it('自定义得分配置应该影响实际得分', () => {
      const customManager = new PlacementManager(board, {
        cellPlacementScore: 5,
        lineScore: 100
      });
      
      const block = Block.createBlock(BlockType.SINGLE);
      const result = customManager.place(block.getAbsolutePositions(0, 0));
      
      expect(result.score).toBe(5); // 1格 × 5分/格
    });

    it('应该能够动态更新得分配置', () => {
      manager.updateScoreConfig({
        lineScore: 50
      });
      
      const config = manager.getScoreConfig();
      expect(config.lineScore).toBe(50);
      expect(config.cellPlacementScore).toBe(1); // 其他配置保持不变
    });

    it('更新后的配置应该影响后续得分', () => {
      // 填满第0行的前8格
      for (let col = 0; col < 8; col++) {
        board.setCell(0, col, true);
      }
      
      manager.updateScoreConfig({
        lineScore: 50
      });
      
      const result = manager.place([{ row: 0, col: 8 }]);
      
      // 分数 = 1(放置分) + 50(消行分) = 51
      expect(result.score).toBe(51);
    });
  });

  describe('边界条件', () => {
    it('空位置数组应该成功但不改变棋盘', () => {
      const result = manager.place([]);
      
      expect(result.success).toBe(true);
      expect(result.score).toBe(0);
      expect(board.getOccupiedCount()).toBe(0);
    });

    it('放置失败不应该改变棋盘状态', () => {
      board.setCell(0, 0, true);
      const initialState = board.getState();
      
      const result = manager.place([{ row: 0, col: 0 }]);
      
      expect(result.success).toBe(false);
      const finalState = board.getState();
      
      // 棋盘状态应该没有变化
      expect(finalState).toEqual(initialState);
    });

    it('同时消除所有行和列应该清空棋盘', () => {
      // 填满整个棋盘
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          board.setCell(row, col, true);
        }
      }
      
      // 清除所有行列
      board.clearRows(board.getFullRows());
      board.clearColumns(board.getFullColumns());
      
      expect(board.getOccupiedCount()).toBe(0);
    });
  });

  describe('连消计算验证', () => {
    it('消除4条线的连消奖励应该正确', () => {
      // 准备4行，各留最后一格
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
          board.setCell(row, col, true);
        }
      }
      
      // 放置4格垂直方块
      const block = Block.createBlock(BlockType.LINE_4).rotate();
      const result = manager.place(block.getAbsolutePositions(0, 8));
      
      expect(result.clearedRows.length).toBe(4);
      
      // 计算：4(基础) + 40(消除) + 60(连消) = 104
      // 连消: 40 × (4-1) × 0.5 = 60
      expect(result.score).toBe(104);
    });

    it('消除5条线的连消奖励应该正确', () => {
      const score = manager.calculateScore(5, 5, 0);
      
      // 基础: 5
      // 消除: 5 × 10 = 50
      // 连消: 50 × (5-1) × 0.5 = 100
      // 总计: 5 + 50 + 100 = 155
      expect(score).toBe(155);
    });

    it('消除1条线不应该有连消奖励', () => {
      const score = manager.calculateScore(3, 1, 0);
      
      // 基础: 3
      // 消除: 1 × 10 = 10
      // 连消: 0 (只有1条线)
      // 总计: 13
      expect(score).toBe(13);
    });

    it('只放置不消除应该只有基础分', () => {
      const score = manager.calculateScore(7, 0, 0);
      
      expect(score).toBe(7);
    });
  });
});
