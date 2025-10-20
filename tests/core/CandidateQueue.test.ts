/**
 * CandidateQueue 单元测试
 */

import { CandidateQueue } from '../../assets/scripts/core/CandidateQueue';
import { BlockGenerator } from '../../assets/scripts/core/BlockGenerator';
import { Block, BlockType } from '../../assets/scripts/core/Block';

describe('CandidateQueue', () => {
  let generator: BlockGenerator;
  let queue: CandidateQueue;

  beforeEach(() => {
    // 使用固定种子以便测试结果可重现
    generator = new BlockGenerator({ seed: 12345 });
  });

  describe('构造与初始化', () => {
    it('应该使用默认容量 3 创建队列', () => {
      queue = new CandidateQueue(generator);
      expect(queue.getCapacity()).toBe(3);
    });

    it('应该使用自定义容量创建队列', () => {
      queue = new CandidateQueue(generator, { capacity: 5 });
      expect(queue.getCapacity()).toBe(5);
    });

    it('应该在初始化时自动填满队列', () => {
      queue = new CandidateQueue(generator);
      expect(queue.isFull()).toBe(true);
      expect(queue.getCount()).toBe(3);
    });

    it('应该默认启用自动补充', () => {
      queue = new CandidateQueue(generator);
      expect(queue.isAutoRefillEnabled()).toBe(true);
    });

    it('应该支持禁用自动补充', () => {
      queue = new CandidateQueue(generator, { autoRefill: false });
      expect(queue.isAutoRefillEnabled()).toBe(false);
    });
  });

  describe('获取候选块', () => {
    beforeEach(() => {
      queue = new CandidateQueue(generator);
    });

    it('应该能够获取指定位置的候选块', () => {
      const block = queue.getCandidate(0);
      expect(block).toBeInstanceOf(Block);
    });

    it('应该对无效索引返回 null', () => {
      expect(queue.getCandidate(-1)).toBeNull();
      expect(queue.getCandidate(3)).toBeNull();
      expect(queue.getCandidate(100)).toBeNull();
    });

    it('应该能够获取所有候选块', () => {
      const all = queue.getAllCandidates();
      expect(all).toHaveLength(3);
      expect(all.every(block => block instanceof Block)).toBe(true);
    });

    it('getAllCandidates 应该返回浅拷贝', () => {
      const all1 = queue.getAllCandidates();
      const all2 = queue.getAllCandidates();
      expect(all1).not.toBe(all2);
      expect(all1).toEqual(all2);
    });
  });

  describe('选择候选块', () => {
    beforeEach(() => {
      queue = new CandidateQueue(generator);
    });

    it('应该能够选择并取出候选块', () => {
      const block = queue.selectCandidate(0);
      expect(block).toBeInstanceOf(Block);
    });

    it('选择后应该自动补充（当启用自动补充时）', () => {
      const beforeCount = queue.getCount();
      queue.selectCandidate(0);
      const afterCount = queue.getCount();
      expect(afterCount).toBe(beforeCount);
      expect(queue.isFull()).toBe(true);
    });

    it('选择后不应该自动补充（当禁用自动补充时）', () => {
      queue = new CandidateQueue(generator, { autoRefill: false });
      const beforeCount = queue.getCount();
      queue.selectCandidate(0);
      const afterCount = queue.getCount();
      expect(afterCount).toBe(beforeCount - 1);
      expect(queue.hasCandidate(0)).toBe(false);
    });

    it('应该对无效索引返回 null', () => {
      expect(queue.selectCandidate(-1)).toBeNull();
      expect(queue.selectCandidate(3)).toBeNull();
    });

    it('选择空位置应该返回 null', () => {
      queue.clear();
      expect(queue.selectCandidate(0)).toBeNull();
    });

    it('应该能够连续选择多个候选块', () => {
      const block1 = queue.selectCandidate(0);
      const block2 = queue.selectCandidate(1);
      const block3 = queue.selectCandidate(2);
      
      expect(block1).toBeInstanceOf(Block);
      expect(block2).toBeInstanceOf(Block);
      expect(block3).toBeInstanceOf(Block);
      expect(queue.isFull()).toBe(true);
    });
  });

  describe('手动补充', () => {
    beforeEach(() => {
      queue = new CandidateQueue(generator, { autoRefill: false });
    });

    it('应该能够手动补充指定位置', () => {
      queue.clear();
      expect(queue.hasCandidate(0)).toBe(false);
      
      queue.refillSlot(0);
      expect(queue.hasCandidate(0)).toBe(true);
    });

    it('应该对无效索引返回 false', () => {
      expect(queue.refillSlot(-1)).toBe(false);
      expect(queue.refillSlot(3)).toBe(false);
    });

    it('应该能够填满所有空位', () => {
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
      
      queue.refillAll();
      expect(queue.isFull()).toBe(true);
    });

    it('refillAll 应该只填充空位，不覆盖已有的候选块', () => {
      queue.clear();
      const testBlock = Block.createBlock(BlockType.SINGLE);
      
      // 手动设置一个特定的候选块（通过重新创建队列来模拟）
      queue.refillSlot(1);
      const middleBlock = queue.getCandidate(1);
      
      queue.refillAll();
      
      // 位置 1 的候选块应该不变
      expect(queue.getCandidate(1)).toBe(middleBlock);
      // 位置 0 和 2 应该被填充
      expect(queue.hasCandidate(0)).toBe(true);
      expect(queue.hasCandidate(2)).toBe(true);
    });
  });

  describe('队列状态查询', () => {
    beforeEach(() => {
      queue = new CandidateQueue(generator);
    });

    it('isFull 应该正确判断队列是否已满', () => {
      expect(queue.isFull()).toBe(true);
      
      queue.clear();
      expect(queue.isFull()).toBe(false);
    });

    it('isEmpty 应该正确判断队列是否为空', () => {
      expect(queue.isEmpty()).toBe(false);
      
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
    });

    it('getCount 应该返回正确的候选块数量', () => {
      expect(queue.getCount()).toBe(3);
      
      queue.clear();
      expect(queue.getCount()).toBe(0);
      
      queue.refillSlot(0);
      expect(queue.getCount()).toBe(1);
      
      queue.refillSlot(2);
      expect(queue.getCount()).toBe(2);
    });

    it('hasCandidate 应该正确判断指定位置是否有候选块', () => {
      expect(queue.hasCandidate(0)).toBe(true);
      expect(queue.hasCandidate(1)).toBe(true);
      expect(queue.hasCandidate(2)).toBe(true);
      
      queue.clear();
      expect(queue.hasCandidate(0)).toBe(false);
      expect(queue.hasCandidate(1)).toBe(false);
      expect(queue.hasCandidate(2)).toBe(false);
    });

    it('hasCandidate 应该对无效索引返回 false', () => {
      expect(queue.hasCandidate(-1)).toBe(false);
      expect(queue.hasCandidate(3)).toBe(false);
    });
  });

  describe('重置与清空', () => {
    beforeEach(() => {
      queue = new CandidateQueue(generator);
    });

    it('reset 应该清空并重新填充队列', () => {
      const oldCandidates = queue.getAllCandidates();
      queue.reset();
      const newCandidates = queue.getAllCandidates();
      
      expect(queue.isFull()).toBe(true);
      expect(newCandidates).toHaveLength(3);
      // 由于使用了种子，重置后的候选块可能与原来不同
    });

    it('clear 应该清空队列但不重新填充', () => {
      queue.clear();
      
      expect(queue.isEmpty()).toBe(true);
      expect(queue.getCount()).toBe(0);
    });
  });

  describe('自动补充开关', () => {
    it('应该能够动态切换自动补充', () => {
      queue = new CandidateQueue(generator, { autoRefill: true });
      
      queue.selectCandidate(0);
      expect(queue.hasCandidate(0)).toBe(true);
      
      queue.setAutoRefill(false);
      queue.selectCandidate(1);
      expect(queue.hasCandidate(1)).toBe(false);
      
      queue.setAutoRefill(true);
      queue.selectCandidate(2);
      expect(queue.hasCandidate(2)).toBe(true);
    });
  });

  describe('生成器管理', () => {
    beforeEach(() => {
      queue = new CandidateQueue(generator);
    });

    it('应该能够获取当前生成器', () => {
      expect(queue.getGenerator()).toBe(generator);
    });

    it('应该能够更换生成器', () => {
      const newGenerator = new BlockGenerator({ seed: 54321 });
      queue.setGenerator(newGenerator);
      
      expect(queue.getGenerator()).toBe(newGenerator);
    });

    it('更换生成器后，新补充的候选块应该来自新生成器', () => {
      const newGenerator = new BlockGenerator({ 
        seed: 99999,
        blockTypes: [BlockType.SINGLE]  // 只生成单格方块
      });
      
      queue.setGenerator(newGenerator);
      queue.clear();
      queue.refillAll();
      
      const candidates = queue.getAllCandidates();
      candidates.forEach(block => {
        expect(block?.getType()).toBe(BlockType.SINGLE);
      });
    });
  });

  describe('边界条件', () => {
    it('应该支持容量为 1 的队列', () => {
      queue = new CandidateQueue(generator, { capacity: 1 });
      
      expect(queue.getCapacity()).toBe(1);
      expect(queue.getCount()).toBe(1);
      
      const block = queue.selectCandidate(0);
      expect(block).toBeInstanceOf(Block);
      expect(queue.getCount()).toBe(1);
    });

    it('应该支持大容量队列', () => {
      queue = new CandidateQueue(generator, { capacity: 10 });
      
      expect(queue.getCapacity()).toBe(10);
      expect(queue.getCount()).toBe(10);
      expect(queue.isFull()).toBe(true);
    });
  });

  describe('与生成器的集成', () => {
    it('应该从生成器生成不同类型的候选块', () => {
      queue = new CandidateQueue(generator);
      
      const candidates = queue.getAllCandidates();
      const types = candidates.map(block => block?.getType());
      
      // 由于是随机生成，应该存在候选块
      expect(types.every(type => type !== undefined)).toBe(true);
    });

    it('应该支持受限类型的生成器', () => {
      const limitedGenerator = new BlockGenerator({
        seed: 12345,
        blockTypes: [BlockType.SINGLE, BlockType.LINE_2]
      });
      
      queue = new CandidateQueue(limitedGenerator);
      const candidates = queue.getAllCandidates();
      
      candidates.forEach(block => {
        const type = block?.getType();
        expect([BlockType.SINGLE, BlockType.LINE_2]).toContain(type);
      });
    });
  });

  describe('实际使用场景', () => {
    it('应该模拟玩家连续选择并放置候选块的流程', () => {
      queue = new CandidateQueue(generator);
      
      // 玩家选择第一个候选块
      const block1 = queue.selectCandidate(0);
      expect(block1).toBeInstanceOf(Block);
      expect(queue.isFull()).toBe(true);  // 自动补充
      
      // 玩家选择第二个候选块
      const block2 = queue.selectCandidate(1);
      expect(block2).toBeInstanceOf(Block);
      expect(queue.isFull()).toBe(true);
      
      // 玩家选择第三个候选块
      const block3 = queue.selectCandidate(2);
      expect(block3).toBeInstanceOf(Block);
      expect(queue.isFull()).toBe(true);
      
      // 队列始终保持满状态
      expect(queue.getCount()).toBe(3);
    });

    it('应该模拟游戏重新开始的流程', () => {
      queue = new CandidateQueue(generator);
      
      // 玩家进行了几次操作
      queue.selectCandidate(0);
      queue.selectCandidate(1);
      
      // 游戏重新开始
      queue.reset();
      
      // 队列应该重新填满
      expect(queue.isFull()).toBe(true);
      expect(queue.getCount()).toBe(3);
    });

    it('应该模拟禁用自动补充的特殊玩法', () => {
      queue = new CandidateQueue(generator, { autoRefill: false });
      
      // 玩家使用所有候选块
      queue.selectCandidate(0);
      queue.selectCandidate(1);
      queue.selectCandidate(2);
      
      // 队列应该为空
      expect(queue.isEmpty()).toBe(true);
      
      // 手动触发补充（例如，通过特殊道具或奖励）
      queue.refillAll();
      expect(queue.isFull()).toBe(true);
    });
  });
});
