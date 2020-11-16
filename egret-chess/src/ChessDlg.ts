module chess {
    export interface MoveChess {
        chessID: number;
        ptMovePoint: egret.Point;
    }

    export class ChessDlg {
        /** 棋盘数组，用于显示棋盘 */
        private chessBoard: number[][] = [];
        /** 备份棋盘数组，用于出错恢复 */
        private backupChessBoard: number[][] = [];
        /** 用于保存当前被拖拽的棋子的结构 */
        private moveChess: MoveChess;
        /** 用于保存当前被拖拽的棋子的结构 */
        private ptMoveChess: egret.Point;
        /** 棋盘宽度 */
        private boardWidth: number;
        /** 棋盘高度 */
        private boardHeight: number;
        /** 搜索引擎 */
        private pSE: SearchEngine;

        /** 保存了棋盘的初始状态 */
        private readonly initChessBoard: number[][] = [
            [ChessDefined.bCAR, ChessDefined.bHOURSE, ChessDefined.bELEPHANT, ChessDefined.bBISHOP, ChessDefined.bKING, ChessDefined.bBISHOP, ChessDefined.bELEPHANT, ChessDefined.bHOURSE, ChessDefined.bCAR],
            [ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess],
            [ChessDefined.noChess, ChessDefined.bCANON, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.bCANON, ChessDefined.noChess],
            [ChessDefined.bPAWN, ChessDefined.noChess, ChessDefined.bPAWN, ChessDefined.noChess, ChessDefined.bPAWN, ChessDefined.noChess, ChessDefined.bPAWN, ChessDefined.noChess, ChessDefined.bPAWN],
            [ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess],
            [ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess],
            [ChessDefined.rPAWN, ChessDefined.noChess, ChessDefined.rPAWN, ChessDefined.noChess, ChessDefined.rPAWN, ChessDefined.noChess, ChessDefined.rPAWN, ChessDefined.noChess, ChessDefined.rPAWN],
            [ChessDefined.noChess, ChessDefined.rCANON, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.rCANON, ChessDefined.noChess],
            [ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess, ChessDefined.noChess],
            [ChessDefined.rCAR, ChessDefined.rHOURSE, ChessDefined.rELEPHANT, ChessDefined.rBISHOP, ChessDefined.rKING, ChessDefined.rBISHOP, ChessDefined.rELEPHANT, ChessDefined.rHOURSE, ChessDefined.rCAR]
        ];

        public onInit(){
            this.chessBoard = this.initChessBoard.slice();
            let pMG: MoveGenerator;
            let pEvel: Eveluation;
            this.pSE = new NegaMaxEngine(); // 创建负极大值搜索引擎
            pMG = new MoveGenerator();  // 创建走法产生器
            pEvel = new Eveluation();   // 创建估值核心
            this.pSE.setSearchDepth(3); // 设定搜索层数为3
            this.pSE.setMoveGenerator(pMG); // 给搜索引擎设定走法产生器
            this.pSE.setEveluator(pEvel);   // 给搜索引擎设定估值核心
            this.moveChess.chessID = ChessDefined.noChess;  // 将移动的棋子清空
            return true;
        }

        public newGame(){
            let pMG: MoveGenerator;
            let pEvel: Eveluation;

            this.pSE = new NegaMaxEngine();
            pEvel = new Eveluation();
            this.chessBoard = this.initChessBoard.slice();  // 初始化棋盘
            this.moveChess.chessID = ChessDefined.noChess;  // 清除移动棋子
            pMG = new MoveGenerator();  // 创建走法产生器
            this.pSE.setMoveGenerator(pMG); // 将走法产生器传给搜索引擎
            this.pSE.setEveluator(pEvel);   // 将估值核心传给搜索引擎
        }
    }
}