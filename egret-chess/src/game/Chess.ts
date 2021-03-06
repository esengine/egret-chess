module chess {
    export enum ChessDefined {
        /** 无棋子 */
        noChess = 0,
        /** 黑帅 */
        bKING = 1,
        /** 黑车 */
        bCAR = 2,
        /** 黑马 */
        bHOURSE = 3,
        /** 黑炮 */
        bCANON = 4,
        /** 黑士 */
        bBISHOP = 5,
        /** 黑象 */
        bELEPHANT = 6,
        /** 黑兵 */
        bPAWN = 7,
        /** 红将 */
        rKING = 8,
        /** 红车 */
        rCAR = 9,
        /** 红马 */
        rHOURSE = 10,
        /** 红炮 */
        rCANON = 11,
        /** 红士 */
        rBISHOP = 12,
        /** 红相 */
        rELEPHANT = 13,
        /** 红卒 */
        rPAWN = 14,
    }

    export var B_BEGIN = ChessDefined.bKING;
    export var B_END = ChessDefined.bPAWN;
    export var R_BEGIN = ChessDefined.rKING;
    export var R_END = ChessDefined.rPAWN;

    /**
     * 判断一个棋子是不是黑色
     * @param x 
     */
    export function isBlack(x: number) {
        return x >= this.B_BEGIN && x <= this.B_END;
    }

    /**
     * 判断一个棋子是不是红色
     * @param x 
     */
    export function isRed(x: number) {
        return x >= this.R_BEGIN && x <= this.R_END;
    }

    /**
     * 判断两个棋子是不是同色
     * @param x 
     * @param y 
     */
    export function isSameSide(x: number, y: number) {
        return (this.isBlack(x) && this.isBlack(y)) || (this.isRed(x) && this.isRed(y));
    }

    export interface ChessmanPosition {
        x: number, y: number
    }

    /** 走法的结构 */
    export interface ChessMove {
        /** 标明是什么棋子 */
        chessID: number;
        /** 起始位置 */
        from: ChessmanPosition;
        /** 走到的位置 */
        to: ChessmanPosition;
        /** 值 */
        score: number;
    }
}