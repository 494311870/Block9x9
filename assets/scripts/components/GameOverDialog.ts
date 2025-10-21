/**
 * GameOverDialog 组件
 * 游戏结束对话框
 */

import { _decorator, Component, Node, Label } from 'cc';

const { ccclass, property } = _decorator;

/**
 * GameOverDialog 组件
 */
@ccclass('GameOverDialog')
export class GameOverDialog extends Component {
    @property(Label)
    finalScoreLabel: Label | null = null;

    @property(Label)
    finalMovesLabel: Label | null = null;

    /**
     * 显示对话框
     */
    public show(score: number, moves: number) {
        this.node.active = true;

        if (this.finalScoreLabel) {
            this.finalScoreLabel.string = `最终分数: ${score}`;
        }

        if (this.finalMovesLabel) {
            this.finalMovesLabel.string = `移动次数: ${moves}`;
        }
    }

    /**
     * 隐藏对话框
     */
    public hide() {
        this.node.active = false;
    }

    onLoad() {
        this.hide();
    }
}
