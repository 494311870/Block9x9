/**
 * BoardView 组件
 * 负责 9x9 棋盘的可视化显示
 */

import { _decorator, Component, Node, Sprite, Color, UITransform, instantiate, Prefab } from 'cc';
import { Board } from '../core/Board';

const { ccclass, property } = _decorator;

/**
 * BoardView 组件
 * 用于在场景中显示和更新棋盘状态
 */
@ccclass('BoardView')
export class BoardView extends Component {
    @property(Node)
    cellContainer: Node | null = null;

    @property
    cellSize: number = 50;

    @property
    cellGap: number = 2;

    @property(Color)
    emptyCellColor: Color = new Color(240, 240, 240, 255);

    @property(Color)
    filledCellColor: Color = new Color(100, 150, 255, 255);

    @property(Color)
    previewValidColor: Color = new Color(100, 255, 100, 150);

    @property(Color)
    previewInvalidColor: Color = new Color(255, 100, 100, 150);

    private cellNodes: Node[][] = [];
    private board: Board | null = null;

    onLoad() {
        this.initializeCells();
    }

    /**
     * 初始化棋盘格子
     */
    private initializeCells() {
        if (!this.cellContainer) {
            console.error('Cell container not set!');
            return;
        }

        // 清空容器
        this.cellContainer.removeAllChildren();
        this.cellNodes = [];

        const boardSize = 9;
        const totalSize = this.cellSize * boardSize + this.cellGap * (boardSize - 1);
        const startX = -totalSize / 2 + this.cellSize / 2;
        const startY = totalSize / 2 - this.cellSize / 2;

        for (let row = 0; row < boardSize; row++) {
            this.cellNodes[row] = [];
            for (let col = 0; col < boardSize; col++) {
                const cell = this.createCell(row, col, startX, startY);
                this.cellNodes[row][col] = cell;
                this.cellContainer.addChild(cell);
            }
        }
    }

    /**
     * 创建单个格子节点
     */
    private createCell(row: number, col: number, startX: number, startY: number): Node {
        const cell = new Node(`Cell_${row}_${col}`);
        
        // 添加 UITransform 组件
        const transform = cell.addComponent(UITransform);
        transform.setContentSize(this.cellSize, this.cellSize);

        // 添加 Sprite 组件用于显示颜色
        const sprite = cell.addComponent(Sprite);
        sprite.color = this.emptyCellColor.clone();
        sprite.type = Sprite.Type.SIMPLE;

        // 设置位置
        const x = startX + col * (this.cellSize + this.cellGap);
        const y = startY - row * (this.cellSize + this.cellGap);
        cell.setPosition(x, y, 0);

        return cell;
    }

    /**
     * 设置绑定的棋盘数据
     */
    public setBoard(board: Board) {
        this.board = board;
        this.updateView();
    }

    /**
     * 更新视图显示
     */
    public updateView() {
        if (!this.board) return;

        const state = this.board.getState();
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.cellNodes[row]?.[col];
                if (cell) {
                    const sprite = cell.getComponent(Sprite);
                    if (sprite) {
                        sprite.color = state[row][col] 
                            ? this.filledCellColor.clone() 
                            : this.emptyCellColor.clone();
                    }
                }
            }
        }
    }

    /**
     * 显示放置预览
     */
    public showPreview(positions: { row: number; col: number }[], isValid: boolean) {
        const previewColor = isValid ? this.previewValidColor : this.previewInvalidColor;
        
        for (const pos of positions) {
            const cell = this.cellNodes[pos.row]?.[pos.col];
            if (cell) {
                const sprite = cell.getComponent(Sprite);
                if (sprite) {
                    sprite.color = previewColor.clone();
                }
            }
        }
    }

    /**
     * 清除预览
     */
    public clearPreview() {
        this.updateView();
    }

    /**
     * 获取格子在世界坐标中的位置
     */
    public getCellWorldPosition(row: number, col: number): { x: number; y: number } | null {
        const cell = this.cellNodes[row]?.[col];
        if (!cell) return null;

        const worldPos = cell.getWorldPosition();
        return { x: worldPos.x, y: worldPos.y };
    }

    /**
     * 根据世界坐标获取对应的格子位置
     */
    public getGridPositionFromWorld(worldX: number, worldY: number): { row: number; col: number } | null {
        if (!this.cellContainer) return null;

        const containerWorldPos = this.cellContainer.getWorldPosition();
        const localX = worldX - containerWorldPos.x;
        const localY = worldY - containerWorldPos.y;

        const boardSize = 9;
        const totalSize = this.cellSize * boardSize + this.cellGap * (boardSize - 1);
        const startX = -totalSize / 2;
        const startY = totalSize / 2;

        // 计算行列
        const col = Math.floor((localX - startX) / (this.cellSize + this.cellGap));
        const row = Math.floor((startY - localY) / (this.cellSize + this.cellGap));

        // 检查边界
        if (row < 0 || row >= 9 || col < 0 || col >= 9) {
            return null;
        }

        return { row, col };
    }
}
