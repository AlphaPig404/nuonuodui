import { Component, _decorator } from "cc";
import { StaticInstance } from "../StaticInstance";
import { shuffle } from "../Utils";
import DataManager from "../manager/DataManager";
import PoolManager from "../manager/PoolManager";
import Chess from "./Chess";

const { ccclass, property } = _decorator;

@ccclass
export default class ChessBoard extends Component {

    onLoad() {
        this.node.removeAllChildren()
    }

    /**
     * 
     * @param xn 横向个数 10
     * @param yn 纵向个数 8 12
     * @param pairs 对数 20
     */
    init(xn: number = 10, yn: number = 8, pairs: number = 20) {
        const some = xn * yn / pairs
        let numArr = []
        for (let n = 1; n <= pairs; n++) {
            for (let m = 0; m < some; m++) numArr.push(n)
        }
        // 简单随机
        numArr = shuffle(numArr)
        for (let x = 0; x < xn; x++) {
            DataManager.instance.chesses[x] = []
            for (let y = 0; y < yn; y++) {
                const chess = PoolManager.instance.getNode('Chess', this.node)
                const num = numArr.pop()
                if (num) {
                    const chessComponent = chess.getComponent(Chess)
                    let isClear = false
                    // 测试数据
                    // if ((x == 1 && y == 1) || (x == 2 && y == 1) || (x == 3 && y == 1) || (x == 4 && y == 1)) isClear = true
                    chessComponent.init(x, y, num, isClear)
                    DataManager.instance.chesses[x][y] = chessComponent
                    if (x == xn - 1 && y == yn - 1) {
                        // 初始棋盘必须存在一个成对
                        while (!StaticInstance.gameManager.onShuffleCheck()) {
                            StaticInstance.gameManager.onShuffle(false)
                        }
                    }
                }
            }
        }
    }
}
