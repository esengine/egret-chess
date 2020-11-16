module chess {
    /** 搜索引擎，使用负极大值方法 */
    export class NegaMaxEngine extends SearchEngine {
        /**
         * 此函数针对传入的position找出一步最佳走法
         * 并修改棋盘数据为走过的状态
         * @param position 
         */
        public searchAGoodMove(position: [][]){
            // 设定搜索层数为 searchDepth
            this.maxDepth = this.searchDepth;
            // 将传入的棋盘复制到成员变量中
            this.curPosition = position.slice();
            // 调用负极大值搜索函数找最佳走法
            this.negaMax(this.maxDepth);
            // 将棋盘修改为走过的
            this.makeMove(this.cmBestMove);
            // 将修改过的棋盘复制传入棋盘中
            position = this.curPosition.slice();
        }

        /**
         * 负极大值搜索函数
         * @param depth 节点离子节点的层数
         */
        public negaMax(depth: number){
            let current = -20000;
            let score: number, count: number, i: number, type: number;
            i = this.isGameOver(this.curPosition, depth);   // 检查棋局是否结束
            if (i != 0)
                return i;   // 棋局结束，返回极大/极小值
            if (depth <= 0) // 叶子节点取估值
                return this.eveal.eveluate(this.curPosition, (this.maxDepth - depth) % 2);  // 返回估值
            
            // 列举出当前局面下一步所有可能的走法
            count = this.mG.createPossibleMove(this.curPosition, depth, (this.maxDepth - depth) % 2);
            for (i = 0; i < count; i ++){
                // 根据走法产生新局面
                type = this.makeMove(this.mG.moveList[depth][i]);
                // 递归调用负极大值搜索下一层的节点
                score = -this.negaMax(depth - 1);
                // 恢复当前局面
                this.unMakeMove(this.mG.moveList[depth][i], type);
                if (score > current) // 如果score大于已知的最大值
                {
                    current = score;    // 修改当前值为score
                    if (depth == this.maxDepth){
                        // 靠近根部时保存最佳走法
                        this.cmBestMove = this.mG.moveList[depth][i];
                    }
                }
            }

            return current
        }
    }
}