/**
 * PlacementManager 类
 * 负责管理方块放置的完整流程：验证 → 放置 → 检测 → 消除 → 计分
 */

import { Board } from './Board';
import { Position } from './Block';

/**
 * 放置结果接口
 */
export interface PlacementResult {
  /** 是否放置成功 */
  success: boolean;
  /** 消除的行索引数组 */
  clearedRows: number[];
  /** 消除的列索引数组 */
  clearedColumns: number[];
  /** 本次获得的分数 */
  score: number;
  /** 失败原因（如果放置失败） */
  reason?: string;
}

/**
 * 得分配置接口
 */
export interface ScoreConfig {
  /** 每放置一个格子的基础分 */
  cellPlacementScore: number;
  /** 每消除一行/列的基础分 */
  lineScore: number;
  /** 连消奖励系数（消除N行/列时的额外奖励） */
  comboMultiplier: number;
}

/**
 * PlacementManager 类
 */
export class PlacementManager {
  private board: Board;
  private scoreConfig: ScoreConfig;

  /**
   * 构造函数
   * @param board 棋盘实例
   * @param scoreConfig 得分配置（可选，使用默认配置）
   */
  constructor(board: Board, scoreConfig?: Partial<ScoreConfig>) {
    this.board = board;
    this.scoreConfig = {
      cellPlacementScore: scoreConfig?.cellPlacementScore ?? 1,
      lineScore: scoreConfig?.lineScore ?? 10,
      comboMultiplier: scoreConfig?.comboMultiplier ?? 1.5
    };
  }

  /**
   * 执行完整的放置流程
   * @param positions 要放置的位置数组
   * @returns 放置结果
   */
  public place(positions: Position[]): PlacementResult {
    // 1. 验证是否可以放置
    if (!this.board.canPlaceBlock(positions)) {
      return {
        success: false,
        clearedRows: [],
        clearedColumns: [],
        score: 0,
        reason: this.getFailureReason(positions)
      };
    }

    // 2. 放置方块
    this.board.placeBlock(positions);

    // 3. 检测满行/满列
    const fullRows = this.board.getFullRows();
    const fullColumns = this.board.getFullColumns();

    // 4. 消除满行/满列
    if (fullRows.length > 0) {
      this.board.clearRows(fullRows);
    }
    if (fullColumns.length > 0) {
      this.board.clearColumns(fullColumns);
    }

    // 5. 计算得分
    const score = this.calculateScore(positions.length, fullRows.length, fullColumns.length);

    return {
      success: true,
      clearedRows: fullRows,
      clearedColumns: fullColumns,
      score
    };
  }

  /**
   * 计算得分
   * @param cellCount 放置的格子数量
   * @param rowCount 消除的行数
   * @param columnCount 消除的列数
   * @returns 总得分
   */
  public calculateScore(cellCount: number, rowCount: number, columnCount: number): number {
    // 基础分：放置格子分数
    let score = cellCount * this.scoreConfig.cellPlacementScore;

    // 消除行列的总数
    const totalLines = rowCount + columnCount;

    if (totalLines > 0) {
      // 基础消除分
      const lineScore = totalLines * this.scoreConfig.lineScore;
      
      // 连消奖励（当消除2条及以上时）
      let comboBonus = 0;
      if (totalLines >= 2) {
        // 连消奖励 = 基础消除分 × (连消数 - 1) × 连消系数
        comboBonus = Math.floor(lineScore * (totalLines - 1) * (this.scoreConfig.comboMultiplier - 1));
      }

      score += lineScore + comboBonus;
    }

    return score;
  }

  /**
   * 获取放置失败的原因
   * @param positions 尝试放置的位置
   * @returns 失败原因描述
   */
  private getFailureReason(positions: Position[]): string {
    // 检查是否有位置越界
    for (const pos of positions) {
      if (pos.row < 0 || pos.row >= this.board.getSize() || 
          pos.col < 0 || pos.col >= this.board.getSize()) {
        return 'Out of bounds';
      }
    }

    // 检查是否有位置已被占用
    for (const pos of positions) {
      if (this.board.getCell(pos.row, pos.col)) {
        return 'Position occupied';
      }
    }

    return 'Unknown error';
  }

  /**
   * 获取当前得分配置
   */
  public getScoreConfig(): ScoreConfig {
    return { ...this.scoreConfig };
  }

  /**
   * 更新得分配置
   * @param config 新的得分配置（部分更新）
   */
  public updateScoreConfig(config: Partial<ScoreConfig>): void {
    this.scoreConfig = {
      ...this.scoreConfig,
      ...config
    };
  }
}
