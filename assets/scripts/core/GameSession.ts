/**
 * GameSession 类
 * 管理完整的游戏会话，整合候选块队列、棋盘和放置管理器
 */

import { Board } from './Board';
import { Block } from './Block';
import { BlockGenerator } from './BlockGenerator';
import { CandidateQueue } from './CandidateQueue';
import { PlacementManager, PlacementResult } from './PlacementManager';

/**
 * 游戏状态枚举
 */
export enum GameState {
  READY = 'READY',         // 准备就绪
  PLAYING = 'PLAYING',     // 游戏中
  GAME_OVER = 'GAME_OVER'  // 游戏结束
}

/**
 * 放置候选块的结果
 */
export interface PlaceCandidateResult extends PlacementResult {
  /** 游戏是否结束 */
  gameOver: boolean;
}

/**
 * GameSession 配置
 */
export interface GameSessionConfig {
  /** 候选块队列容量（默认 3） */
  queueCapacity?: number;
  /** 随机种子（用于可重现的游戏） */
  seed?: number;
}

/**
 * GameSession 类
 */
export class GameSession {
  private board: Board;
  private generator: BlockGenerator;
  private queue: CandidateQueue;
  private placementManager: PlacementManager;
  private totalScore: number;
  private moveCount: number;
  private gameState: GameState;

  /**
   * 构造函数
   * @param config 游戏配置
   */
  constructor(config?: GameSessionConfig) {
    this.board = new Board();
    this.generator = new BlockGenerator(config?.seed !== undefined ? { seed: config.seed } : undefined);
    this.queue = new CandidateQueue(this.generator, { capacity: config?.queueCapacity });
    this.placementManager = new PlacementManager(this.board);
    this.totalScore = 0;
    this.moveCount = 0;
    this.gameState = GameState.READY;
  }

  /**
   * 开始游戏
   */
  public start(): void {
    this.reset();
    this.gameState = GameState.PLAYING;
  }

  /**
   * 重置游戏
   */
  public reset(): void {
    this.board.reset();
    this.queue.reset();
    this.totalScore = 0;
    this.moveCount = 0;
    this.gameState = GameState.READY;
  }

  /**
   * 放置候选块到棋盘
   * @param candidateIndex 候选块在队列中的索引
   * @param row 目标行坐标
   * @param col 目标列坐标
   * @returns 放置结果
   */
  public placeCandidate(candidateIndex: number, row: number, col: number): PlaceCandidateResult {
    // 检查游戏状态
    if (this.gameState !== GameState.PLAYING) {
      return {
        success: false,
        clearedRows: [],
        clearedColumns: [],
        score: 0,
        gameOver: false,
        reason: 'Game not started'
      };
    }

    // 获取候选块
    const candidate = this.queue.getCandidate(candidateIndex);
    if (!candidate) {
      return {
        success: false,
        clearedRows: [],
        clearedColumns: [],
        score: 0,
        gameOver: false,
        reason: 'Invalid candidate index'
      };
    }

    // 计算绝对位置
    const positions = candidate.getAbsolutePositions(row, col);

    // 尝试放置
    const result = this.placementManager.place(positions);

    if (result.success) {
      // 放置成功，从队列中移除并补充
      this.queue.selectCandidate(candidateIndex);
      
      // 更新分数和移动次数
      this.totalScore += result.score;
      this.moveCount++;

      // 检查游戏是否结束
      const gameOver = this.checkGameOver();
      if (gameOver) {
        this.gameState = GameState.GAME_OVER;
      }

      return {
        ...result,
        gameOver
      };
    }

    // 放置失败
    return {
      ...result,
      gameOver: false
    };
  }

  /**
   * 检查游戏是否结束
   * 游戏结束条件：所有候选块都无法在棋盘上找到合法放置位置
   * @returns 是否游戏结束
   */
  private checkGameOver(): boolean {
    const candidates = this.queue.getAllCandidates();
    
    for (const candidate of candidates) {
      if (candidate === null) {
        continue;
      }

      // 检查该候选块是否有任何合法位置
      if (this.canPlaceAnywhere(candidate)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 检查指定方块是否能在棋盘的任意位置放置
   * @param block 要检查的方块
   * @returns 是否有合法位置
   */
  private canPlaceAnywhere(block: Block): boolean {
    const size = this.board.getSize();
    const shape = block.getShape();
    
    // 获取方块的边界
    const bounds = block.getBounds();
    
    // 遍历所有可能的放置位置
    for (let row = 0; row <= size - bounds.height; row++) {
      for (let col = 0; col <= size - bounds.width; col++) {
        const positions = block.getAbsolutePositions(row, col);
        if (this.board.canPlaceBlock(positions)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检查指定候选块是否可以在指定位置放置
   * @param candidateIndex 候选块索引
   * @param row 目标行
   * @param col 目标列
   * @returns 是否可以放置
   */
  public canPlaceCandidate(candidateIndex: number, row: number, col: number): boolean {
    const candidate = this.queue.getCandidate(candidateIndex);
    if (!candidate) {
      return false;
    }

    const positions = candidate.getAbsolutePositions(row, col);
    return this.board.canPlaceBlock(positions);
  }

  /**
   * 获取当前总分
   */
  public getTotalScore(): number {
    return this.totalScore;
  }

  /**
   * 获取当前移动次数
   */
  public getMoveCount(): number {
    return this.moveCount;
  }

  /**
   * 获取游戏状态
   */
  public getGameState(): GameState {
    return this.gameState;
  }

  /**
   * 获取棋盘实例（只读访问）
   */
  public getBoard(): Board {
    return this.board;
  }

  /**
   * 获取候选队列实例（只读访问）
   */
  public getCandidateQueue(): CandidateQueue {
    return this.queue;
  }

  /**
   * 获取所有候选块
   */
  public getCandidates(): (Block | null)[] {
    return this.queue.getAllCandidates();
  }

  /**
   * 获取指定候选块
   * @param index 候选块索引
   */
  public getCandidate(index: number): Block | null {
    return this.queue.getCandidate(index);
  }

  /**
   * 检查是否游戏结束
   */
  public isGameOver(): boolean {
    return this.gameState === GameState.GAME_OVER;
  }

  /**
   * 检查游戏是否进行中
   */
  public isPlaying(): boolean {
    return this.gameState === GameState.PLAYING;
  }

  /**
   * 获取放置管理器实例
   */
  public getPlacementManager(): PlacementManager {
    return this.placementManager;
  }
}
