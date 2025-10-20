import { Board } from '../../assets/scripts/core/Board';
import { Block, BlockType } from '../../assets/scripts/core/Block';
import { BlockGenerator } from '../../assets/scripts/core/BlockGenerator';

describe('Block 放置合法性测试', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  describe('基本放置测试', () => {
    it('应该能够在空棋盘上放置单格方块', () => {
      const block = Block.createBlock(BlockType.SINGLE);
      const positions = block.getAbsolutePositions(0, 0);
      
      expect(board.canPlaceBlock(positions)).toBe(true);
      expect(board.placeBlock(positions)).toBe(true);
      expect(board.getOccupiedCount()).toBe(1);
    });

    it('应该能够在空棋盘上放置直线方块', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const positions = block.getAbsolutePositions(0, 0);
      
      expect(board.canPlaceBlock(positions)).toBe(true);
      expect(board.placeBlock(positions)).toBe(true);
      expect(board.getOccupiedCount()).toBe(3);
    });

    it('应该能够在空棋盘上放置 L 形方块', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      const positions = block.getAbsolutePositions(2, 2);
      
      expect(board.canPlaceBlock(positions)).toBe(true);
      expect(board.placeBlock(positions)).toBe(true);
      expect(board.getOccupiedCount()).toBe(3);
    });

    it('应该能够在空棋盘上放置方块形状', () => {
      const block = Block.createBlock(BlockType.SQUARE_2X2);
      const positions = block.getAbsolutePositions(0, 0);
      
      expect(board.canPlaceBlock(positions)).toBe(true);
      expect(board.placeBlock(positions)).toBe(true);
      expect(board.getOccupiedCount()).toBe(4);
    });

    it('应该能够在空棋盘上放置 T 形方块', () => {
      const block = Block.createBlock(BlockType.T_SHAPE);
      const positions = block.getAbsolutePositions(1, 1);
      
      expect(board.canPlaceBlock(positions)).toBe(true);
      expect(board.placeBlock(positions)).toBe(true);
      expect(board.getOccupiedCount()).toBe(5);
    });
  });

  describe('边界检测', () => {
    it('方块超出上边界应该放置失败', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const positions = block.getAbsolutePositions(-1, 0);
      
      expect(board.canPlaceBlock(positions)).toBe(false);
      expect(board.placeBlock(positions)).toBe(false);
    });

    it('方块超出左边界应该放置失败', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const positions = block.getAbsolutePositions(0, -1);
      
      expect(board.canPlaceBlock(positions)).toBe(false);
      expect(board.placeBlock(positions)).toBe(false);
    });

    it('方块超出右边界应该放置失败', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      // 水平直线 3 格，从列 7 开始会超出边界（7, 8, 9）
      const positions = block.getAbsolutePositions(0, 7);
      
      expect(board.canPlaceBlock(positions)).toBe(false);
      expect(board.placeBlock(positions)).toBe(false);
    });

    it('方块超出下边界应该放置失败', () => {
      const block = Block.createBlock(BlockType.LINE_3).rotate(); // 垂直直线
      // 垂直直线 3 格，从行 7 开始会超出边界（7, 8, 9）
      const positions = block.getAbsolutePositions(7, 0);
      
      expect(board.canPlaceBlock(positions)).toBe(false);
      expect(board.placeBlock(positions)).toBe(false);
    });

    it('应该能够在右下角边界内放置方块', () => {
      const block = Block.createBlock(BlockType.SQUARE_2X2);
      // 2x2 方块，从 (7, 7) 开始可以放置
      const positions = block.getAbsolutePositions(7, 7);
      
      expect(board.canPlaceBlock(positions)).toBe(true);
      expect(board.placeBlock(positions)).toBe(true);
    });

    it('2x2 方块放在 (8, 8) 应该超出边界', () => {
      const block = Block.createBlock(BlockType.SQUARE_2X2);
      const positions = block.getAbsolutePositions(8, 8);
      
      expect(board.canPlaceBlock(positions)).toBe(false);
      expect(board.placeBlock(positions)).toBe(false);
    });
  });

  describe('重叠检测', () => {
    it('不能在已占用位置放置方块', () => {
      const block1 = Block.createBlock(BlockType.SINGLE);
      const pos1 = block1.getAbsolutePositions(0, 0);
      board.placeBlock(pos1);
      
      const block2 = Block.createBlock(BlockType.LINE_3);
      const pos2 = block2.getAbsolutePositions(0, 0); // 与第一个方块重叠
      
      expect(board.canPlaceBlock(pos2)).toBe(false);
      expect(board.placeBlock(pos2)).toBe(false);
      expect(board.getOccupiedCount()).toBe(1); // 只有第一个方块
    });

    it('相邻但不重叠的方块应该可以放置', () => {
      const block1 = Block.createBlock(BlockType.LINE_3);
      const pos1 = block1.getAbsolutePositions(0, 0); // (0,0), (0,1), (0,2)
      board.placeBlock(pos1);
      
      const block2 = Block.createBlock(BlockType.LINE_3);
      const pos2 = block2.getAbsolutePositions(0, 3); // (0,3), (0,4), (0,5)
      
      expect(board.canPlaceBlock(pos2)).toBe(true);
      expect(board.placeBlock(pos2)).toBe(true);
      expect(board.getOccupiedCount()).toBe(6);
    });

    it('部分重叠应该放置失败', () => {
      const block1 = Block.createBlock(BlockType.SQUARE_2X2);
      const pos1 = block1.getAbsolutePositions(0, 0);
      board.placeBlock(pos1);
      
      const block2 = Block.createBlock(BlockType.SQUARE_2X2);
      const pos2 = block2.getAbsolutePositions(1, 1); // 部分重叠
      
      expect(board.canPlaceBlock(pos2)).toBe(false);
      expect(board.placeBlock(pos2)).toBe(false);
    });
  });

  describe('旋转后的放置测试', () => {
    it('水平直线旋转后应该可以垂直放置', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const horizontal = block.getAbsolutePositions(0, 0);
      board.placeBlock(horizontal); // (0,0), (0,1), (0,2)
      
      const rotated = block.rotate();
      const vertical = rotated.getAbsolutePositions(1, 0);
      
      expect(board.canPlaceBlock(vertical)).toBe(true);
      expect(board.placeBlock(vertical)).toBe(true);
    });

    it('L 形方块旋转后应该仍能正确放置', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      
      for (let rotation = 0; rotation < 4; rotation++) {
        const rotatedBlock = rotation === 0 ? block : block.rotate();
        const positions = rotatedBlock.getAbsolutePositions(rotation * 2, 0);
        
        expect(board.canPlaceBlock(positions)).toBe(true);
        expect(board.placeBlock(positions)).toBe(true);
        
        // 为下一次旋转测试做准备
        if (rotation < 3) {
          board.reset();
        }
      }
    });
  });

  describe('不同形状的放置测试', () => {
    it('应该能够放置所有预定义类型的方块', () => {
      const types = [
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

      types.forEach(type => {
        board.reset();
        const block = Block.createBlock(type);
        const positions = block.getAbsolutePositions(0, 0);
        
        // 有些大方块可能放不下左上角，但至少应该能检测
        const canPlace = board.canPlaceBlock(positions);
        const placed = board.placeBlock(positions);
        
        expect(canPlace).toBe(placed);
      });
    });

    it('5x5 的方块应该能放在棋盘中心', () => {
      const largeTypes = [BlockType.LINE_5, BlockType.L_LARGE, BlockType.T_SHAPE];
      
      largeTypes.forEach(type => {
        board.reset();
        const block = Block.createBlock(type);
        const positions = block.getAbsolutePositions(2, 2);
        
        expect(board.canPlaceBlock(positions)).toBe(true);
        expect(board.placeBlock(positions)).toBe(true);
      });
    });
  });

  describe('使用生成器的放置测试', () => {
    it('生成器产生的方块应该可以放置', () => {
      const generator = new BlockGenerator({ seed: 12345 });
      const blocks = generator.generateMultiple(10);
      
      blocks.forEach((block, index) => {
        board.reset();
        const positions = block.getAbsolutePositions(0, 0);
        
        // 记录失败的情况用于调试
        if (!board.canPlaceBlock(positions)) {
          const bounds = block.getBounds();
          // 大方块可能放不下左上角，这是正常的
          expect(bounds.width > 9 || bounds.height > 9).toBe(true);
        }
      });
    });

    it('应该能在棋盘上放置随机位置的方块', () => {
      const generator = new BlockGenerator({ seed: 54321 });
      
      for (let i = 0; i < 20; i++) {
        const block = generator.generate();
        const bounds = block.getBounds();
        
        // 计算可以放置的最大起始位置
        const maxRow = 9 - bounds.height;
        const maxCol = 9 - bounds.width;
        
        if (maxRow >= 0 && maxCol >= 0) {
          const positions = block.getAbsolutePositions(maxRow, maxCol);
          expect(board.canPlaceBlock(positions)).toBe(true);
        }
      }
    });
  });

  describe('复杂场景测试', () => {
    it('应该能够在已有方块的棋盘上找到合法位置', () => {
      // 先放置一个方块在中心
      const centerBlock = Block.createBlock(BlockType.SQUARE_2X2);
      board.placeBlock(centerBlock.getAbsolutePositions(4, 4));
      
      // 应该能在左上角放置
      const topLeftBlock = Block.createBlock(BlockType.LINE_3);
      const topLeftPos = topLeftBlock.getAbsolutePositions(0, 0);
      
      expect(board.canPlaceBlock(topLeftPos)).toBe(true);
      expect(board.placeBlock(topLeftPos)).toBe(true);
    });

    it('棋盘几乎满时，小方块应该还能找到位置', () => {
      // 填充大部分棋盘
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          board.setCell(row, col, true);
        }
      }
      
      // 单格方块应该还能放在右下角
      const single = Block.createBlock(BlockType.SINGLE);
      const positions = single.getAbsolutePositions(8, 8);
      
      expect(board.canPlaceBlock(positions)).toBe(true);
      expect(board.placeBlock(positions)).toBe(true);
    });

    it('放置方块后消除行列，应该能再次放置', () => {
      // 填满第一行（除了一格）
      for (let col = 0; col < 8; col++) {
        board.setCell(0, col, true);
      }
      
      // 放置单格填满第一行
      const single = Block.createBlock(BlockType.SINGLE);
      board.placeBlock(single.getAbsolutePositions(0, 8));
      
      // 清除满行
      const fullRows = board.getFullRows();
      expect(fullRows).toEqual([0]);
      board.clearRows(fullRows);
      
      // 现在应该能在第一行再次放置
      const line = Block.createBlock(BlockType.LINE_3);
      const positions = line.getAbsolutePositions(0, 0);
      
      expect(board.canPlaceBlock(positions)).toBe(true);
      expect(board.placeBlock(positions)).toBe(true);
    });
  });
});
