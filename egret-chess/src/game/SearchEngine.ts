module chess {
    /** 搜索引擎的基类 */
    export class SearchEngine {
        /** 搜索时用于当前节点棋盘状态的数组 */
        protected curPosition = [];
        /** 记录最佳走法的变量 */
        protected cmBestMove: ChessMove;
        /** 走法产生器 */
        protected mG: MoveGenerator;
        /** 估值核心 */
        protected eveal: Eveluation;
        /** 最大搜索深度 */
        protected searchDepth: number;
        /** 当前搜索的最大搜索深度 */
        protected maxDepth: number;

        /** 设置最大搜索深度 */
        public setSearchDepth(depth: number){
            this.searchDepth = depth;
        }

        /** 设定走法产生器 */
        public setMoveGenerator(mg: MoveGenerator) {
            this.mG = mg;
        }

        /** 设定估值核心 */
        public setEveluator(evel: Eveluation) {
            this.eveal = evel;
        }

        /**
         * 根据传入的走法改变棋盘
         * @param move 要进行的走法
         */
        public makeMove(move: ChessMove){
            let chessID: number;
            chessID = this.curPosition[move.to.y][move.to.x];   // 取目标位置棋子
            // 把棋子移动到目标位置
            this.curPosition[move.to.y][move.to.x] = this.curPosition[move.from.y][move.from.x];
            // 将原位置清空
            this.curPosition[move.from.y][move.from.x] = ChessDefined.noChess; 
            return chessID; // 返回被吃掉的棋子
        }

        /**
         * 根据传入的走法恢复棋盘
         * @param move 恢复的走法
         * @param chessID 原棋盘上move目标位置的棋子类型
         */
        public unMakeMove(move: ChessMove, chessID: number){
            // 将目标位置和棋子拷回原位
            this.curPosition[move.from.y][move.from.x] = this.curPosition[move.to.y][move.to.x];
            // 恢复目标位置的棋子
            this.curPosition[move.to.y][move.to.x] = chessID;
        }

        /**
         * 用以检查给定局面游戏是否结束
         * 如未结束，返回0，否则返回极大/极小值
         * @param position 
         * @param depth 
         */
        public isGameOver(position: [][], depth: number){
            let i: number, j: number;
            let redLive: boolean = false, blackLive: boolean = false;
            // 检查红方九宫是否有将帅
            for (i = 7; i < 10; i ++)
                for (j = 3; j < 6; j ++){
                    if (position[i][j] == ChessDefined.bKING)
                        blackLive = true;
                    if (position[i][j] == ChessDefined.rKING)
                        redLive = true;
                }
            // 检查黑方九宫是否有将帅
            for (i = 0; i < 3; i ++)
                for (j = 3; j < 6; j ++) {
                    if (position[i][j] == ChessDefined.bKING)
                        blackLive = true;
                    if (position[i][j] == ChessDefined.rKING)
                        redLive = true;
                }
            i = (this.maxDepth - depth + 1) % 2;    // 取当前是奇偶标志
            if (!redLive) // 红将是否不在了
                if (i)
                    return 19990 + depth;  // 奇数层返回极大值
                else 
                    return -19990 - depth; // 偶数层返回极小值
            if (!blackLive) // 黑帅是否不在了
                if (i)
                    return -19990 - depth;  // 奇数层返回极小值
                else
                    return 19990 + depth;   // 偶数层返回极大值
            return 0;// 两个将都在，返回零
        }
    }
}