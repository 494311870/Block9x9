/**
 * BlockGenerator 类
 * 负责随机生成 Block，支持种子以便测试
 */

import { Block, BlockType } from './Block';

/**
 * 简单的伪随机数生成器（使用线性同余生成器）
 * 用于支持可重现的随机序列
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * 生成下一个随机数 (0-1)
   */
  public next(): number {
    // 线性同余生成器参数（来自 MINSTD）
    const a = 48271;
    const m = 2147483647; // 2^31 - 1
    this.seed = (a * this.seed) % m;
    return this.seed / m;
  }

  /**
   * 生成指定范围内的随机整数 [min, max)
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}

/**
 * BlockGenerator 配置接口
 */
export interface BlockGeneratorConfig {
  seed?: number;
  blockTypes?: BlockType[];
}

/**
 * BlockGenerator 类
 */
export class BlockGenerator {
  private random: SeededRandom | null;
  private availableTypes: BlockType[];

  /**
   * 创建 BlockGenerator
   * @param config 配置项
   *   - seed: 随机种子（可选），如果提供则使用确定性随机
   *   - blockTypes: 可生成的方块类型数组（可选），默认使用所有类型
   */
  constructor(config?: BlockGeneratorConfig) {
    if (config?.seed !== undefined) {
      this.random = new SeededRandom(config.seed);
    } else {
      this.random = null;
    }

    this.availableTypes = config?.blockTypes || [
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
  }

  /**
   * 生成一个随机方块
   * @returns Block 实例
   */
  public generate(): Block {
    const index = this.getRandomInt(0, this.availableTypes.length);
    const type = this.availableTypes[index];
    return Block.createBlock(type);
  }

  /**
   * 生成多个随机方块
   * @param count 生成数量
   * @returns Block 实例数组
   */
  public generateMultiple(count: number): Block[] {
    const blocks: Block[] = [];
    for (let i = 0; i < count; i++) {
      blocks.push(this.generate());
    }
    return blocks;
  }

  /**
   * 生成指定类型的方块
   * @param type 方块类型
   * @returns Block 实例
   */
  public generateType(type: BlockType): Block {
    if (!this.availableTypes.includes(type)) {
      throw new Error(`Block type ${type} is not available in this generator`);
    }
    return Block.createBlock(type);
  }

  /**
   * 获取可用的方块类型列表
   */
  public getAvailableTypes(): BlockType[] {
    return [...this.availableTypes];
  }

  /**
   * 设置可用的方块类型
   * @param types 方块类型数组
   */
  public setAvailableTypes(types: BlockType[]): void {
    if (types.length === 0) {
      throw new Error('Available types cannot be empty');
    }
    this.availableTypes = [...types];
  }

  /**
   * 重置随机种子
   * @param seed 新的种子值
   */
  public resetSeed(seed: number): void {
    this.random = new SeededRandom(seed);
  }

  /**
   * 获取随机整数
   */
  private getRandomInt(min: number, max: number): number {
    if (this.random) {
      return this.random.nextInt(min, max);
    } else {
      return Math.floor(Math.random() * (max - min)) + min;
    }
  }
}

/**
 * 创建默认生成器（无种子）
 */
export function createDefaultGenerator(): BlockGenerator {
  return new BlockGenerator();
}

/**
 * 创建测试用生成器（有种子）
 * @param seed 随机种子
 */
export function createTestGenerator(seed: number = 12345): BlockGenerator {
  return new BlockGenerator({ seed });
}
