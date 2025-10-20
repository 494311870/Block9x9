/**
 * Block 类
 * 表示游戏中的木块，支持多种形状
 */

/**
 * 位置坐标接口
 */
export interface Position {
  row: number;
  col: number;
}

/**
 * Block 类型枚举
 */
export enum BlockType {
  SINGLE = 'SINGLE',           // 单格
  LINE_2 = 'LINE_2',           // 2格直线
  LINE_3 = 'LINE_3',           // 3格直线
  LINE_4 = 'LINE_4',           // 4格直线
  LINE_5 = 'LINE_5',           // 5格直线
  SQUARE_2X2 = 'SQUARE_2X2',   // 2x2方块
  SQUARE_3X3 = 'SQUARE_3X3',   // 3x3方块
  L_SMALL = 'L_SMALL',         // 小L形（3格）
  L_MEDIUM = 'L_MEDIUM',       // 中L形（4格）
  L_LARGE = 'L_LARGE',         // 大L形（5格）
  T_SHAPE = 'T_SHAPE',         // T形（5格）
}

/**
 * Block 序列化数据接口
 */
export interface BlockData {
  type: BlockType;
  shape: Position[];
  rotation: number;
}

/**
 * Block 类
 */
export class Block {
  private type: BlockType;
  private shape: Position[];
  private rotation: number = 0;

  constructor(type: BlockType, shape: Position[]) {
    this.type = type;
    this.shape = [...shape];
  }

  /**
   * 获取方块类型
   */
  public getType(): BlockType {
    return this.type;
  }

  /**
   * 获取方块形状（相对坐标）
   */
  public getShape(): Position[] {
    return this.shape.map(pos => ({ ...pos }));
  }

  /**
   * 获取当前旋转角度（0, 90, 180, 270）
   */
  public getRotation(): number {
    return this.rotation;
  }

  /**
   * 获取方块在指定位置的绝对坐标
   * @param baseRow 基准行坐标
   * @param baseCol 基准列坐标
   * @returns 绝对位置数组
   */
  public getAbsolutePositions(baseRow: number, baseCol: number): Position[] {
    return this.shape.map(pos => ({
      row: baseRow + pos.row,
      col: baseCol + pos.col
    }));
  }

  /**
   * 旋转方块（顺时针90度）
   * 旋转公式：(x, y) -> (y, -x)
   * @returns 新的 Block 实例
   */
  public rotate(): Block {
    const newShape = this.shape.map(pos => ({
      row: pos.col,
      col: -pos.row
    }));

    // 归一化坐标（使最小值为0）
    const normalizedShape = this.normalizeShape(newShape);
    
    const newBlock = new Block(this.type, normalizedShape);
    newBlock.rotation = (this.rotation + 90) % 360;
    return newBlock;
  }

  /**
   * 归一化形状坐标（使最小行列都为0）
   */
  private normalizeShape(shape: Position[]): Position[] {
    if (shape.length === 0) return [];

    const minRow = Math.min(...shape.map(p => p.row));
    const minCol = Math.min(...shape.map(p => p.col));

    return shape.map(pos => ({
      row: pos.row - minRow,
      col: pos.col - minCol
    }));
  }

  /**
   * 克隆方块
   * @returns 新的 Block 实例
   */
  public clone(): Block {
    const newBlock = new Block(this.type, this.shape);
    newBlock.rotation = this.rotation;
    return newBlock;
  }

  /**
   * 序列化方块数据
   * @returns 序列化后的数据对象
   */
  public serialize(): BlockData {
    return {
      type: this.type,
      shape: this.getShape(),
      rotation: this.rotation
    };
  }

  /**
   * 从序列化数据反序列化
   * @param data 序列化的数据
   * @returns Block 实例
   */
  public static deserialize(data: BlockData): Block {
    const block = new Block(data.type, data.shape);
    block.rotation = data.rotation;
    return block;
  }

  /**
   * 获取方块的边界框大小
   * @returns {width, height}
   */
  public getBounds(): { width: number; height: number } {
    if (this.shape.length === 0) {
      return { width: 0, height: 0 };
    }

    const maxRow = Math.max(...this.shape.map(p => p.row));
    const maxCol = Math.max(...this.shape.map(p => p.col));

    return {
      width: maxCol + 1,
      height: maxRow + 1
    };
  }

  /**
   * 获取方块包含的格子数量
   */
  public getCellCount(): number {
    return this.shape.length;
  }

  /**
   * 创建预定义形状的方块
   */
  public static createBlock(type: BlockType): Block {
    const shapes: Record<BlockType, Position[]> = {
      [BlockType.SINGLE]: [
        { row: 0, col: 0 }
      ],
      [BlockType.LINE_2]: [
        { row: 0, col: 0 },
        { row: 0, col: 1 }
      ],
      [BlockType.LINE_3]: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 }
      ],
      [BlockType.LINE_4]: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 }
      ],
      [BlockType.LINE_5]: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
        { row: 0, col: 4 }
      ],
      [BlockType.SQUARE_2X2]: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 }
      ],
      [BlockType.SQUARE_3X3]: [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
        { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
        { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }
      ],
      [BlockType.L_SMALL]: [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 1, col: 1 }
      ],
      [BlockType.L_MEDIUM]: [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 2, col: 1 }
      ],
      [BlockType.L_LARGE]: [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 3, col: 0 },
        { row: 3, col: 1 }
      ],
      [BlockType.T_SHAPE]: [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 1 }
      ]
    };

    const shape = shapes[type];
    if (!shape) {
      throw new Error(`Unknown block type: ${type}`);
    }

    return new Block(type, shape);
  }
}
