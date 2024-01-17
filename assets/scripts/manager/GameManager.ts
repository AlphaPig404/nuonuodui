import { Component, Node, _decorator, color, find, tween, v3 } from "cc";
import { ENUM_AUDIO_CLIP, ENUM_GAME_MODE, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from "../StaticInstance";
import Chess from "../game/Chess";
import ChessBoard from "../game/ChessBoard";
import AudioManager from "./AudioManager";
import DataManager, { LEVEL_DATA } from "./DataManager";
import PoolManager from "./PoolManager";
import ToastManager from "./ToastManager";

const { ccclass, property } = _decorator;

@ccclass
export default class GameManager extends Component {

    stage: Node = null

    onLoad() {
        StaticInstance.setGameManager(this)
        this.stage = find('Stage', this.node)
        console.log('log:::GameManager', 'onLoad')
    }

    onDestroy() { }

    // 开始游戏
    onGameStart() {
        DataManager.instance.reset()
        DataManager.instance.level = 1
        DataManager.instance.score = 0
        this.initGame()
    }

    onGameLevelStart() {
        DataManager.instance.reset()
        this.initGame()
    }

    onGameCheck() {
        if (DataManager.instance.chessNums.total <= DataManager.instance.chessNums.clear) {
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.WIN)
            if (DataManager.instance.mode == ENUM_GAME_MODE.SCORE) {
                if (DataManager.instance.level < DataManager.instance.levelMax) {
                    DataManager.instance.reset()
                    DataManager.instance.level += 1
                    this.initGame()
                    // 提示难度加大
                    StaticInstance.uiManager.setMainLevelUpNotice()
                } else {
                    // 完成所有关卡进入结算
                    StaticInstance.uiManager.toggle(ENUM_UI_TYPE.OVER)
                }
            } else {
                DataManager.instance.levelCount += 1
                DataManager.instance.save()
                StaticInstance.uiManager.toggle(ENUM_UI_TYPE.WIN)
            }
        } else {
            if (DataManager.instance.mode == ENUM_GAME_MODE.SCORE) {
                // 出现没得消的情况，洗牌
                let count = 0
                let isShuffle = false
                while (!this.onShuffleCheck()) {
                    if (!isShuffle) AudioManager.instance.playSound(ENUM_AUDIO_CLIP.SHUFFLE)
                    isShuffle = true
                    this.onShuffle(false)
                    count += 1
                    if (count >= 5000) {
                        console.log('调试过程：退出死循环')
                        break
                    }
                }
            } else {
                // 没得消除直接闯关失败
                if (!this.onShuffleCheck()) {
                    AudioManager.instance.playSound(ENUM_AUDIO_CLIP.LOSE)
                    StaticInstance.uiManager.toggle(ENUM_UI_TYPE.LOSE)
                }
            }
        }
    }

    // 初始化游戏
    initGame() {
        DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
        this.stage.removeAllChildren()
        if (DataManager.instance.mode == ENUM_GAME_MODE.SCORE) {
            if (!LEVEL_DATA[DataManager.instance.level - 1]) return
            const { name, xnums, ynums, pairs } = LEVEL_DATA[DataManager.instance.level - 1]
            const stage = PoolManager.instance.getNode(name, this.stage)
            const chessboard = stage.getChildByName('chessboard')
            chessboard.getComponent(ChessBoard).init(xnums, ynums, pairs)
            // 加载ui
            StaticInstance.uiManager.setMainScoreNum(true)
            DataManager.instance.status = ENUM_GAME_STATUS.RUNING
        } else {
            let levelIndex = 1
            if (DataManager.instance.levelCount > 1) levelIndex = 2
            const { name, xnums, ynums, pairs } = LEVEL_DATA[levelIndex]
            const stage = PoolManager.instance.getNode(name, this.stage)
            const chessboard = stage.getChildByName('chessboard')
            chessboard.getComponent(ChessBoard).init(xnums, ynums, pairs)
            // 加载ui
            StaticInstance.uiManager.rendorMainLevelNum()
            DataManager.instance.status = ENUM_GAME_STATUS.RUNING
        }
    }

    // 洗牌
    onShuffle(isAnim: boolean = true) {
        if (DataManager.instance.isShuffling || DataManager.instance.activeChesses || DataManager.instance.isTouching || DataManager.instance.isChecking) return
        // 取消提示eff
        for (let i = 0; i < DataManager.instance.tipChesses.length; i++) {
            const chess = DataManager.instance.tipChesses[i]
            chess.setEffect('eff_hand', false)
            chess.setEffect('eff_tip', false)
        }
        DataManager.instance.tipChesses = []
        DataManager.instance.tipTime = 0
        DataManager.instance.isShuffling = true
        const frontChesses: Chess[] = []
        const chesses = DataManager.instance.chesses
        for (let i = 0; i < chesses.length; i++) {
            for (let j = 0; j < chesses[0].length; j++) {
                if (!chesses[i][j].isClear) frontChesses.push(chesses[i][j])
            }
        }
        let count = 0
        for (let i = 0; i < frontChesses.length; i++) {
            if (isAnim) {
              const _tween = tween(frontChesses[i].node)
                const act1 = _tween.to(0.15, {scale: v3(0.3, 0.3, 0)})
                const act2 = _tween.call(() => {
                    const random = Math.floor(Math.random() * frontChesses.length)
                    // 结构避免引用赋值
                    const { x: x1, y: y1 } = frontChesses[i]
                    const { x: x2, y: y2 } = frontChesses[random]
                    // 交换
                    frontChesses[i].resetChess(x2, y2, frontChesses[i])
                    frontChesses[random].resetChess(x1, y1, frontChesses[random])
                })
                const act3 = _tween.to(0.15, {scale: v3(1, 1, 0)})
                tween(frontChesses[i].node).sequence(act1, act2, act3).call(() => {
                    count += 1
                    if (count == frontChesses.length) {
                        DataManager.instance.isShuffling = false
                    }
                }).start()
            } else {
                const random = Math.floor(Math.random() * frontChesses.length)
                // 结构避免引用赋值
                const { x: x1, y: y1 } = frontChesses[i]
                const { x: x2, y: y2 } = frontChesses[random]
                // 交换
                frontChesses[i].resetChess(x2, y2, frontChesses[i])
                frontChesses[random].resetChess(x1, y1, frontChesses[random])
                DataManager.instance.isShuffling = false
            }
        }
    }

    onShuffleCheck() {
        const frontChesses: Chess[] = []
        const chesses = DataManager.instance.chesses
        for (let i = 0; i < chesses.length; i++) {
            for (let j = 0; j < chesses[0].length; j++) {
                if (!chesses[i][j].isClear) frontChesses.push(chesses[i][j])
            }
        }
        for (let i = 0; i < frontChesses.length; i++) {
            const chess = frontChesses[i]
            const arr = chess.searchEnableClearChesses()
            if (arr.length) {
                return true
            }
        }
        return false
    }

    // 提示
    onTip() {
        if (DataManager.instance.tipChesses.length || DataManager.instance.isShuffling || DataManager.instance.activeChesses || DataManager.instance.isTouching || DataManager.instance.isChecking) return
        const frontChesses: Chess[] = []
        const chesses = DataManager.instance.chesses
        for (let i = 0; i < chesses.length; i++) {
            for (let j = 0; j < chesses[0].length; j++) {
                if (!chesses[i][j].isClear) frontChesses.push(chesses[i][j])
            }
        }
        for (let i = 0; i < frontChesses.length; i++) {
            const chess = frontChesses[i]
            const arr = chess.searchEnableClearChesses()
            if (arr.length) {
                DataManager.instance.tipChesses = arr
                DataManager.instance.tipChesses.push(chess)
                break
            }
        }
        if (DataManager.instance.tipChesses.length) {
            for (let i = 0; i < DataManager.instance.tipChesses.length; i++) {
                const chess = DataManager.instance.tipChesses[i]
                if (i == 0) chess.setEffect('eff_hand', true)
                chess.setEffect('eff_tip', true)
            }
        } else {
            ToastManager.instance.show('无匹配对，请进行洗牌', { gravity: 'CENTER', bg_color: color(102, 202, 28, 255) })
        }
    }

    onTipShow() {
        this.onTip()
    }

    update(dt: number) {
        // 第一关自动提示功能
        if (DataManager.instance.mode == ENUM_GAME_MODE.SCORE && DataManager.instance.status == ENUM_GAME_STATUS.RUNING && DataManager.instance.level == 1 && !DataManager.instance.tipChesses.length && !DataManager.instance.isTouching) {
            DataManager.instance.tipTime++
            if (DataManager.instance.tipTime >= DataManager.instance.tipLong) {
                DataManager.instance.tipTime = 0
                this.onTipShow()
            }
        }
    }
}
