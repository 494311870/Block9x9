/**
 * Board 类
 * 负责管理 9x9 棋盘的状态和基本操作
 */
export class Board {
  private readonly size: number = 9;
  private grid: boolean[][];

  constructor() {
    this.grid = this.createEmptyGrid();
  }

  /**
   * 创建空棋盘
   */
  private createEmptyGrid(): boolean[][] {
    return Array.from({ length: this.size }, () => 
      Array.from({ length: this.size }, () => false)
    );
  }

  /**
   * 获取棋盘大小
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * 重置棋盘
   */
  public reset(): void {
    this.grid = this.createEmptyGrid();
  }

  /**
   * 获取指定位置的状态
   * @param row 行索引 (0-8)
   * @param col 列索引 (0-8)
   * @returns 该位置是否被占用
   */
  public getCell(row: number, col: number): boolean {
    if (!this.isValidPosition(row, col)) {
      return false;
    }
    return this.grid[row][col];
  }

  /**
   * 检查位置是否有效
   */
  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  /**
   * 设置单个格子的状态
   * @param row 行索引
   * @param col 列索引
   * @param occupied 是否占用
   * @returns 是否设置成功
   */
  public setCell(row: number, col: number, occupied: boolean): boolean {
    if (!this.isValidPosition(row, col)) {
      return false;
    }
    this.grid[row][col] = occupied;
    return true;
  }

  /**
   * 放置一组格子
   * @param positions 要放置的位置数组 [{row, col}, ...]
   * @returns 是否放置成功
   */
  public placeBlock(positions: { row: number; col: number }[]): boolean {
    // 检查所有位置是否有效且未被占用
    for (const pos of positions) {
      if (!this.isValidPosition(pos.row, pos.col) || this.grid[pos.row][pos.col]) {
        return false;
      }
    }

    // 放置方块
    for (const pos of positions) {
      this.grid[pos.row][pos.col] = true;
    }

    return true;
  }

  /**
   * 移除一组格子
   * @param positions 要移除的位置数组
   * @returns 是否移除成功
   */
  public removeBlock(positions: { row: number; col: number }[]): boolean {
    // 检查所有位置是否有效
    for (const pos of positions) {
      if (!this.isValidPosition(pos.row, pos.col)) {
        return false;
      }
    }

    // 移除方块
    for (const pos of positions) {
      this.grid[pos.row][pos.col] = false;
    }

    return true;
  }

  /**
   * 检测满行
   * @returns 满行的行索引数组
   */
  public getFullRows(): number[] {
    const fullRows: number[] = [];
    
    for (let row = 0; row < this.size; row++) {
      if (this.grid[row].every(cell => cell)) {
        fullRows.push(row);
      }
    }

    return fullRows;
  }

  /**
   * 检测满列
   * @returns 满列的列索引数组
   */
  public getFullColumns(): number[] {
    const fullColumns: number[] = [];
    
    for (let col = 0; col < this.size; col++) {
      let isFull = true;
      for (let row = 0; row < this.size; row++) {
        if (!this.grid[row][col]) {
          isFull = false;
          break;
        }
      }
      if (isFull) {
        fullColumns.push(col);
      }
    }

    return fullColumns;
  }

  /**
   * 清除指定的行
   * @param rows 要清除的行索引数组
   */
  public clearRows(rows: number[]): void {
    for (const row of rows) {
      if (this.isValidPosition(row, 0)) {
        for (let col = 0; col < this.size; col++) {
          this.grid[row][col] = false;
        }
      }
    }
  }

  /**
   * 清除指定的列
   * @param columns 要清除的列索引数组
   */
  public clearColumns(columns: number[]): void {
    for (const col of columns) {
      if (this.isValidPosition(0, col)) {
        for (let row = 0; row < this.size; row++) {
          this.grid[row][col] = false;
        }
      }
    }
  }

  /**
   * 获取当前棋盘状态矩阵（深拷贝）
   * @returns 棋盘状态的二维数组
   */
  public getState(): boolean[][] {
    return this.grid.map(row => [...row]);
  }

  /**
   * 获取已占用格子的数量
   */
  public getOccupiedCount(): number {
    let count = 0;
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col]) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * 检查是否可以在指定位置放置方块
   * @param positions 要检查的位置数组
   * @returns 是否可以放置
   */
  public canPlaceBlock(positions: { row: number; col: number }[]): boolean {
    for (const pos of positions) {
      if (!this.isValidPosition(pos.row, pos.col) || this.grid[pos.row][pos.col]) {
        return false;
      }
    }
    return true;
  }
}
