/**
 * CandidateQueue 类
 * 管理玩家可选择的候选木块队列
 */

import { Block } from './Block';
import { BlockGenerator } from './BlockGenerator';

/**
 * 候选块队列配置
 */
export interface CandidateQueueConfig {
  /** 队列容量（默认 3） */
  capacity?: number;
  /** 自动补充（默认 true） */
  autoRefill?: boolean;
}

/**
 * CandidateQueue 类
 */
export class CandidateQueue {
  private candidates: (Block | null)[];
  private generator: BlockGenerator;
  private capacity: number;
  private autoRefill: boolean;

  /**
   * 构造函数
   * @param generator 方块生成器实例
   * @param config 配置选项
   */
  constructor(generator: BlockGenerator, config?: CandidateQueueConfig) {
    this.generator = generator;
    this.capacity = config?.capacity ?? 3;
    this.autoRefill = config?.autoRefill ?? true;
    this.candidates = new Array(this.capacity).fill(null);
    
    // 初始化时填满队列
    this.refillAll();
  }

  /**
   * 获取候选队列的容量
   */
  public getCapacity(): number {
    return this.capacity;
  }

  /**
   * 获取指定位置的候选块
   * @param index 队列索引 (0 到 capacity-1)
   * @returns Block 实例或 null
   */
  public getCandidate(index: number): Block | null {
    if (index < 0 || index >= this.capacity) {
      return null;
    }
    return this.candidates[index];
  }

  /**
   * 获取所有候选块（浅拷贝）
   * @returns 候选块数组
   */
  public getAllCandidates(): (Block | null)[] {
    return [...this.candidates];
  }

  /**
   * 选择并取出候选块
   * @param index 队列索引
   * @returns 取出的 Block 实例，如果索引无效或该位置为空则返回 null
   */
  public selectCandidate(index: number): Block | null {
    if (index < 0 || index >= this.capacity) {
      return null;
    }

    const selected = this.candidates[index];
    if (selected === null) {
      return null;
    }

    // 清空该位置
    this.candidates[index] = null;

    // 自动补充
    if (this.autoRefill) {
      this.candidates[index] = this.generator.generate();
    }

    return selected;
  }

  /**
   * 手动补充指定位置
   * @param index 队列索引
   * @returns 是否补充成功
   */
  public refillSlot(index: number): boolean {
    if (index < 0 || index >= this.capacity) {
      return false;
    }

    this.candidates[index] = this.generator.generate();
    return true;
  }

  /**
   * 填满所有空位
   */
  public refillAll(): void {
    for (let i = 0; i < this.capacity; i++) {
      if (this.candidates[i] === null) {
        this.candidates[i] = this.generator.generate();
      }
    }
  }

  /**
   * 检查队列是否已满
   * @returns 所有位置都有候选块则返回 true
   */
  public isFull(): boolean {
    return this.candidates.every(block => block !== null);
  }

  /**
   * 检查队列是否为空
   * @returns 所有位置都为空则返回 true
   */
  public isEmpty(): boolean {
    return this.candidates.every(block => block === null);
  }

  /**
   * 获取当前有效候选块的数量
   */
  public getCount(): number {
    return this.candidates.filter(block => block !== null).length;
  }

  /**
   * 重置队列（清空并重新填充）
   */
  public reset(): void {
    this.candidates.fill(null);
    this.refillAll();
  }

  /**
   * 清空队列（不重新填充）
   */
  public clear(): void {
    this.candidates.fill(null);
  }

  /**
   * 检查指定位置是否有候选块
   * @param index 队列索引
   */
  public hasCandidate(index: number): boolean {
    if (index < 0 || index >= this.capacity) {
      return false;
    }
    return this.candidates[index] !== null;
  }

  /**
   * 设置自动补充开关
   * @param enable 是否启用自动补充
   */
  public setAutoRefill(enable: boolean): void {
    this.autoRefill = enable;
  }

  /**
   * 获取自动补充状态
   */
  public isAutoRefillEnabled(): boolean {
    return this.autoRefill;
  }

  /**
   * 更换生成器实例
   * @param generator 新的生成器
   */
  public setGenerator(generator: BlockGenerator): void {
    this.generator = generator;
  }

  /**
   * 获取当前生成器实例
   */
  public getGenerator(): BlockGenerator {
    return this.generator;
  }
}
