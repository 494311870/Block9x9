import { Board } from '../../assets/scripts/core/Board';

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  describe('初始化', () => {
    it('应该创建一个 9x9 的空棋盘', () => {
      expect(board.getSize()).toBe(9);
      expect(board.getOccupiedCount()).toBe(0);
    });

    it('初始化后所有格子应该为空', () => {
      const state = board.getState();
      expect(state.length).toBe(9);
      expect(state[0].length).toBe(9);
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          expect(board.getCell(row, col)).toBe(false);
        }
      }
    });

    it('reset 方法应该清空棋盘', () => {
      board.setCell(0, 0, true);
      board.setCell(5, 5, true);
      expect(board.getOccupiedCount()).toBe(2);
      
      board.reset();
      expect(board.getOccupiedCount()).toBe(0);
    });
  });

  describe('单个格子操作', () => {
    it('应该能够设置和获取单个格子的状态', () => {
      expect(board.getCell(0, 0)).toBe(false);
      
      board.setCell(0, 0, true);
      expect(board.getCell(0, 0)).toBe(true);
      
      board.setCell(0, 0, false);
      expect(board.getCell(0, 0)).toBe(false);
    });

    it('设置有效位置应该返回 true', () => {
      expect(board.setCell(0, 0, true)).toBe(true);
      expect(board.setCell(8, 8, true)).toBe(true);
      expect(board.setCell(4, 4, true)).toBe(true);
    });

    it('设置无效位置应该返回 false', () => {
      expect(board.setCell(-1, 0, true)).toBe(false);
      expect(board.setCell(0, -1, true)).toBe(false);
      expect(board.setCell(9, 0, true)).toBe(false);
      expect(board.setCell(0, 9, true)).toBe(false);
      expect(board.setCell(10, 10, true)).toBe(false);
    });

    it('获取无效位置应该返回 false', () => {
      expect(board.getCell(-1, 0)).toBe(false);
      expect(board.getCell(0, -1)).toBe(false);
      expect(board.getCell(9, 0)).toBe(false);
      expect(board.getCell(0, 9)).toBe(false);
    });
  });

  describe('边界放置', () => {
    it('应该能够在左上角放置方块', () => {
      const positions = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 }
      ];
      
      expect(board.placeBlock(positions)).toBe(true);
      expect(board.getCell(0, 0)).toBe(true);
      expect(board.getCell(0, 1)).toBe(true);
      expect(board.getCell(1, 0)).toBe(true);
    });

    it('应该能够在右下角放置方块', () => {
      const positions = [
        { row: 8, col: 8 },
        { row: 8, col: 7 },
        { row: 7, col: 8 }
      ];
      
      expect(board.placeBlock(positions)).toBe(true);
      expect(board.getCell(8, 8)).toBe(true);
      expect(board.getCell(8, 7)).toBe(true);
      expect(board.getCell(7, 8)).toBe(true);
    });

    it('超出边界的位置应该放置失败', () => {
      const positions = [
        { row: 8, col: 8 },
        { row: 8, col: 9 }  // 超出边界
      ];
      
      expect(board.placeBlock(positions)).toBe(false);
      expect(board.getCell(8, 8)).toBe(false);  // 所有位置都不应该被放置
    });

    it('负数位置应该放置失败', () => {
      const positions = [
        { row: -1, col: 0 },
        { row: 0, col: 0 }
      ];
      
      expect(board.placeBlock(positions)).toBe(false);
    });

    it('不能在已占用的位置放置方块', () => {
      board.setCell(5, 5, true);
      
      const positions = [
        { row: 5, col: 5 },
        { row: 5, col: 6 }
      ];
      
      expect(board.placeBlock(positions)).toBe(false);
      expect(board.getCell(5, 6)).toBe(false);  // 应该整个放置失败
    });
  });

  describe('方块操作', () => {
    it('canPlaceBlock 应该正确检测是否可以放置', () => {
      const positions = [
        { row: 0, col: 0 },
        { row: 0, col: 1 }
      ];
      
      expect(board.canPlaceBlock(positions)).toBe(true);
      
      board.placeBlock(positions);
      expect(board.canPlaceBlock(positions)).toBe(false);
    });

    it('应该能够移除方块', () => {
      const positions = [
        { row: 3, col: 3 },
        { row: 3, col: 4 },
        { row: 4, col: 3 }
      ];
      
      board.placeBlock(positions);
      expect(board.getOccupiedCount()).toBe(3);
      
      board.removeBlock(positions);
      expect(board.getOccupiedCount()).toBe(0);
      expect(board.getCell(3, 3)).toBe(false);
      expect(board.getCell(3, 4)).toBe(false);
      expect(board.getCell(4, 3)).toBe(false);
    });

    it('移除无效位置应该返回 false', () => {
      const positions = [
        { row: 10, col: 10 }
      ];
      
      expect(board.removeBlock(positions)).toBe(false);
    });
  });

  describe('满行/满列检测', () => {
    it('空棋盘不应该有满行或满列', () => {
      expect(board.getFullRows()).toEqual([]);
      expect(board.getFullColumns()).toEqual([]);
    });

    it('应该能检测单个满行', () => {
      // 填满第0行
      for (let col = 0; col < 9; col++) {
        board.setCell(0, col, true);
      }
      
      const fullRows = board.getFullRows();
      expect(fullRows).toEqual([0]);
      expect(board.getFullColumns()).toEqual([]);
    });

    it('应该能检测多个满行', () => {
      // 填满第0行和第2行
      for (let col = 0; col < 9; col++) {
        board.setCell(0, col, true);
        board.setCell(2, col, true);
      }
      
      const fullRows = board.getFullRows();
      expect(fullRows).toEqual([0, 2]);
    });

    it('应该能检测单个满列', () => {
      // 填满第0列
      for (let row = 0; row < 9; row++) {
        board.setCell(row, 0, true);
      }
      
      const fullColumns = board.getFullColumns();
      expect(fullColumns).toEqual([0]);
      expect(board.getFullRows()).toEqual([]);
    });

    it('应该能检测多个满列', () => {
      // 填满第1列和第8列
      for (let row = 0; row < 9; row++) {
        board.setCell(row, 1, true);
        board.setCell(row, 8, true);
      }
      
      const fullColumns = board.getFullColumns();
      expect(fullColumns).toEqual([1, 8]);
    });

    it('应该能同时检测满行和满列', () => {
      // 填满整个棋盘
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          board.setCell(row, col, true);
        }
      }
      
      expect(board.getFullRows()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      expect(board.getFullColumns()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('不完整的行不应该被检测为满行', () => {
      // 填满第0行，但留一个空格
      for (let col = 0; col < 8; col++) {
        board.setCell(0, col, true);
      }
      // board.setCell(0, 8, true); // 故意不填
      
      expect(board.getFullRows()).toEqual([]);
    });
  });

  describe('清除行列', () => {
    it('应该能清除单个行', () => {
      // 填满第5行
      for (let col = 0; col < 9; col++) {
        board.setCell(5, col, true);
      }
      
      board.clearRows([5]);
      
      for (let col = 0; col < 9; col++) {
        expect(board.getCell(5, col)).toBe(false);
      }
    });

    it('应该能清除多个行', () => {
      // 填满第0行和第8行
      for (let col = 0; col < 9; col++) {
        board.setCell(0, col, true);
        board.setCell(8, col, true);
      }
      
      board.clearRows([0, 8]);
      
      for (let col = 0; col < 9; col++) {
        expect(board.getCell(0, col)).toBe(false);
        expect(board.getCell(8, col)).toBe(false);
      }
    });

    it('应该能清除单个列', () => {
      // 填满第3列
      for (let row = 0; row < 9; row++) {
        board.setCell(row, 3, true);
      }
      
      board.clearColumns([3]);
      
      for (let row = 0; row < 9; row++) {
        expect(board.getCell(row, 3)).toBe(false);
      }
    });

    it('应该能清除多个列', () => {
      // 填满第2列和第7列
      for (let row = 0; row < 9; row++) {
        board.setCell(row, 2, true);
        board.setCell(row, 7, true);
      }
      
      board.clearColumns([2, 7]);
      
      for (let row = 0; row < 9; row++) {
        expect(board.getCell(row, 2)).toBe(false);
        expect(board.getCell(row, 7)).toBe(false);
      }
    });

    it('同时清除行和列时，交叉格子只清除一次', () => {
      // 填满棋盘
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          board.setCell(row, col, true);
        }
      }
      
      // 清除第0行和第0列
      board.clearRows([0]);
      board.clearColumns([0]);
      
      // 检查第0行都为空
      for (let col = 0; col < 9; col++) {
        expect(board.getCell(0, col)).toBe(false);
      }
      
      // 检查第0列都为空
      for (let row = 0; row < 9; row++) {
        expect(board.getCell(row, 0)).toBe(false);
      }
      
      // 其他格子应该还是满的
      expect(board.getCell(1, 1)).toBe(true);
      expect(board.getCell(8, 8)).toBe(true);
    });

    it('清除无效的行索引不应该崩溃', () => {
      board.clearRows([10, -1]);
      // 不应该抛出异常
    });
  });

  describe('状态获取', () => {
    it('getState 应该返回当前状态的深拷贝', () => {
      board.setCell(0, 0, true);
      board.setCell(5, 5, true);
      
      const state1 = board.getState();
      expect(state1[0][0]).toBe(true);
      expect(state1[5][5]).toBe(true);
      
      // 修改返回的状态不应该影响原始棋盘
      state1[0][0] = false;
      expect(board.getCell(0, 0)).toBe(true);
      
      // 修改棋盘不应该影响之前获取的状态
      board.setCell(0, 0, false);
      expect(state1[0][0]).toBe(false);  // 这个是我们手动改的
      expect(board.getCell(0, 0)).toBe(false);
    });

    it('getOccupiedCount 应该正确统计占用的格子数', () => {
      expect(board.getOccupiedCount()).toBe(0);
      
      board.setCell(0, 0, true);
      expect(board.getOccupiedCount()).toBe(1);
      
      board.setCell(5, 5, true);
      board.setCell(8, 8, true);
      expect(board.getOccupiedCount()).toBe(3);
      
      board.setCell(0, 0, false);
      expect(board.getOccupiedCount()).toBe(2);
    });
  });

  describe('复杂场景', () => {
    it('应该正确处理放置、检测、清除的完整流程', () => {
      // 放置一个L形方块
      const lBlock = [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 2, col: 1 }
      ];
      expect(board.placeBlock(lBlock)).toBe(true);
      expect(board.getOccupiedCount()).toBe(4);
      
      // 填满第0列的其余部分
      for (let row = 3; row < 9; row++) {
        board.setCell(row, 0, true);
      }
      
      // 检测满列
      const fullColumns = board.getFullColumns();
      expect(fullColumns).toEqual([0]);
      
      // 清除满列
      board.clearColumns(fullColumns);
      expect(board.getOccupiedCount()).toBe(1);  // 只剩 (2, 1) 这个格子
      expect(board.getCell(2, 1)).toBe(true);
    });

    it('应该正确处理同时消除多行多列的情况', () => {
      // 创建十字形状，中心满行满列
      const centerRow = 4;
      const centerCol = 4;
      
      // 填满第4行
      for (let col = 0; col < 9; col++) {
        board.setCell(centerRow, col, true);
      }
      
      // 填满第4列
      for (let row = 0; row < 9; row++) {
        board.setCell(row, centerCol, true);
      }
      
      expect(board.getFullRows()).toEqual([4]);
      expect(board.getFullColumns()).toEqual([4]);
      
      // 清除
      board.clearRows([4]);
      board.clearColumns([4]);
      
      expect(board.getOccupiedCount()).toBe(0);
    });
  });
});
