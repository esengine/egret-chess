module chess {
    /** 估值核心 */
    export class Eveluation {
        // 棋子的价值
        /** 兵 */
        public readonly BASEVALUE_PAWN = 100;
        /** 士 */
        public readonly BASEVALUE_BISHOP = 250;
        /** 象 */
        public readonly BASEVALUE_ELEPHANT = 250;
        /** 车 */
        public readonly BASEVALUE_CAR = 500;
        /** 马 */
        public readonly BASEVALUE_HOURSE = 350;
        /** 炮 */
        public readonly BASEVALUE_CANON = 350;
        public readonly BASEVALUE_KING = 10000;

        // 棋子灵活性
        public readonly FLEXIBILITY_PAWN = 15;
        public readonly FLEXIBILITY_BISHOP = 1;
        public readonly FLEXIBILITY_ELEPHANT = 1;
        public readonly FLEXIBILITY_CAR = 6;
        public readonly FLEXIBILITY_HOURSE = 12;
        public readonly FLEXIBILITY_CANON = 6;
        public readonly FLEXIBILITY_KING = 0;

        /** 存放棋子基本价值的数组 */
        protected baseValue = [];
        /** 存放棋子灵活性分数的数组 */
        protected flexValue = [];
        /** 存放每一个位置被威胁的信息 */
        protected attackPos: number[][] = [];
        /** 存放每一个位置被保护的信息 */
        protected guardPos: [][] = [];
        /** 存放每一个位置上的棋子的灵活性分数 */
        protected flexibilityPos: [][] = [];
        /** 存在每一个位置上的棋子的总价值 */
        protected chessValue: number[][] = [];
        /** 记录一棋子的相关位置个数 */
        protected posCount: number;
        /** 记录一个棋子相关位置的数组 */
        protected relatePos: egret.Point[] = [];

        /** 用以统计调用了估值函数的叶节点次数 */
        private count = 0;

        // 以下常量数组存放了兵在不同位置的附加价值
        // 基本上是过河之后靠老将越高
        // 红卒附加值矩阵
        private readonly BA0 = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [90, 90, 110, 120, 120, 120, 110, 90, 90],
            [90, 90, 110, 120, 120, 120, 110, 90, 90],
            [70, 90, 110, 110, 110, 110, 110, 90, 70],
            [70, 70, 70, 70, 70, 70, 70, 70, 70],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
        // 黑兵的附加值矩阵
        private readonly BA1 = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [70, 70, 70, 70, 70, 70, 70, 70, 70],
            [70, 90, 110, 110, 110, 110, 110, 90, 70],
            [90, 90, 110, 120, 120, 120, 110, 90, 90],
            [90, 90, 110, 120, 120, 120, 110, 90, 90],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        /**
         * 为每一个并返回附加值
         * 不是兵返回零
         * @param x 横坐标
         * @param y 纵坐标
         * @param curSituation 棋盘 
         */
        public getBingValue(x: number, y: number, curSituation: [][]) {
            // 如果是红卒返回其位置附加价值
            if (curSituation[y][x] == ChessDefined.rPAWN)
                return this.BA0[y][x];
            // 如果是黑兵返回其位置附加价值
            if (curSituation[y][x] == ChessDefined.bPAWN)
                return this.BA1[y][x];
            // 不是兵返回零
            return 0;
        }

        constructor() {
            // 在构造函数里初始化每种棋子的基本价值数组
            this.baseValue[ChessDefined.bKING] = this.BASEVALUE_KING;
            this.baseValue[ChessDefined.bCAR] = this.BASEVALUE_CAR;
            this.baseValue[ChessDefined.bHOURSE] = this.BASEVALUE_HOURSE;
            this.baseValue[ChessDefined.bBISHOP] = this.BASEVALUE_BISHOP;
            this.baseValue[ChessDefined.bELEPHANT] = this.BASEVALUE_ELEPHANT;
            this.baseValue[ChessDefined.bCANON] = this.BASEVALUE_CANON;
            this.baseValue[ChessDefined.bPAWN] = this.BASEVALUE_PAWN;
            this.baseValue[ChessDefined.rKING] = this.BASEVALUE_KING;
            this.baseValue[ChessDefined.rCAR] = this.BASEVALUE_CAR;
            this.baseValue[ChessDefined.rHOURSE] = this.BASEVALUE_HOURSE;
            this.baseValue[ChessDefined.rBISHOP] = this.BASEVALUE_BISHOP;
            this.baseValue[ChessDefined.rELEPHANT] = this.BASEVALUE_ELEPHANT;
            this.baseValue[ChessDefined.rCANON] = this.BASEVALUE_CANON;
            this.baseValue[ChessDefined.rPAWN] = this.BASEVALUE_PAWN;
            // 初始化灵活性价值数组
            this.flexValue[ChessDefined.bKING] = this.FLEXIBILITY_KING;
            this.flexValue[ChessDefined.bCAR] = this.FLEXIBILITY_CAR;
            this.flexValue[ChessDefined.bHOURSE] = this.FLEXIBILITY_HOURSE;
            this.flexValue[ChessDefined.bBISHOP] = this.FLEXIBILITY_BISHOP;
            this.flexValue[ChessDefined.bELEPHANT] = this.FLEXIBILITY_ELEPHANT;
            this.flexValue[ChessDefined.bCANON] = this.FLEXIBILITY_CANON;
            this.flexValue[ChessDefined.bPAWN] = this.FLEXIBILITY_PAWN;
            this.flexValue[ChessDefined.rKING] = this.FLEXIBILITY_KING;
            this.flexValue[ChessDefined.rCAR] = this.FLEXIBILITY_CAR;
            this.flexValue[ChessDefined.rHOURSE] = this.FLEXIBILITY_HOURSE;
            this.flexValue[ChessDefined.rBISHOP] = this.FLEXIBILITY_BISHOP;
            this.flexValue[ChessDefined.rELEPHANT] = this.FLEXIBILITY_ELEPHANT;
            this.flexValue[ChessDefined.rCANON] = this.FLEXIBILITY_CANON;
            this.flexValue[ChessDefined.rPAWN] = this.FLEXIBILITY_PAWN;
        }

        /**
         * 估值函数
         * @param position 
         * @param bIsRedTurn 轮到谁走棋 true为红 false为黑 
         */
        public eveluate(position: [][], bIsRedTurn) {
            let i: number, j: number, k: number;
            let chessType: number, targetType: number;
            this.count++;  // 每调用一次估值函数就增量一次
            // 初始化临时变量
            this.chessValue = [];
            this.attackPos = [];
            this.guardPos = [];
            this.flexibilityPos = [];
            // 扫描棋盘，找出每一个棋子，及其威胁/保护的棋子，还有其灵活性
            for (i = 0; i < 10; i++)
                for (j = 0; j < 9; j++) {
                    if (position[i][j] != ChessDefined.noChess) {   // 如果不是空白
                        chessType = position[i][j]; // 取棋子类型
                        this.getRelatePiece(position, j, i);    // 找出该棋子所有相关位置
                        for (k = 0; k < this.posCount; k++) {  // 对每一个目标位置
                            // 取目标位置棋子类型
                            targetType = position[this.relatePos[k].y][this.relatePos[k].x];
                            if (targetType == ChessDefined.noChess) {    // 如果是空白
                                this.flexibilityPos[i][j]++;    // 灵活性增加
                            } else {
                                // 是棋子
                                if (isSameSide(chessType, targetType)) {
                                    // 如果是己方棋子，目标其受保护
                                    this.guardPos[this.relatePos[k].y][this.relatePos[k].x]++;
                                } else {
                                    // 如果是敌方棋子，目标受威胁
                                    this.attackPos[this.relatePos[k].y][this.relatePos[j].x]++;
                                    this.flexibilityPos[i][j]++;   // 灵活性增加
                                    switch (targetType) {
                                        case ChessDefined.rKING:    // 如果是红将
                                            if (!bIsRedTurn) // 如果轮到黑棋走
                                                return 18888;   // 返回失败极值
                                            break;
                                        case ChessDefined.bKING:    // 如果是黑帅
                                            if (bIsRedTurn) // 如果轮到红旗走
                                                return 18888; // 返回失败极值
                                            break;
                                        default:    // 不是将的其他棋子
                                            // 根据威胁的棋子加上威胁分值
                                            this.attackPos[this.relatePos[k].y][this.relatePos[k].x] +=
                                                (30 + (this.baseValue[targetType] - this.baseValue[chessType]) / 10) / 10;
                                            break;
                                    }
                                }
                            }
                        }
                    }
                }

            // 以上扫描棋盘的部分
            // 下面的循环统计扫描到的数据
            for (i = 0; i < 10; i++)
                for (j = 0; j < 9; j++) {
                    if (position[i][j] != ChessDefined.noChess) {
                        chessType = position[i][j]; // 棋子类型
                        this.chessValue[i][j]++;   // 如果棋子存在其价值不为0
                        // 把每一个棋子的灵活性价值加进棋子价值
                        this.chessValue[i][j] += this.flexValue[chessType] * this.flexibilityPos[i][j];
                        // 加上兵的位置附加值
                        this.chessValue[i][j] += this.getBingValue(j, i, position);
                    }
                }

            // 下面的循环继续统计扫描到的数据
            let halfvalue: number;
            for (i = 0; i < 10; i++)
                for (j = 0; j < 9; j++) {
                    if (position[i][j] != ChessDefined.noChess) {   // 如果不是空白
                        chessType = position[i][j]; // 取棋子类型
                        // 棋子节本价值的1/16作为威胁/保护增量
                        halfvalue = this.baseValue[chessType] / 16;
                        // 把每个棋子的基本价值入其总价值
                        this.chessValue[i][j] += this.baseValue[chessType];
                        if (isRed(chessType)) {  // 如果是红棋
                            if (this.attackPos[i][j]) { // 当前红棋如果被威胁
                                if (bIsRedTurn) {
                                    // 如果轮到红棋走
                                    if (chessType == ChessDefined.rKING) {
                                        // 如果是红将
                                        this.chessValue[i][j] -= 20;    // 价值减低20
                                    } else {
                                        // 价值减去2倍 halfvalue
                                        this.chessValue[i][j] -= halfvalue * 2;
                                        if (this.guardPos[i][j]) // 是否被己方棋子保护
                                            this.chessValue[i][j] += halfvalue; // 被保护再加上halfvalue
                                    }
                                } else {
                                    // 当前红旗被威胁轮到黑棋走
                                    if (chessType == ChessDefined.rKING) // 是否红将
                                        return 18888;   // 返回失败的极值
                                    // 减去10倍的halfvalue, 表示威胁程度高
                                    this.chessValue[i][j] -= halfvalue * 10;
                                    if (this.guardPos[i][j])    // 如果被保护
                                        this.chessValue[i][j] += halfvalue * 9; // 被保护再加上9倍 halfvalue
                                }
                                // 被威胁的棋子加上威胁差，放置被一个兵威胁
                                // 一个被保护的车，而估计函数没有反映之类的问题
                                this.chessValue[i][j] -= this.attackPos[i][j];
                            } else {
                                // 没受威胁
                                if (this.guardPos[i][j])
                                    this.chessValue[i][j] += 5; // 受保护，加一点分
                            }
                        } else {
                            // 如果是黑棋
                            if (this.attackPos[i][j]) {
                                // 受威胁
                                if (!bIsRedTurn) {
                                    // 轮到黑棋走
                                    if (chessType == ChessDefined.bKING)    // 如果是黑将
                                        this.chessValue[i][j] -= 20;    // 棋子价值降低20
                                    else {
                                        // 棋子价值降低2倍 halfvalue
                                        this.chessValue[i][j] -= halfvalue * 2;
                                        if (this.guardPos[i][j])    // 如果受保护
                                            this.chessValue[i][j] += halfvalue; // 棋子价值增加 halfvalue
                                    }
                                } else {
                                    // 轮到红棋走
                                    if (chessType == ChessDefined.bKING) // 是黑将
                                        return 18888;   // 返回失败极值
                                    // 棋子价值减少10倍 halfvalue
                                    this.chessValue[i][j] -= halfvalue * 10;
                                    if (this.guardPos[i][j])    // 受保护
                                        this.chessValue[i][j] += halfvalue * 9; // 被保护再加上9倍halfvalue
                                }
                                // 被威胁的棋子加上威胁差，防止一个兵威胁
                                // 一个被保护的车， 而估值函数没有反映之类的问题
                                this.chessValue[i][j] -= this.attackPos[i][j];
                            } else {
                                // 没受威胁
                                if (this.guardPos[i][j])
                                    this.chessValue[i][j] += 5; // 受保护，加一点分
                            }
                        }
                    }
                }

            // 以上生成统计了每一个棋子的总价值
            // 下面统计红黑两方总分
            let redValue = 0;
            let blackValue = 0;

            for (i = 0; i < 10; i++)
                for (j = 0; j < 9; j++) {
                    chessType = position[i][j]; // 取棋子类型
                    if (chessType != ChessDefined.noChess) {    // 如果不是空白
                        if (isRed(chessType))
                            redValue += this.chessValue[i][j];  // 把红旗的值加总
                        else
                            blackValue += this.chessValue[i][j];    // 把黑棋的值加总
                    }
                }

            if (bIsRedTurn)
                return redValue - blackValue; // 如果轮到红棋走返回估值
            else
                return blackValue - redValue; // 轮到黑走返回负的估值
        }

        /**
         * 将一个位置加入数组relatePos中
         * @param x 
         * @param y 
         */
        public addPoint(x: number, y: number){
            this.relatePos[this.posCount].x = x;
            this.relatePos[this.posCount].y = y;
            this.posCount ++;
        }

        /**
         * 枚举了给定位上棋子的所有相关位置
         * 包括可走的位置和可保护的位置
         * @param position 
         * @param j 
         * @param i 
         */
        public getRelatePiece(position: [][], j: number, i: number){
            this.posCount = 0;
            let chessID: number, flag: number, x: number, y: number;
            chessID = position[i][j];
            switch (chessID) {
                case ChessDefined.rKING:    // 红帅
                case ChessDefined.bKING:    // 黑将
                    // 循环检查九宫之内那些位置可到达/保护
                    // 扫描两边九宫包含了照像的情况
                    for (y = 0; y < 3; y ++)
                        for (x = 3; x < 6; x ++)
                            if (this.canTouch(position, j, i, x, y))    // 能否走到
                                this.addPoint(x, y);    // 可到达/保护的位置加入数组
                    // 循环检查九宫之内那些位置可到达/保护
                    // 扫描两边九宫包含了照像的情况
                    for (y = 7; y < 10; y ++)
                        for (x = 3; x < 6; x ++)
                            if (this.canTouch(position, j, i, x, y))    // 能否走到
                                this.addPoint(x, y);    // 可到达/保护的位置加入数组
                    break;
                case ChessDefined.rBISHOP:  // 红士
                    // 循环检查九宫之内那些位置可到达/保护
                    for (y = 7; y < 10; y ++)
                        for (x = 3; x < 6; x ++)
                        if (this.canTouch(position, j, i, x, y))    // 能否走到
                            this.addPoint(x, y);    // 可到达/保护的位置加入数组
                    break;
                case ChessDefined.bBISHOP:  // 红士
                    // 循环检查九宫之内那些位置可到达/保护
                    for (y = 0; y < 3; y ++)
                        for (x = 3; x < 6; x ++)
                        if (this.canTouch(position, j, i, x, y))    // 能否走到
                            this.addPoint(x, y);    // 可到达/保护的位置加入数组
                    break;
                case ChessDefined.rELEPHANT:    // 红相
                case ChessDefined.bELEPHANT:    // 黑象
                    // 右下
                    break;
            }
        }

        /**
         * 判断棋盘position上位置from的棋子是否能走到位置to
         * 如果能返回true否则返回false
         * @param position 
         * @param fromX 
         * @param fromY 
         * @param toX 
         * @param toY 
         */
        public canTouch(position: [][], fromX: number, fromY: number, toX: number, toY: number): boolean{
            let i: number, j: number;
            let moveChessID: number, targetID: number;
            if (fromY == toY && fromX == toX)
                return false;   // 目的与源相同
            moveChessID = position[fromY][fromX];
            targetID = position[toY][toX];
            switch (moveChessID) {
                case ChessDefined.bKING:
                    if (targetID == ChessDefined.rKING) // 是否出现老将见面
                    {
                        if (fromX != toX)
                            return false;
                        for (i = fromY + 1; i < toY; i ++)
                            if (position[i][fromX] != ChessDefined.noChess)
                                return false;
                    }else {
                        if (toY > 2 || toX > 5 || toX < 3)
                            return false;   // 目标点在九宫之外
                        if (Math.abs(fromY - toY) + Math.abs(toX - fromX) > 1)
                            return false;   // 将帅只走一步直线
                    }
                    break;
                case ChessDefined.rBISHOP:
                    if (toY < 7 || toX > 5 || toX < 3)
                        return false;   // 士出九宫
                    if (Math.abs(fromY - toY) != 1 || Math.abs(toX - fromX) != 1)
                        return false;   // 士走斜线
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
                        return false;   // 象眼被塞住了
                    break;
                case ChessDefined.bPAWN:    // 黑兵
                    if (toY < fromY)
                        return false;   // 兵不回头
                    if (fromY < 5 && fromY == toY)
                        return false;   // 兵过河前只能直走
                    if (toY - fromY + Math.abs(toX - fromX) > 1)
                        return false;   // 兵只走一步直线
                    break;
                case ChessDefined.rPAWN:    // 红卒
                    if (toY > fromY)
                        return false;   // 卒不回头
                    if (fromY > 4 && fromY == toY)
                        return false;   // 卒过河前只能直走
                    if (fromY - toY + Math.abs(toX - fromX) > 1)
                        return false;   // 卒只走一步直线
                    break;
                case ChessDefined.rKING:
                    if (targetID == ChessDefined.bKING) // 是否出现老将见面
                    {
                        if (fromX != toX)
                            return false;   // 将帅不再同一列
                        for (i = fromY - 1; i > toY; i --)
                            if (position[i][fromX] != ChessDefined.noChess)
                                return false;   // 中间有别的子
                    } else {
                        if (toY < 7 || toX > 5 || toX < 3)
                            return false;   // 目标点在九宫之外
                        if (Math.abs(fromY - toY) + Math.abs(toX - fromX) > 1)
                            return false;   // 将帅只走一步直线
                    }
                    break;
                case ChessDefined.bCAR: // 红车
                case ChessDefined.rCANON:   // 黑车
                    if (fromY != toY && fromX != toX)
                        return false;   // 车走直线
                    if (fromY == toY){  // 横向
                        if (fromX < toX) {  // 向右
                            for (i = fromX + 1; i < toX; i ++)
                                if (position[fromY][i] != ChessDefined.noChess)
                                    return false;
                        } else { // 向左
                            for (i = toX + 1; i < fromX; i ++)
                                if (position[fromY][i] != ChessDefined.noChess)
                                    return false;
                        }
                    } else { // 纵向
                        if (fromY < toY) {  // 向下
                            for (j = fromY + 1; j < toY; j ++)
                                if (position[j][fromX] != ChessDefined.noChess)
                                    return false;
                        } else {    // 向上
                            for (j = toY + 1; j < fromY; j ++)
                                if (position[j][fromX] != ChessDefined.noChess)
                                    return false;
                        }
                    }
                    break;
                case ChessDefined.bHOURSE:
                case ChessDefined.rHOURSE:
                    if (!((Math.abs(toX - fromX) == 1 && Math.abs(toY - fromY) == 2)
                        || (Math.abs(toX - fromX) == 2 && Math.abs(toY - fromY) == 1)))
                        return false;   // 马走日字
                    if (toX - fromX == 2){  // 横向右走
                        i = fromX + 1;
                        j = fromY;
                    } else if(fromX - toX == 2){    // 横向左
                        i = fromX - 1;
                        j = fromY;
                    } else if(toY - fromY == 2) {   // 纵向下
                        i = fromY;
                        j = fromY + 1;
                    } else if(fromY - toY == 2) {   // 纵向上
                        i = fromX;
                        j = fromY - 1;
                    }

                    if (position[j][i] != ChessDefined.noChess)
                        return false;   // 拌马腿
                    break;
                case ChessDefined.bCANON:
                case ChessDefined.rCANON:
                    if (fromY != toY && fromX != toX)
                        return false;   // 炮走直线
                    // 炮不吃子时经过的路线中不能有棋子
                    if (position[toY][toX] == ChessDefined.noChess){    // 不吃子时
                        if (fromY == toY) { // 横向
                            if (fromX < toX) {  // 向右
                                for (i = fromX + 1; i < toX; i ++)
                                    if (position[fromY][i] != ChessDefined.noChess)
                                        return false;
                            } else {    // 向左
                                for (i = toX + 1; i < fromX; i ++)
                                    if (position[fromY][i] != ChessDefined.noChess)
                                        return false;
                            }
                        } else { // 纵向
                            if (fromY < toY) {  // 向下
                                for (j = fromY + 1; j < toY; j ++)
                                    if (position[j][fromX] != ChessDefined.noChess)
                                        return false;
                            } else {    // 向上
                                for (j = toY + 1; j < fromY; j ++)
                                    if (position[j][fromX] != ChessDefined.noChess)
                                        return false;
                            }
                        }
                    }else {
                        // 吃子时
                        let count = 0;
                        if (fromY == toY){  // 横向
                            if (fromX < toX) {  // 向右
                                for (i = fromX + 1; i < toX; i ++)
                                    if (position[fromY][i] != ChessDefined.noChess)
                                        count ++;   // 计算隔几个棋子
                                    if (count != 1) // 不是隔一个棋子，不能吃
                                        return false;
                            } else {    // 向左
                                for (i = toX + 1; i < fromX; i ++)
                                    if (position[fromY][i] != ChessDefined.noChess)
                                        count ++;   // 计算隔几个棋子
                                    if (count != 1)
                                        return false;   // 不是隔一个棋子，不能吃
                            }
                        }else {
                            // 纵向
                            if (fromY < toY){
                                // 向下
                                for (j = fromY + 1; j < toY; j ++)
                                    if (position[j][fromX] != ChessDefined.noChess)
                                        count ++;   // 计算隔几个棋子
                                    if (count != 1)
                                        return false;   // 不是隔一个棋子，不能吃
                            } else {
                                // 向上
                                for (j = toY + 1; j < fromY; j ++)
                                    if (position[j][fromX] != ChessDefined.noChess)
                                        count ++;   // 计算隔几个棋子
                                    if (count != 1)
                                        return false;   // 不是隔一个棋子，不能吃
                            }
                        }
                    }
                    break;
                default:
                    return false;
            }

            return true;    // 条件满足
        }
    }
}