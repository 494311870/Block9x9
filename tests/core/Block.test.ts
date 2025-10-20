import { Block, BlockType, Position } from '../../assets/scripts/core/Block';

describe('Block', () => {
  describe('基本功能', () => {
    it('应该能够创建一个单格方块', () => {
      const block = Block.createBlock(BlockType.SINGLE);
      expect(block.getType()).toBe(BlockType.SINGLE);
      expect(block.getCellCount()).toBe(1);
      expect(block.getRotation()).toBe(0);
    });

    it('应该能够创建各种预定义类型的方块', () => {
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
        const block = Block.createBlock(type);
        expect(block.getType()).toBe(type);
        expect(block.getCellCount()).toBeGreaterThan(0);
      });
    });

    it('应该正确返回方块的形状', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      const shape = block.getShape();
      
      expect(shape.length).toBe(3);
      expect(shape).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 1, col: 1 }
      ]);
    });

    it('getShape 应该返回形状的副本', () => {
      const block = Block.createBlock(BlockType.SINGLE);
      const shape1 = block.getShape();
      const shape2 = block.getShape();
      
      expect(shape1).toEqual(shape2);
      expect(shape1).not.toBe(shape2); // 不是同一个对象
      
      // 修改返回的形状不应影响原始方块
      shape1[0].row = 999;
      expect(block.getShape()[0].row).toBe(0);
    });
  });

  describe('绝对位置计算', () => {
    it('应该正确计算单格方块的绝对位置', () => {
      const block = Block.createBlock(BlockType.SINGLE);
      const positions = block.getAbsolutePositions(5, 5);
      
      expect(positions).toEqual([{ row: 5, col: 5 }]);
    });

    it('应该正确计算 L 形方块的绝对位置', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      const positions = block.getAbsolutePositions(2, 3);
      
      expect(positions).toEqual([
        { row: 2, col: 3 },
        { row: 3, col: 3 },
        { row: 3, col: 4 }
      ]);
    });

    it('应该正确计算直线方块的绝对位置', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const positions = block.getAbsolutePositions(0, 0);
      
      expect(positions).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 }
      ]);
    });
  });

  describe('旋转功能', () => {
    it('应该能够旋转单格方块（形状不变）', () => {
      const block = Block.createBlock(BlockType.SINGLE);
      const rotated = block.rotate();
      
      expect(rotated.getShape()).toEqual(block.getShape());
      expect(rotated.getRotation()).toBe(90);
    });

    it('应该能够旋转直线方块', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const original = block.getShape();
      
      // 水平线 [(0,0), (0,1), (0,2)]
      expect(original).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 }
      ]);
      
      // 旋转后应该是垂直线
      const rotated = block.rotate();
      const rotatedShape = rotated.getShape();
      
      expect(rotatedShape).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 }
      ]);
      expect(rotated.getRotation()).toBe(90);
    });

    it('应该能够旋转 L 形方块', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      const rotated = block.rotate();
      const shape = rotated.getShape();
      
      // L 形旋转后应该是不同的形状
      expect(shape.length).toBe(3);
      expect(rotated.getRotation()).toBe(90);
      
      // 验证归一化（最小坐标应该是 0）
      const minRow = Math.min(...shape.map(p => p.row));
      const minCol = Math.min(...shape.map(p => p.col));
      expect(minRow).toBe(0);
      expect(minCol).toBe(0);
    });

    it('旋转 4 次应该回到原始形状', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      let rotated = block;
      
      for (let i = 0; i < 4; i++) {
        rotated = rotated.rotate();
      }
      
      expect(rotated.getRotation()).toBe(0); // 360 % 360 = 0
      expect(rotated.getShape()).toEqual(block.getShape());
    });

    it('方块旋转应该返回新实例', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      const rotated = block.rotate();
      
      expect(rotated).not.toBe(block);
      expect(block.getRotation()).toBe(0); // 原方块不受影响
      expect(rotated.getRotation()).toBe(90);
    });
  });

  describe('克隆功能', () => {
    it('应该能够克隆方块', () => {
      const block = Block.createBlock(BlockType.L_MEDIUM);
      const cloned = block.clone();
      
      expect(cloned.getType()).toBe(block.getType());
      expect(cloned.getShape()).toEqual(block.getShape());
      expect(cloned.getRotation()).toBe(block.getRotation());
    });

    it('克隆的方块应该是独立的实例', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const cloned = block.clone();
      
      expect(cloned).not.toBe(block);
      
      // 旋转克隆体不应影响原始方块
      const rotatedClone = cloned.rotate();
      expect(block.getRotation()).toBe(0);
      expect(rotatedClone.getRotation()).toBe(90);
    });

    it('应该能够克隆已旋转的方块', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      const rotated = block.rotate();
      const cloned = rotated.clone();
      
      expect(cloned.getRotation()).toBe(90);
      expect(cloned.getShape()).toEqual(rotated.getShape());
    });
  });

  describe('序列化与反序列化', () => {
    it('应该能够序列化方块', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      const data = block.serialize();
      
      expect(data.type).toBe(BlockType.L_SMALL);
      expect(data.shape).toEqual(block.getShape());
      expect(data.rotation).toBe(0);
    });

    it('应该能够反序列化方块', () => {
      const original = Block.createBlock(BlockType.T_SHAPE);
      const data = original.serialize();
      const deserialized = Block.deserialize(data);
      
      expect(deserialized.getType()).toBe(original.getType());
      expect(deserialized.getShape()).toEqual(original.getShape());
      expect(deserialized.getRotation()).toBe(original.getRotation());
    });

    it('序列化与反序列化应该保留旋转状态', () => {
      const block = Block.createBlock(BlockType.LINE_4);
      const rotated = block.rotate().rotate(); // 旋转两次
      
      const data = rotated.serialize();
      const deserialized = Block.deserialize(data);
      
      expect(deserialized.getRotation()).toBe(180);
      expect(deserialized.getShape()).toEqual(rotated.getShape());
    });

    it('序列化后的数据应该可以转为 JSON', () => {
      const block = Block.createBlock(BlockType.SQUARE_2X2);
      const data = block.serialize();
      
      const json = JSON.stringify(data);
      const parsed = JSON.parse(json);
      const deserialized = Block.deserialize(parsed);
      
      expect(deserialized.getType()).toBe(block.getType());
      expect(deserialized.getShape()).toEqual(block.getShape());
    });
  });

  describe('边界框计算', () => {
    it('应该正确计算单格方块的边界框', () => {
      const block = Block.createBlock(BlockType.SINGLE);
      const bounds = block.getBounds();
      
      expect(bounds).toEqual({ width: 1, height: 1 });
    });

    it('应该正确计算水平直线的边界框', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const bounds = block.getBounds();
      
      expect(bounds).toEqual({ width: 3, height: 1 });
    });

    it('应该正确计算方块的边界框', () => {
      const block = Block.createBlock(BlockType.SQUARE_2X2);
      const bounds = block.getBounds();
      
      expect(bounds).toEqual({ width: 2, height: 2 });
    });

    it('应该正确计算 L 形的边界框', () => {
      const block = Block.createBlock(BlockType.L_SMALL);
      const bounds = block.getBounds();
      
      // L_SMALL: [(0,0), (1,0), (1,1)]
      expect(bounds).toEqual({ width: 2, height: 2 });
    });

    it('旋转后的边界框应该改变', () => {
      const block = Block.createBlock(BlockType.LINE_3);
      const originalBounds = block.getBounds();
      
      const rotated = block.rotate();
      const rotatedBounds = rotated.getBounds();
      
      // 水平线旋转成垂直线
      expect(originalBounds).toEqual({ width: 3, height: 1 });
      expect(rotatedBounds).toEqual({ width: 1, height: 3 });
    });
  });

  describe('格子数量', () => {
    it('应该正确返回各种方块的格子数量', () => {
      expect(Block.createBlock(BlockType.SINGLE).getCellCount()).toBe(1);
      expect(Block.createBlock(BlockType.LINE_2).getCellCount()).toBe(2);
      expect(Block.createBlock(BlockType.LINE_3).getCellCount()).toBe(3);
      expect(Block.createBlock(BlockType.LINE_4).getCellCount()).toBe(4);
      expect(Block.createBlock(BlockType.LINE_5).getCellCount()).toBe(5);
      expect(Block.createBlock(BlockType.SQUARE_2X2).getCellCount()).toBe(4);
      expect(Block.createBlock(BlockType.SQUARE_3X3).getCellCount()).toBe(9);
      expect(Block.createBlock(BlockType.L_SMALL).getCellCount()).toBe(3);
      expect(Block.createBlock(BlockType.L_MEDIUM).getCellCount()).toBe(4);
      expect(Block.createBlock(BlockType.L_LARGE).getCellCount()).toBe(5);
      expect(Block.createBlock(BlockType.T_SHAPE).getCellCount()).toBe(5);
    });
  });

  describe('错误处理', () => {
    it('创建未知类型的方块应该抛出错误', () => {
      expect(() => {
        Block.createBlock('UNKNOWN_TYPE' as BlockType);
      }).toThrow();
    });
  });
});
