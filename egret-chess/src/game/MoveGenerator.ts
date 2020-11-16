module chess {
    /** 走法产生器 */
    export class MoveGenerator {
        /** 存放产生所有走法的队列 */
        public moveList: ChessMove[][] = [];
        /** 记录moveList中走法的数量 */
        private _moveCount: number;

        /**
         * 判断局面position上，从from到to的走法是否合法
         * 如果合法，返回true否则false
         * @param position 
         * @param fromX 
         * @param fromY 
         * @param toX 
         * @param toY 
         */
        public isValidMove(position: [][], fromX: number, fromY: number, toX: number, toY: number): boolean {
            let i: number, j: number, moveChessID: number, targetID: number;
            if (fromY == toY && fromX == toX)
                return false;   // 目的与源相同，非法
            moveChessID = position[fromY][fromX];
            targetID = position[toY][toX];
            if (isSameSide(moveChessID, targetID))
                return false;   // 吃自己的棋，非法
            switch (moveChessID) {
                case ChessDefined.bKING:
                    if (targetID == ChessDefined.rKING) { // 判断是否老将见面
                        if (fromX != toX)   // 横坐标相等否
                            return false;   // 两个将不在同一列
                        for (i = fromY + 1; i < toY; i ++)
                            if (position[i][fromX] != ChessDefined.noChess)
                                return false;   // 中间隔有棋子，返回false
                    } else {
                        if (toY > 2 || toX > 5 || toX < 3)
                            return false;   // 目标在九宫之外
                        if (Math.abs(fromX - toY) + Math.abs(toX - fromX) > 1)
                            return false;   // 将帅只走一步直线
                    }
                    break;
                case ChessDefined.rKING:    // 红将
                    if (targetID == ChessDefined.bKING){ // 判断是否老将见面
                        if (fromX != toX)
                            return false; // 两个将不在同一列
                        for (i = fromY - 1; i > toY; i --)
                            if (position[i][fromX] != ChessDefined.noChess)
                                return false;   // 中间隔有棋子，返回false
                    } else {
                        if (toY < 7 || toX > 5 || toX < 3)
                            return false;   // 目标点在九宫之外
                        if (Math.abs(fromY - toY) + Math.abs(toX - fromX) > 1)
                            return false;   // 将帅只走一步直线
                    }
                    break;
                case ChessDefined.rBISHOP:  // 红士
                    if (toY < 7 || toX > 5 || toX < 3)
                        return false; // 士出九宫
                    if (Math.abs(fromY - toY) != 1 || Math.abs(toX - fromX) != 1)
                        return false; // 士走斜线
                    break;
                case ChessDefined.bBISHOP:  // 黑士
                    if (toY > 2 || toX > 5 || toX < 3)
                        return false;   // 士出九宫
                    if (Math.abs(fromY - toY) != 1 || Math.abs(toX - fromX) != 1)
                        return false;   // 士走斜线
                    break;
                case ChessDefined.rELEPHANT:    // 红相
                    if (toY < 5)
                        return false;   // 相不能过河
                    if (Math.abs(fromX - toX) != 2 || Math.abs(fromY - toY) != 2)
                        return false;   // 相走田字
                    if (position[(fromY + toY) / 2][(fromX + toX) / 2] != ChessDefined.noChess)
                        return false;   // 相眼被塞住了
                    break;
                case ChessDefined.bELEPHANT:    // 黑象
                    if (toY > 4)
                        return false;   // 象不能过河
                    if (Math.abs(fromX - toX) != 2 || Math.abs(fromY - toY) != 2)
                        return false;   // 象走田字
                    if (position[(fromY + toY) / 2][(fromX + toX) / 2] != ChessDefined.noChess)
                        return false;   // 相眼被塞住了
                    break;
                case ChessDefined.bPAWN:    // 红卒
                    if (toY < fromY)
                        return false;   // 卒不回头
                    if (fromY < 5 && fromY == toY)
                        return false;   // 卒过河前只能直走
                    if (fromY - toY + Math.abs(toX - fromX) > 1)
                        return false;   // 卒只走一步直线
                    break;
                case ChessDefined.rPAWN:    // 红卒
                    if (toY > fromY)
                        return false;   // 卒不回头
                    if (fromY > 4 && fromY == toY)
                        return false;   // 卒过河前只能直走
                    if (fromY - toY + Math.abs(toX - fromX) > 1)
                        return false;   // 卒只走一步直线
                    break;
                case ChessDefined.bCAR: // 黑车
                case ChessDefined.rCAR: // 红车
                    if (fromY != toY && fromX != toX)
                        return false;   // 车走直线
                    if (fromY == toY){
                        if (fromY < toY){
                            for (i = fromX + 1; i < toX; i ++)
                                if (position[fromY][i] != ChessDefined.noChess)
                                    return false;
                        } else {
                            for (i = toX + 1; i < fromX; i ++)
                                if (position[fromY][i] != ChessDefined.noChess)
                                    return false;
                        }
                    } else {
                        if (fromY < toY){
                            for (j = fromY + 1; j < toY; j ++)
                                if (position[j][fromX] != ChessDefined.noChess)
                                    return false;
                        } else {
                            for (j = toY + 1; i < fromY; j ++)
                                if (position[j][fromX] != ChessDefined.noChess)
                                    return false;
                        }
                    }
                    break;
                case ChessDefined.bHOURSE:  // 黑马
                case ChessDefined.rHOURSE:  // 红马
                    if (!((Math.abs(toX - fromX) == 1 && Math.abs(toY - fromY) == 2)
                        || (Math.abs(toX - fromX) == 2 && Math.abs(toY - fromY) == 1)))
                            return false;   // 马走日字
                    if (toX - fromX == 2){
                        i = fromX + 1;
                        j = fromY;
                    } else if(fromX - toX == 2){
                        i = fromX - 1;
                        j = fromY;
                    } else if(toY - fromY == 2){
                        i = fromX;
                        j = fromY + 1;
                    } else if(fromY - toY == 2){
                        i = fromX;
                        j = fromY - 1;
                    }

                    if (position[j][i] != ChessDefined.noChess)
                        return false;   // 拌马腿
                    break;
                case ChessDefined.bCANON:   // 黑炮
                case ChessDefined.rCANON:   // 红炮
                    if (fromY != toY && fromX != toX)
                        return false;   // 炮走直线
                    // 炮不吃子时经过的路线中不能有棋子
                    if (position[toY][toX] == ChessDefined.noChess){
                        if (fromY == toY){
                            if (fromX < toX){
                                for (i = fromX + 1; i < toX; i++)
                                    if (position[fromY][i] != ChessDefined.noChess)
                                        return false;
                            } else {
                                for (i = toX + 1; i < fromX; i ++){
                                    if (position[fromY][i] != ChessDefined.noChess)
                                        return false;
                                }
                            }
                        } else {
                            if (fromY < toY){
                                for (j = fromY + 1; j < toY; j ++)
                                    if (position[j][fromX] != ChessDefined.noChess)
                                        return false;
                            } else {
                                for (j = toY + 1; j < fromY; j ++)
                                    if (position[j][fromX] != ChessDefined.noChess)
                                        return false;
                            }
                        }
                    } else {
                        // 炮吃子时
                        let count = 0;
                        if (fromY == toY){
                            if (fromX < toX){
                                for (i = fromX + 1; i < toX; i ++)
                                    if (position[fromY][i] != ChessDefined.noChess)
                                        count ++;
                                    if (count != 1)
                                        return false;
                            } else {
                                for (i = toX + 1; i < fromX; i ++)
                                    if (position[fromY][i] != ChessDefined.noChess)
                                        count ++;
                                    if (count != 1)
                                        return false;
                            }
                        } else {
                            if (fromY < toY){
                                for (j = fromY + 1; i < toY; j ++)
                                    if (position[j][fromX] != ChessDefined.noChess)
                                        count ++;
                                    if (count != 1)
                                        return false;
                            } else {
                                for (j = toY + 1; j < fromY; j ++)
                                    if (position[j][fromX] != ChessDefined.noChess)
                                        count ++;
                                    if (count != 1)
                                        return false;
                            }
                        }
                    }
                    break;
                default:
                    return false;
            }

            return true;    // 合法的走法，返回true
        }

        /**
         * 在moveList中插入一个走法
         * @param fromX 起始位置横坐标
         * @param fromY 起始位置纵坐标
         * @param toX 目标位置横坐标
         * @param toY 目标位置纵坐标
         * @param ply 所在的层次
         */
        public addMove(fromX: number, fromY: number, toX: number, toY: number, ply: number){
            if (!this.moveList[ply]) this.moveList[ply] = [];
            this.moveList[ply][this._moveCount].from.x = fromX;
            this.moveList[ply][this._moveCount].from.y = fromY;
            this.moveList[ply][this._moveCount].to.x = toX;
            this.moveList[ply][this._moveCount].to.y = toY;
            this._moveCount ++;
            return this._moveCount;
        }

        /**
         * 用以产生局面position中所有可能的走法
         * @param position 包含所有棋子位置信息的二维数组
         * @param ply 当前搜索的层数，每层将走法存在不同的位置，以免覆盖
         * @param side 指明哪一方的走法， true为红方, false 为黑房
         */
        public createPossibleMove(position: [][], ply: number, side: number){
            let chessID: number, i: number, j: number;
            this._moveCount = 0;
            for (j = 0; j < 9; j ++)
                for (i = 0; i < 10; i ++){
                    if (position[i][j] != ChessDefined.noChess){
                        chessID = position[i][j];
                        if (!side && isRed(chessID))
                            continue;   // 如要产生黑棋走法，跳过红棋
                        if (side && isBlack(chessID))
                            continue;   // 如要产生红棋走法，跳过黑棋
                        switch (chessID){
                            case ChessDefined.rKING:// 红将
                            case ChessDefined.bKING:// 黑帅
                                this.genKingMove(position, i, j, ply);
                                break;
                            case ChessDefined.rBISHOP://红士
                                this.genRBishopMove(position, i, j, ply);
                                break;
                            case ChessDefined.bBISHOP:// 黑士
                                this.genBBishopMove(position, i, j, ply);
                                break;
                            case ChessDefined.rELEPHANT:// 红相
                            case ChessDefined.bELEPHANT:// 黑象
                                this.genElephantMove(position, i, j, ply);
                                break;
                            case ChessDefined.rHOURSE:  // 红马
                            case ChessDefined.bHOURSE:  // 黑马
                                this.genHourseMove(position, i, j, ply);
                                break;
                            case ChessDefined.rCAR: // 红车
                            case ChessDefined.bCANON:   // 黑车
                                this.genCarMove(position, i, j, ply);
                                break;
                            case ChessDefined.rPAWN:    // 红卒
                                this.genRPawnMove(position, i, j, ply);
                                break;
                            case ChessDefined.bPAWN:    // 黑兵
                                this.genBPawnMove(position, i, j, ply);
                                break;
                            case ChessDefined.bCANON:   // 红炮
                            case ChessDefined.rCANON:   // 黑炮
                                this.genCanonMove(position, i, j, ply);
                                break;
                            default:
                                break;
                        }
                    }
                }

            return this._moveCount;
        }

        /**
         * 产生王的合法走步
         * @param position 
         * @param i 
         * @param j 
         * @param ply 插入数组第几层
         */
        public genKingMove(position: [][], i: number, j: number, ply: number){
            let x: number, y: number;
            for (y = 0; y < 3; y ++)
                for (x = 3; x < 6; x ++)
                    if (this.isValidMove(position, j, i, x, y)) // 走步是否合法
                        this.addMove(j, i, x, y, ply);  // 将这个走法插入moveList

            for (y = 7; y < 10; y ++)
                for (x = 3; x < 6; x ++)
                    if (this.isValidMove(position, j, i, x, y)) // 走步是否合法
                        this.addMove(j, i, x, y, ply);  // 将这个走法插入moveList
        }

        /**
         * 产生红士的合法走步
         * @param position 
         * @param i 
         * @param j 
         * @param ply 
         */
        public genRBishopMove(position: [][], i: number, j: number, ply: number){
            let x: number, y: number;
            for (y = 7; y < 10; y ++)
                for (x = 3; x < 6; x ++)
                    if (this.isValidMove(position, j, i, x, y)) // 走步是否合法
                        this.addMove(j, i, x, y, ply);  // 将这个走法插入moveList
        }

        /**
         * 产生黑士的合法走步
         * @param position 
         * @param i 
         * @param j 
         * @param ply 
         */
        public genBBishopMove(position: [][], i: number, j: number, ply: number){
            let x: number, y: number;
            for (y = 0; y < 3; y ++)
                for (x = 3; x < 6; x ++)
                    if (this.isValidMove(position, j, i, x, y)) // 走步是否合法
                        this.addMove(j, i, x, y, ply);  // 将这个走法插入moveList
        }

        /**
         * 产生象的合法走步
         * @param position 
         * @param i 
         * @param j 
         * @param ply 
         */
        public genElephantMove(position: [][], i: number, j: number, ply: number){
            let x: number, y: number;
            // 插入右下方的有效走法
            x = j + 2;
            y = i + 2;
            if (x < 9 && y < 10 && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
            // 插入右上方的有效走法
            x = j + 2;
            y = i - 2;
            if (x < 9 && y >= 0 && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
            // 插入左下方的有效走法
            x = j - 2;
            y = i + 2;
            if (x >= 0 && y < 10 && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
            // 插入左上方的有效走法
            x = j - 2;
            y = i - 2;
            if (x >= 0 && y >= 0 && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
        }

        /**
         * 产生马的合法走步
         * @param position 
         * @param i 
         * @param j 
         * @param ply 
         */
        public genHourseMove(position: [][], i: number, j: number, ply: number){
            let x: number, y: number;
            // 插入右下方的有效走法
            x = j + 2;  // 右2
            y = j + 1;  // 下1
            if ((x < 9 && y < 10) && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
            // 插入右上方的有效走法
            x = j + 1;  // 右2
            y = i - 1;  // 上1
            if ((x < 9 && y >= 0) && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
            // 插入左下方的有效走法
            x = j - 2;  // 左2
            y = i + 1;  // 下1
            if ((x >= 0 && y < 10) && this.isValidMove(position, j, i, x , y))
                this.addMove(j, i, x, y, ply);
            // 插入左上方的有效走法
            x = j - 2;  // 左2
            y = i - 1;  // 上1
            if ((x >= 0 && y >= 0) && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
            // 插入右下方的有效走法
            x = j + 1;  // 右1
            y = i + 2;  // 下2
            if ((x < 9 && y < 10) && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
            // 插入左下方的有效走法
            x = j - 1;  // 左1
            y = i + 2;  // 下2
            if ((x >= 0 && y < 10) && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
            // 插入右下方的有效走法
            x = j + 1;  // 右1
            y = i - 2;  // 左2
            if ((x < 9 && y >= 0) && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
            // 插入左上方的有效走法
            x = j - 1;  // 左1
            y = i - 2;  // 上2
            if ((x >= 0 && y >= 0) && this.isValidMove(position, j, i, x, y))
                this.addMove(j, i, x, y, ply);
        }

        /**
         * 产生红卒的合法位置
         * @param position 
         * @param i 
         * @param j 
         * @param ply 
         */
        public genRPawnMove(position: [][], i: number, j: number, ply: number){
            let x: number, y: number, chessID: number;
            chessID = position[i][j];
            y = i - 1;  // 向前
            x = j;
            if (y > 0 && !isSameSide(chessID, position[y][x]))
                this.addMove(j, i, x, y, ply);  // 前方无阻碍，插入走法
            if (i < 5) { // 是否已过河
                y = i;
                x = j + 1;  // 右边
                if (x < 9 && !isSameSide(chessID, position[y][x]))
                    this.addMove(j, i, x, y, ply);  // 插入向右的走法
                x = j - 1;  // 左边
                if (x >= 0 && !isSameSide(chessID, position[y][x]))
                    this.addMove(j, i, x, y, ply);  // 插入向左的走法
            }
        }

        /**
         * 产生黑兵的走法
         * @param position 
         * @param i 
         * @param j 
         * @param ply 
         */
        public genBPawnMove(position: [][], i: number, j: number, ply: number){
            let x: number, y: number, chessID: number;
            chessID = position[i][j];
            y = i + 1;  // 向前
            x = j;
            if (y < 10 && !isSameSide(chessID, position[y][x]))
                this.addMove(j, i, x, y, ply);  // 插入向前的走法
            if (i > 4){ // 是否已过河
                y = i;
                x = j + 1;
                if (x < 9 && !isSameSide(chessID, position[y][x]))
                    this.addMove(j, i, x, y, ply);  // 插入向右的走法
                x = j - 1;
                if (x >= 0 && !isSameSide(chessID, position[y][x]))
                    this.addMove(j, i, x, y, ply);  // 插入向左的走法
            }
        }

        /**
         * 产生车的合法走步
         * @param position 
         * @param i 
         * @param j 
         * @param ply 
         */
        public genCarMove(position: [][], i: number, j: number, ply: number){ 
            let x: number, y: number, chessID: number;
            chessID = position[i][j];
            // 插入右边的可走位置
            x = j + 1;
            y = i;
            while (x < 9){
                if (ChessDefined.noChess == position[y][x])
                    this.addMove(j, i, x, y, ply);
                else {
                    if (!isSameSide(chessID, position[y][x]))
                        this.addMove(j, i, x, y, ply);
                    break;
                }
                
                x ++;
            }
            // 插入左边的可走位置
            x = j - 1;
            y = i;
            while (x >= 0){
                if (ChessDefined.noChess == position[y][x])
                    this.addMove(j, i, x, y, ply);
                else {
                    if (!isSameSide(chessID, position[y][x]))
                        this.addMove(j, i, x, y, ply);
                    break;
                }

                x --;
            }
            // 插入向下的可走位置
            x = j;
            y = i + 1;
            while (y < 10){
                if (ChessDefined.noChess == position[y][x])
                    this.addMove(j, i, x, y, ply);
                else {
                    if (!isSameSide(chessID, position[y][x]))
                        this.addMove(j, i, x, y, ply);
                    break;
                }

                y ++;
            }
            // 插入向上的可走位置
            x = j;
            y = i - 1;
            while (y >= 0){
                if (ChessDefined.noChess == position[y][x])
                    this.addMove(j, i, x, y, ply);
                else {
                    if (!isSameSide(chessID, position[y][x]))
                        this.addMove(j, i, x, y, ply);
                    break;
                }

                y --;
            }
        }

        /**
         * 产生炮的合法走步
         * @param position 
         * @param i 
         * @param j 
         * @param ply 
         */
        public genCanonMove(position: [][], i: number, j: number, ply: number){
            let x: number, y: number, flag: boolean, chessID: number;
            chessID = position[i][j];
            // 插入向右方向上的可走位置
            x = j + 1;
            y = i;
            flag = false;
            while (x < 9){
                if (ChessDefined.noChess == position[y][x]) {   // 此位置上是否有棋子
                    if (!flag) {    // 是否隔有棋子
                        this.addMove(j, i, x, y, ply);  // 没有隔棋子，插入可走位置
                    }
                } else {
                    if (!flag)  // 没有隔棋子，此棋子是第一个阻碍，设置标志
                        flag = true;
                    else {
                        // 隔有棋子，此处如为敌方棋子就可走
                        if (!isSameSide(chessID, position[y][x]))
                            this.addMove(j, i, x, y, ply);
                        break;
                    }
                }

                x ++;   // 继续下一个位置
            }
            // 插入向左方向上的可走位置
            x = j - 1;
            flag = false;
            while (x >= 0){
                if (ChessDefined.noChess == position[y][x]) {   // 此位置上是否有棋子
                    if (!flag) // 此位置是否同炮之间没有阻碍
                        this.addMove(j, i, x, y, ply);  // 没有隔棋子，插入可走位置
                } else {
                    if (!flag)  // 没有隔棋子，此棋子是第一个阻碍， 设置标志
                        flag = true;
                    else {
                        // 隔有棋子，此处如为敌方棋子就可走
                        if (!isSameSide(chessID, position[y][x]))
                            this.addMove(j, i, x, y, ply);  // 是敌方棋子，可走
                        break;
                    }
                }
                x --;   // 继续下一个位置
            }
            // 插入向下方向上的可走位置
            x = j;
            y = i + 1;
            flag = false;
            while (y < 10){
                if (ChessDefined.noChess == position[y][x]){
                    if (!flag)
                        this.addMove(j, i, x, y, ply);
                } else {
                    if (!flag)  // 没有隔棋子，此棋子是第一个阻碍，设置标志
                        flag = true;
                    else {
                        // 隔有棋子，此处如为敌方棋子就可走
                        if (!isSameSide(chessID, position[y][x]))
                            this.addMove(j, i, x, y, ply);  // 是敌方棋子，可走
                        break;
                    }
                }

                y ++;
            }
            y = i -1;
            flag = false;
            while (y >= 0){
                if (ChessDefined.noChess == position[y][x]){
                    if (!flag)
                        this.addMove(j, i, x, y, ply);
                } else {
                    if (!flag)
                        flag = true;
                    else {
                        if (!isSameSide(chessID, position[y][x]))
                            this.addMove(j, i, x, y, ply);
                        break;
                    }
                }
                y --;
            }
        }
    }
}