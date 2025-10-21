/**
 * ScoreHUD 组件
 * 显示游戏分数和移动次数
 */

import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

/**
 * ScoreHUD 组件
 */
@ccclass('ScoreHUD')
export class ScoreHUD extends Component {
    @property(Label)
    scoreLabel: Label | null = null;

    @property(Label)
    moveLabel: Label | null = null;

    private currentScore: number = 0;
    private currentMoves: number = 0;

    onLoad() {
        this.updateDisplay();
    }

    /**
     * 设置分数
     */
    public setScore(score: number) {
        this.currentScore = score;
        this.updateDisplay();
    }

    /**
     * 设置移动次数
     */
    public setMoves(moves: number) {
        this.currentMoves = moves;
        this.updateDisplay();
    }

    /**
     * 同时设置分数和移动次数
     */
    public setScoreAndMoves(score: number, moves: number) {
        this.currentScore = score;
        this.currentMoves = moves;
        this.updateDisplay();
    }

    /**
     * 更新显示
     */
    private updateDisplay() {
        if (this.scoreLabel) {
            this.scoreLabel.string = `分数: ${this.currentScore}`;
        }

        if (this.moveLabel) {
            this.moveLabel.string = `步数: ${this.currentMoves}`;
        }
    }

    /**
     * 重置显示
     */
    public reset() {
        this.currentScore = 0;
        this.currentMoves = 0;
        this.updateDisplay();
    }

    /**
     * 获取当前分数
     */
    public getScore(): number {
        return this.currentScore;
    }

    /**
     * 获取当前移动次数
     */
    public getMoves(): number {
        return this.currentMoves;
    }
}
