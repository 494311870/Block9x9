import { BlockGenerator, createDefaultGenerator, createTestGenerator } from '../../assets/scripts/core/BlockGenerator';
import { Block, BlockType } from '../../assets/scripts/core/Block';

describe('BlockGenerator', () => {
  describe('基本生成功能', () => {
    it('应该能够创建默认生成器', () => {
      const generator = createDefaultGenerator();
      expect(generator).toBeInstanceOf(BlockGenerator);
    });

    it('应该能够生成一个随机方块', () => {
      const generator = createDefaultGenerator();
      const block = generator.generate();
      
      expect(block).toBeInstanceOf(Block);
      expect(block.getCellCount()).toBeGreaterThan(0);
    });

    it('应该能够生成多个随机方块', () => {
      const generator = createDefaultGenerator();
      const blocks = generator.generateMultiple(5);
      
      expect(blocks.length).toBe(5);
      blocks.forEach(block => {
        expect(block).toBeInstanceOf(Block);
      });
    });

    it('应该能够生成指定类型的方块', () => {
      const generator = createDefaultGenerator();
      const block = generator.generateType(BlockType.L_SMALL);
      
      expect(block.getType()).toBe(BlockType.L_SMALL);
    });

    it('生成不可用类型应该抛出错误', () => {
      const generator = new BlockGenerator({
        blockTypes: [BlockType.SINGLE, BlockType.LINE_2]
      });
      
      expect(() => {
        generator.generateType(BlockType.L_LARGE);
      }).toThrow();
    });
  });

  describe('随机种子功能', () => {
    it('相同种子应该生成相同序列', () => {
      const gen1 = new BlockGenerator({ seed: 12345 });
      const gen2 = new BlockGenerator({ seed: 12345 });
      
      const blocks1 = gen1.generateMultiple(10);
      const blocks2 = gen2.generateMultiple(10);
      
      for (let i = 0; i < blocks1.length; i++) {
        expect(blocks1[i].getType()).toBe(blocks2[i].getType());
      }
    });

    it('不同种子应该生成不同序列', () => {
      const gen1 = new BlockGenerator({ seed: 12345 });
      const gen2 = new BlockGenerator({ seed: 54321 });
      
      const blocks1 = gen1.generateMultiple(10);
      const blocks2 = gen2.generateMultiple(10);
      
      // 虽然理论上可能相同，但概率很低
      let differentCount = 0;
      for (let i = 0; i < blocks1.length; i++) {
        if (blocks1[i].getType() !== blocks2[i].getType()) {
          differentCount++;
        }
      }
      
      expect(differentCount).toBeGreaterThan(0);
    });

    it('重置种子应该重新开始序列', () => {
      const generator = new BlockGenerator({ seed: 12345 });
      const firstBatch = generator.generateMultiple(5);
      
      generator.resetSeed(12345);
      const secondBatch = generator.generateMultiple(5);
      
      for (let i = 0; i < firstBatch.length; i++) {
        expect(firstBatch[i].getType()).toBe(secondBatch[i].getType());
      }
    });

    it('createTestGenerator 应该创建带种子的生成器', () => {
      const gen1 = createTestGenerator(999);
      const gen2 = createTestGenerator(999);
      
      const block1 = gen1.generate();
      const block2 = gen2.generate();
      
      expect(block1.getType()).toBe(block2.getType());
    });
  });

  describe('可用类型管理', () => {
    it('应该能够获取可用类型列表', () => {
      const generator = new BlockGenerator();
      const types = generator.getAvailableTypes();
      
      expect(types.length).toBeGreaterThan(0);
      expect(types).toContain(BlockType.SINGLE);
      expect(types).toContain(BlockType.L_SMALL);
    });

    it('应该能够限制可生成的类型', () => {
      const limitedTypes = [BlockType.SINGLE, BlockType.LINE_2, BlockType.LINE_3];
      const generator = new BlockGenerator({ blockTypes: limitedTypes });
      
      const types = generator.getAvailableTypes();
      expect(types).toEqual(limitedTypes);
    });

    it('限制类型后只应生成指定类型的方块', () => {
      const limitedTypes = [BlockType.SINGLE, BlockType.LINE_2];
      const generator = new BlockGenerator({ 
        seed: 12345,
        blockTypes: limitedTypes 
      });
      
      const blocks = generator.generateMultiple(20);
      blocks.forEach(block => {
        expect(limitedTypes).toContain(block.getType());
      });
    });

    it('应该能够动态设置可用类型', () => {
      const generator = new BlockGenerator();
      const newTypes = [BlockType.SQUARE_2X2, BlockType.SQUARE_3X3];
      
      generator.setAvailableTypes(newTypes);
      expect(generator.getAvailableTypes()).toEqual(newTypes);
      
      const blocks = generator.generateMultiple(10);
      blocks.forEach(block => {
        expect(newTypes).toContain(block.getType());
      });
    });

    it('设置空类型数组应该抛出错误', () => {
      const generator = new BlockGenerator();
      
      expect(() => {
        generator.setAvailableTypes([]);
      }).toThrow();
    });

    it('getAvailableTypes 应该返回副本', () => {
      const generator = new BlockGenerator();
      const types1 = generator.getAvailableTypes();
      const types2 = generator.getAvailableTypes();
      
      expect(types1).toEqual(types2);
      expect(types1).not.toBe(types2); // 不是同一个数组
      
      // 修改返回的数组不应影响生成器
      types1.length = 0;
      expect(generator.getAvailableTypes().length).toBeGreaterThan(0);
    });
  });

  describe('随机性测试', () => {
    it('无种子生成器应该产生随机结果', () => {
      const generator = createDefaultGenerator();
      const blocks = generator.generateMultiple(50);
      
      // 统计类型分布
      const typeCount = new Map<BlockType, number>();
      blocks.forEach(block => {
        const type = block.getType();
        typeCount.set(type, (typeCount.get(type) || 0) + 1);
      });
      
      // 应该生成多于一种类型（随机性验证）
      expect(typeCount.size).toBeGreaterThan(1);
    });

    it('有种子生成器应该是确定性的', () => {
      const generator = new BlockGenerator({ seed: 777 });
      
      // 生成第一批
      const firstRun = generator.generateMultiple(20).map(b => b.getType());
      
      // 重置种子
      generator.resetSeed(777);
      
      // 生成第二批
      const secondRun = generator.generateMultiple(20).map(b => b.getType());
      
      expect(firstRun).toEqual(secondRun);
    });
  });

  describe('边界条件', () => {
    it('生成 0 个方块应该返回空数组', () => {
      const generator = createDefaultGenerator();
      const blocks = generator.generateMultiple(0);
      
      expect(blocks).toEqual([]);
    });

    it('生成大量方块不应该崩溃', () => {
      const generator = new BlockGenerator({ seed: 12345 });
      
      expect(() => {
        generator.generateMultiple(1000);
      }).not.toThrow();
    });

    it('只有一种可用类型时应该总是生成该类型', () => {
      const generator = new BlockGenerator({
        blockTypes: [BlockType.SINGLE]
      });
      
      const blocks = generator.generateMultiple(10);
      blocks.forEach(block => {
        expect(block.getType()).toBe(BlockType.SINGLE);
      });
    });
  });

  describe('配置选项', () => {
    it('应该能够同时配置种子和类型', () => {
      const generator = new BlockGenerator({
        seed: 12345,
        blockTypes: [BlockType.L_SMALL, BlockType.L_MEDIUM, BlockType.L_LARGE]
      });
      
      const blocks = generator.generateMultiple(10);
      
      blocks.forEach(block => {
        const type = block.getType();
        expect([
          BlockType.L_SMALL,
          BlockType.L_MEDIUM,
          BlockType.L_LARGE
        ]).toContain(type);
      });
    });

    it('默认配置应该包含所有类型', () => {
      const generator = new BlockGenerator();
      const types = generator.getAvailableTypes();
      
      // 验证包含所有预定义类型
      expect(types).toContain(BlockType.SINGLE);
      expect(types).toContain(BlockType.LINE_2);
      expect(types).toContain(BlockType.LINE_3);
      expect(types).toContain(BlockType.LINE_4);
      expect(types).toContain(BlockType.LINE_5);
      expect(types).toContain(BlockType.SQUARE_2X2);
      expect(types).toContain(BlockType.SQUARE_3X3);
      expect(types).toContain(BlockType.L_SMALL);
      expect(types).toContain(BlockType.L_MEDIUM);
      expect(types).toContain(BlockType.L_LARGE);
      expect(types).toContain(BlockType.T_SHAPE);
    });
  });
});
