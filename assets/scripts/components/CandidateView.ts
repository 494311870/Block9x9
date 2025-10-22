/**
 * CandidateView 组件
 * 负责显示候选块
 */

import { _decorator, Component, Node, Sprite, Color, UITransform } from 'cc';
import { Block } from '../core/Block';

const { ccclass, property } = _decorator;

/**
 * CandidateView 组件
 * 用于显示单个候选块
 */
@ccclass('CandidateView')
export class CandidateView extends Component {
    @property(Node)
    cellContainer: Node | null = null;

    @property
    cellSize: number = 30;

    @property
    cellGap: number = 2;

    @property(Color)
    blockColor: Color = new Color(100, 150, 255, 255);

    @property
    candidateIndex: number = 0;

    private block: Block | null = null;
    private cellNodes: Node[] = [];

    /**
     * 设置候选块数据
     */
    public setBlock(block: Block | null) {
        this.block = block;
        this.updateView();
    }

    /**
     * 获取候选块
     */
    public getBlock(): Block | null {
        return this.block;
    }

    /**
     * 获取候选块索引
     */
    public getIndex(): number {
        return this.candidateIndex;
    }

    /**
     * 更新视图
     */
    private updateView() {
        if (!this.cellContainer) {
            console.error('Cell container not set!');
            return;
        }

        // 清空现有格子
        this.cellContainer.removeAllChildren();
        this.cellNodes = [];

        if (!this.block) {
            return;
        }

        // 获取方块形状
        const shape = this.block.getShape();
        
        for (const pos of shape) {
            const cell = this.createCell(pos.row, pos.col);
            this.cellNodes.push(cell);
            this.cellContainer.addChild(cell);
        }

        // 居中显示
        this.centerBlock();
    }

    /**
     * 创建单个格子
     */
    private createCell(row: number, col: number): Node {
        const cell = new Node(`Cell_${row}_${col}`);
        
        // 添加 UITransform 组件
        const transform = cell.addComponent(UITransform);
        transform.setContentSize(this.cellSize, this.cellSize);

        // 添加 Sprite 组件
        const sprite = cell.addComponent(Sprite);
        sprite.color = this.blockColor.clone();
        sprite.type = Sprite.Type.SIMPLE;

        // 设置位置
        const x = col * (this.cellSize + this.cellGap);
        const y = -row * (this.cellSize + this.cellGap);
        cell.setPosition(x, y, 0);

        return cell;
    }

    /**
     * 居中显示方块
     */
    private centerBlock() {
        if (!this.block) return;

        const bounds = this.block.getBounds();
        const offsetX = -(bounds.width - 1) * (this.cellSize + this.cellGap) / 2;
        const offsetY = (bounds.height - 1) * (this.cellSize + this.cellGap) / 2;

        for (const cell of this.cellNodes) {
            const pos = cell.getPosition();
            cell.setPosition(pos.x + offsetX, pos.y + offsetY, 0);
        }
    }

    /**
     * 设置选中状态
     */
    public setSelected(selected: boolean) {
        const targetScale = selected ? 1.1 : 1.0;
        this.node.setScale(targetScale, targetScale, 1);
    }

    /**
     * 设置可用状态
     */
    public setEnabled(enabled: boolean) {
        const alpha = enabled ? 255 : 128;
        for (const cell of this.cellNodes) {
            const sprite = cell.getComponent(Sprite);
            if (sprite) {
                const color = sprite.color.clone();
                color.a = alpha;
                sprite.color = color;
            }
        }
    }
}
