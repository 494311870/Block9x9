/**
 * GameController 组件
 * 游戏主控制器，整合所有UI组件和游戏逻辑
 */

import { _decorator, Component, Node, EventTouch, Vec3, Button } from 'cc';
import { GameSession, GameState } from '../core/GameSession';
import { BoardView } from './BoardView';
import { CandidateView } from './CandidateView';
import { ScoreHUD } from './ScoreHUD';
import { GameOverDialog } from './GameOverDialog';
import { Block } from '../core/Block';

const { ccclass, property } = _decorator;

/**
 * GameController 组件
 */
@ccclass('GameController')
export class GameController extends Component {
    @property(BoardView)
    boardView: BoardView | null = null;

    @property([CandidateView])
    candidateViews: CandidateView[] = [];

    @property(ScoreHUD)
    scoreHUD: ScoreHUD | null = null;

    @property(GameOverDialog)
    gameOverDialog: GameOverDialog | null = null;

    @property(Button)
    startButton: Button | null = null;

    @property(Button)
    restartButton: Button | null = null;

    private gameSession: GameSession | null = null;
    private selectedCandidateIndex: number = -1;
    private selectedBlock: Block | null = null;

    onLoad() {
        // 初始化游戏会话
        this.gameSession = new GameSession();

        // 绑定棋盘
        if (this.boardView) {
            this.boardView.setBoard(this.gameSession.getBoard());
        }

        // 设置按钮点击事件
        if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this.onStartGame, this);
        }

        if (this.restartButton) {
            this.restartButton.node.on(Button.EventType.CLICK, this.onRestartGame, this);
        }

        // 为候选块添加点击事件
        this.candidateViews.forEach((view, index) => {
            view.node.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
                this.onCandidateClicked(index);
            }, this);
        });

        // 为棋盘添加点击事件
        if (this.boardView) {
            this.boardView.node.on(Node.EventType.TOUCH_END, this.onBoardClicked, this);
        }

        this.updateUI();
    }

    /**
     * 开始游戏
     */
    private onStartGame() {
        if (!this.gameSession) return;

        this.gameSession.start();
        this.updateUI();

        // 隐藏开始按钮
        if (this.startButton) {
            this.startButton.node.active = false;
        }

        // 显示重新开始按钮
        if (this.restartButton) {
            this.restartButton.node.active = true;
        }
    }

    /**
     * 重新开始游戏
     */
    private onRestartGame() {
        if (!this.gameSession) return;

        this.gameSession.start();
        this.selectedCandidateIndex = -1;
        this.selectedBlock = null;

        // 隐藏游戏结束对话框
        if (this.gameOverDialog) {
            this.gameOverDialog.hide();
        }

        this.updateUI();
    }

    /**
     * 候选块被点击
     */
    private onCandidateClicked(index: number) {
        if (!this.gameSession || !this.gameSession.isPlaying()) {
            return;
        }

        const candidate = this.gameSession.getCandidate(index);
        if (!candidate) {
            return;
        }

        // 选中候选块
        this.selectedCandidateIndex = index;
        this.selectedBlock = candidate;

        // 更新候选块视图
        this.candidateViews.forEach((view, i) => {
            view.setSelected(i === index);
        });
    }

    /**
     * 棋盘被点击
     */
    private onBoardClicked(event: EventTouch) {
        if (!this.gameSession || !this.gameSession.isPlaying()) {
            return;
        }

        if (this.selectedCandidateIndex === -1 || !this.selectedBlock || !this.boardView) {
            return;
        }

        // 获取点击位置
        const location = event.getUILocation();
        const gridPos = this.boardView.getGridPositionFromWorld(location.x, location.y);

        if (!gridPos) {
            return;
        }

        // 尝试放置
        const result = this.gameSession.placeCandidate(
            this.selectedCandidateIndex,
            gridPos.row,
            gridPos.col
        );

        if (result.success) {
            // 放置成功
            console.log(`Placed block at (${gridPos.row}, ${gridPos.col})`);
            console.log(`Score: +${result.score}, Total: ${this.gameSession.getTotalScore()}`);
            
            if (result.clearedRows.length > 0) {
                console.log(`Cleared rows: ${result.clearedRows.join(', ')}`);
            }
            if (result.clearedColumns.length > 0) {
                console.log(`Cleared columns: ${result.clearedColumns.join(', ')}`);
            }

            // 取消选中
            this.selectedCandidateIndex = -1;
            this.selectedBlock = null;

            // 更新UI
            this.updateUI();

            // 检查游戏是否结束
            if (result.gameOver) {
                this.onGameOver();
            }
        } else {
            console.log(`Cannot place block at (${gridPos.row}, ${gridPos.col}): ${result.reason}`);
        }
    }

    /**
     * 游戏结束
     */
    private onGameOver() {
        if (!this.gameSession) return;

        console.log('Game Over!');
        console.log(`Final Score: ${this.gameSession.getTotalScore()}`);
        console.log(`Total Moves: ${this.gameSession.getMoveCount()}`);

        // 显示游戏结束对话框
        if (this.gameOverDialog) {
            this.gameOverDialog.show(
                this.gameSession.getTotalScore(),
                this.gameSession.getMoveCount()
            );
        }
    }

    /**
     * 更新所有UI组件
     */
    private updateUI() {
        if (!this.gameSession) return;

        // 更新棋盘
        if (this.boardView) {
            this.boardView.updateView();
        }

        // 更新候选块
        const candidates = this.gameSession.getCandidates();
        this.candidateViews.forEach((view, index) => {
            if (index < candidates.length) {
                view.setBlock(candidates[index]);
                view.setSelected(index === this.selectedCandidateIndex);
            }
        });

        // 更新分数
        if (this.scoreHUD) {
            this.scoreHUD.setScoreAndMoves(
                this.gameSession.getTotalScore(),
                this.gameSession.getMoveCount()
            );
        }
    }

    onDestroy() {
        // 清理事件监听
        if (this.startButton) {
            this.startButton.node.off(Button.EventType.CLICK, this.onStartGame, this);
        }

        if (this.restartButton) {
            this.restartButton.node.off(Button.EventType.CLICK, this.onRestartGame, this);
        }

        this.candidateViews.forEach((view) => {
            view.node.off(Node.EventType.TOUCH_END);
        });

        if (this.boardView) {
            this.boardView.node.off(Node.EventType.TOUCH_END);
        }
    }
}
