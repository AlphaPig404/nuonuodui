import { Animation, Component, Event, EventTouch, Label, Node, Sprite, Touch, UITransform, Vec2, Vec3, _decorator, tween, v2, v3} from "cc";
import { ENUM_AUDIO_CLIP, ENUM_GAME_MODE } from "../Enum";
import { StaticInstance } from "../StaticInstance";
import { getAngle, getDistance, getXYFromPos } from "../Utils";
import AudioManager from "../manager/AudioManager";
import DataManager, { CHESS_INFO } from "../manager/DataManager";
import ResourceManager from "../manager/ResourceManager";

const { ccclass, property } = _decorator;

@ccclass
export default class Chess extends Component {

    x: number = 0
    y: number = 0
    num: number = 0
    isClear: boolean = false

    touchPos: Vec2 = null
    startPos: Vec2 = null
    // 移动阀值：达到才算开始移动
    moveSafetyDis: number = 0.1
    // 移动方向
    moveDir: Vec2 = v2(0, 0)
    // 是否移动
    isMoving: boolean = false
    // 移动距离
    moveDis: Vec2 = v2(0, 0)
    // 当前选中
    current: Chess = null

    init(x: number, y: number, num: number, isClear: boolean = false) {
        // 初始化
        this.x = x
        this.y = y
        this.num = num
        this.setClear(isClear, true)
        this.touchPos = null
        this.startPos = null
        this.moveDir = v2(0, 0)
        this.isMoving = false
        this.moveDis = v2(0, 0)
        // 位置
        this.node.setPosition(CHESS_INFO.width / 2 + x * CHESS_INFO.width, CHESS_INFO.height / 2 + y * CHESS_INFO.height)
        // 渲染
        this.node.getChildByName('icon').getComponent(Sprite).spriteFrame = ResourceManager.instance.getSprite(`${num}`)
        // 注册事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchOver, this)
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchOver, this)
    }

    setClear(isClear: boolean = true, isInit: boolean = false) {
        this.isClear = isClear
        this.node.getChildByName('back').active = isClear
        if (isInit) DataManager.instance.chessNums.total += 1
        if (this.isClear) DataManager.instance.chessNums.clear += 1
    }

    setAnim(isAnim: boolean = true) {
        const anim = this.node.getComponent(Animation)
        if (isAnim) {
            anim.play()
        } else {
            this.node.setScale(v3(1,1,0))
            anim.stop()
        }
    }

    setEffect(name: string = 'eff_touch', isShow: boolean = true) {
        this.node.getChildByName(name).active = isShow
    }

    onTouchStart(e: Touch) {
      console.log('log:::onTouchStart')
        if (this.isClear || DataManager.instance.isChecking || DataManager.instance.isShuffling || DataManager.instance.isTouching) return
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.TOUCH)
        DataManager.instance.isTouching = true
        DataManager.instance.currentChess = this
        DataManager.instance.tipTime = 0
        const touchPos = e.getLocation()
        const pos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(v3(touchPos.x, touchPos.y, 0))
        this.touchPos = v2(pos.x, pos.y)
        const startPos = this.node.getPosition()
        this.startPos = v2(startPos.x, startPos.y)
        this.setEffect('eff_touch', true)
        // 取消提示eff
        for (let i = 0; i < DataManager.instance.tipChesses.length; i++) {
            const chess = DataManager.instance.tipChesses[i]
            chess.setEffect('eff_hand', false)
            chess.setEffect('eff_tip', false)
        }
        DataManager.instance.tipChesses = []
    }

    onTouchMove(e: EventTouch) {
        if (this.isClear || DataManager.instance.activeChesses || DataManager.instance.isChecking || DataManager.instance.isShuffling) return
        if (DataManager.instance.currentChess == this) {
            const touchPos = e.getLocation()
            const pos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(v3(touchPos.x, touchPos.y, 0))
            console.log('log:::e', pos, touchPos)
            // 开始移动
            if (this.isMoving) {
                // front移动
                DataManager.instance.frontChesses.forEach((chess, index) => {
                    const newPos = chess.node.getPosition()
                    if (this.moveDir.x == 1) {
                        const x = pos.x + CHESS_INFO.width * index
                        const min = chess.startPos.x
                        const max = chess.startPos.x + DataManager.instance.backChesses.length * CHESS_INFO.width
                        const limitX = Math.min(x, max)
                        newPos.x = Math.max(limitX, min)
                        if (index == 0) this.moveDis.x = newPos.x - chess.startPos.x
                    } else if (this.moveDir.x == -1) {
                        const x = pos.x - CHESS_INFO.width * index
                        const min = chess.startPos.x - (DataManager.instance.backChesses.length * CHESS_INFO.width)
                        const max = chess.startPos.x
                        const limitX = Math.max(x, min)
                        newPos.x = Math.min(limitX, max)
                        if (index == 0) this.moveDis.x = newPos.x - chess.startPos.x
                    } else if (this.moveDir.y == 1) {
                        const y = pos.y + CHESS_INFO.height * index
                        const min = chess.startPos.y
                        const max = chess.startPos.y + DataManager.instance.backChesses.length * CHESS_INFO.height
                        const limitY = Math.min(y, max)
                        newPos.y = Math.max(limitY, min)
                        if (index == 0) this.moveDis.y = newPos.y - chess.startPos.y
                    } else if (this.moveDir.y == -1) {
                        const y = pos.y - CHESS_INFO.height * index
                        const min = chess.startPos.y - (DataManager.instance.backChesses.length * CHESS_INFO.height)
                        const max = chess.startPos.y
                        const limitY = Math.max(y, min)
                        newPos.y = Math.min(limitY, max)
                        if (index == 0) this.moveDis.y = newPos.y - chess.startPos.y
                    }
                    chess.node.setPosition(newPos)
                })
                // 移动距离
                this.backChessMove()
                return
            }
            // 判断是否可以移动
            if (this.moveDir.x != 0 || this.moveDir.y != 0) {
                const chesses = this.searchMove()
                console.log('log:::chesses', chesses)
                if (chesses) {
                    DataManager.instance.frontChesses = chesses.frontChesses
                    DataManager.instance.backChesses = chesses.backChesses
                    this.isMoving = true
                    DataManager.instance.zIndex += 1
                    DataManager.instance.frontChesses.forEach(chess => chess.node.setSiblingIndex(DataManager.instance.chessNums.total))
                    console.log('log:::zIndex', DataManager.instance.zIndex)
                }
                return
            }
            // 判断移动方向
            if (this.touchPos) {
                const dis = getDistance(this.touchPos, v2(pos.x, pos.y))
                console.log('log:::dis', dis)
                if (dis >= this.moveSafetyDis) {
                    const angle = Math.abs(getAngle(this.touchPos, v2(pos.x, pos.y)))
                    console.log('log:::angle', {
                      angle,
                      x: this.touchPos.x - pos.x,
                      y: this.touchPos.y - pos.y
                    })
                    if (angle > 45 && angle < 135) {
                        this.moveDir.x = 0
                        if (this.touchPos.y - pos.y > 0) {
                            this.moveDir.y = -1
                        } else {
                            this.moveDir.y = 1
                        }
                    } else {
                        this.moveDir.y = 0
                        if (this.touchPos.x - pos.x < 0) {
                            this.moveDir.x = 1
                        } else {
                            this.moveDir.x = -1
                        }
                    }
                }
                // console.log(this.moveDir.x, this.moveDir.y)
            }
        }
    }

    onTouchOver() {
        if (this.isClear || DataManager.instance.isChecking || DataManager.instance.isShuffling) return
        if (DataManager.instance.currentChess == this) {
            this.setEffect('eff_touch', false)
            DataManager.instance.isTouching = false
            DataManager.instance.isChecking = true
            DataManager.instance.currentChess = null
            // 同步back
            this.backChessMove()
            // 检查clear
            this.checkClear()
        } else {
            console.log(DataManager.instance.currentChess)
        }
    }

    checkClear() {
        if (DataManager.instance.activeChesses) {
            const { center, around } = DataManager.instance.activeChesses
            const target = around.find(chess => chess.x == this.x && chess.y == this.y)
            if (target) {
                target.isClear = false
                center.isClear = false
                around.forEach(chess => {
                    chess.setAnim(false)
                    chess.setEffect('eff_click', false)
                })
                DataManager.instance.activeChesses = null
                // 翻牌动画
                this.chessFlip([target, center])
            } else {
                this.resetStatus()
            }
        } else {
            const chesses = this.searchAround()
            if (chesses.length) {
                if (chesses.length > 1) {
                    // 选择一个组队clear
                    DataManager.instance.activeChesses = { center: this, around: chesses }
                    chesses.forEach(chess => {
                        chess.setAnim(true)
                        chess.setEffect('eff_click', true)
                    })
                    this.resetStatus()
                } else {
                    // 直接clear
                    this.isClear = false
                    chesses[0].isClear = false
                    // 翻牌动画
                    this.chessFlip([this, chesses[0]])
                }
            } else {
                // console.log('没匹配恢复最初状态')
                // 移动恢复状态动画
                const chessArr = DataManager.instance.frontChesses.concat(DataManager.instance.backChesses)
                if (chessArr.length) {
                    let count = 0
                    chessArr.forEach(chess => {
                        const position = v3(chess.startPos.x, chess.startPos.y, 0)
                        tween(chess.node).to(0.1, {position: position}).call(() => {
                            // 更新棋盘信息: 恢复
                            const { x, y } = getXYFromPos(chess.node.position.x, chess.node.position.y, CHESS_INFO.width, CHESS_INFO.height)
                            this.resetChess(x, y, chess)
                            count += 1
                            if (count == chessArr.length) {
                                this.resetStatus()
                            }
                        }).start()
                    })
                } else {
                    this.resetStatus()
                }
            }
        }
    }

    chessFlip(chesses: Chess[]) {
        return new Promise(resolve => {
            let eff_score = '哇'
            let score = 0
            if (DataManager.instance.mode == ENUM_GAME_MODE.SCORE) {
                // 计分规则，时间 * 单位分数
                if (DataManager.instance.scoreComboTime == 0) AudioManager.instance.playSound(ENUM_AUDIO_CLIP.BONUS)
                const scoreFate = Math.max(1, DataManager.instance.scoreComboTime)
                score = DataManager.instance.scoreUnit * scoreFate
                eff_score = `+${score}`
            }
            // console.log(scoreFate, score)
            let count = 0
            chesses.forEach(chess => {
                chess.node.getChildByName('eff_score').getComponent(Label).string = `${eff_score}`
                chess.node.setSiblingIndex(DataManager.instance.chessNums.total)
                chess.setEffect('eff_score', true)
                const act1 = tween(chess.node).to(0.1, {scale: v3(0, 1, 0)})
                const act2 = tween(chess.node).call(() => {
                  chess.setClear()
                })
                const act3 = tween(chess.node).to(0.1, {scale: v3(1, 1, 0)})
                tween(chess.node).sequence(act1, act2, act3).call(() => {
                    if (count == 0) {
                        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLERE)
                        if (DataManager.instance.mode == ENUM_GAME_MODE.SCORE) {
                            DataManager.instance.score += score * 2
                            StaticInstance.uiManager.setMainScoreNum()
                        }
                    }
                    count += 1
                    if (count == chesses.length) {
                        this.resetStatus()
                        // 游戏结束与否
                        StaticInstance.gameManager.onGameCheck()
                        resolve(null)
                    }
                }).start()
            })
        })
    }

    searchMove() {
        const backChesses: Chess[] = []
        const frontChesses: Chess[] = [this]
        let isClearFind: boolean = false
        if (this.moveDir.x == 1) {
            // 右边
            let tempx = this.x
            while (true) {
                tempx += 1
                const tempchess = DataManager.instance.chesses?.[tempx]?.[this.y]
                if (!tempchess) break
                if (isClearFind && !tempchess.isClear) break
                const position = tempchess.node.getPosition()
                tempchess.startPos = v2(position.x, position.y)
                if (tempchess.isClear) {
                    backChesses.push(tempchess)
                    isClearFind = true
                } else {
                    frontChesses.push(tempchess)
                }
            }
        } else if (this.moveDir.x == -1) {
            // 左边
            let tempx = this.x
            while (true) {
                tempx -= 1
                const tempchess = DataManager.instance.chesses?.[tempx]?.[this.y]
                if (!tempchess) break
                if (isClearFind && !tempchess.isClear) break
                const position = tempchess.node.getPosition()
                tempchess.startPos = v2(position.x, position.y)
                if (tempchess.isClear) {
                    backChesses.push(tempchess)
                    isClearFind = true
                } else {
                    frontChesses.push(tempchess)
                }
            }
        } else if (this.moveDir.y == 1) {
            // 上边
            let tempy = this.y
            while (true) {
                tempy += 1
                const tempchess = DataManager.instance.chesses?.[this.x]?.[tempy]
                if (!tempchess) break
                if (isClearFind && !tempchess.isClear) break
                const position = tempchess.node.getPosition()
                tempchess.startPos = v2(position.x, position.y)
                if (tempchess.isClear) {
                    backChesses.push(tempchess)
                    isClearFind = true
                } else {
                    frontChesses.push(tempchess)
                }
            }
        } else if (this.moveDir.y == -1) {
            // 下边
            let tempy = this.y
            while (true) {
                tempy -= 1
                const tempchess = DataManager.instance.chesses?.[this.x]?.[tempy]
                if (!tempchess) break
                if (isClearFind && !tempchess.isClear) break
                const position = tempchess.node.getPosition()
                tempchess.startPos = v2(position.x, position.y)
                if (tempchess.isClear) {
                    backChesses.push(tempchess)
                    isClearFind = true
                } else {
                    frontChesses.push(tempchess)
                }
            }
        }
        if (isClearFind) {
            return { backChesses, frontChesses }
        } else {
            return null
        }
    }

    searchAround() {
        /**
         * 滑动时x,y棋盘数据更新
         * 调整位置，更新整个棋盘x,y
         */
        const chessArr = DataManager.instance.frontChesses.concat(DataManager.instance.backChesses)
        chessArr.forEach(chess => {
            // 更新棋盘信息: 变更
            const { x, y } = getXYFromPos(chess.node.position.x, chess.node.position.y, CHESS_INFO.width, CHESS_INFO.height)
            this.resetChess(x, y, chess)
        })
        // return []

        let target = this
        const chesses: Chess[] = []
        // 遍历左边
        let tempx = target.x
        while (true) {
            tempx -= 1
            const tempchess = DataManager.instance.chesses?.[tempx]?.[target.y]
            // 遍历到尽头
            if (!tempchess) break
            // 下个相邻点未clear
            if (!tempchess.isClear) {
                if (tempchess.num == target.num) chesses.push(tempchess)
                break
            }
        }
        // 遍历上边
        let tempy = target.y
        while (true) {
            tempy += 1
            const tempchess = DataManager.instance.chesses?.[target.x]?.[tempy]
            if (!tempchess) break
            if (!tempchess.isClear) {
                if (tempchess.num == target.num) chesses.push(tempchess)
                break
            }
        }
        // 遍历右边
        tempx = target.x
        while (true) {
            tempx += 1
            const tempchess = DataManager.instance.chesses?.[tempx]?.[target.y]
            // 遍历到尽头
            if (!tempchess) break
            // 下个相邻点未clear
            if (!tempchess.isClear) {
                if (tempchess.num == target.num) chesses.push(tempchess)
                break
            }
        }
        // 遍历下边
        tempy = target.y
        while (true) {
            tempy -= 1
            const tempchess = DataManager.instance.chesses?.[target.x]?.[tempy]
            if (!tempchess) break
            if (!tempchess.isClear) {
                if (tempchess.num == target.num) chesses.push(tempchess)
                break
            }
        }
        return chesses
    }

    // 检查一个棋子是否存在可消除匹配的棋子
    searchEnableClearChesses() {
        // 根据x, y, num匹配
        function searchAroundOnce(x: number, y: number, num: number, ignoreX: number = undefined, ignoreY: number = undefined) {
            let chess: Chess = null
            // 左
            let tempx = x, tempy = y
            while (true) {
                tempx -= 1
                const tempchess = DataManager.instance.chesses?.[tempx]?.[tempy]
                // 遍历到尽头
                if (!tempchess) break
                if (ignoreX == tempchess.x && ignoreY == tempchess.y) break
                // 下个相邻点未clear
                if (!tempchess.isClear) {
                    if (tempchess.num == num) {
                        chess = tempchess
                    }
                    break
                }
            }
            if (chess) {
                return chess
            }
            // 右
            tempx = x, tempy = y
            while (true) {
                tempx += 1
                const tempchess = DataManager.instance.chesses?.[tempx]?.[tempy]
                // 遍历到尽头
                if (!tempchess) break
                if (ignoreX == tempchess.x && ignoreY == tempchess.y) break
                // 下个相邻点未clear
                if (!tempchess.isClear) {
                    if (tempchess.num == num) {
                        chess = tempchess
                    }
                    break
                }
            }
            if (chess) {
                return chess
            }
            // 上
            tempx = x, tempy = y
            while (true) {
                tempy += 1
                const tempchess = DataManager.instance.chesses?.[tempx]?.[tempy]
                if (!tempchess) break
                if (ignoreX == tempchess.x && ignoreY == tempchess.y) break
                if (!tempchess.isClear) {
                    if (tempchess.num == num) {
                        chess = tempchess
                    }
                    break
                }
            }
            if (chess) {
                return chess
            }
            // 下
            tempx = x, tempy = y
            while (true) {
                tempy -= 1
                const tempchess = DataManager.instance.chesses?.[tempx]?.[tempy]
                if (!tempchess) break
                if (ignoreX == tempchess.x && ignoreY == tempchess.y) break
                if (!tempchess.isClear) {
                    if (tempchess.num == num) {
                        chess = tempchess
                    }
                    break
                }
            }
            if (chess) {
                return chess
            }
            return chess
        }
        let arr = null
        // 当前位置检查
        if (arr = searchAroundOnce(this.x, this.y, this.num, this.x, this.y)) {
            // console.log(`【自己${this.num}】(${this.x}, ${this.y}):(${arr.x}, ${arr.y})`)
            return [this, arr]
        }
        // 4个方向移动后检查
        // 右边
        let tempx = this.x, tempy = this.y
        while (true) {
            tempx += 1
            const tempchess = DataManager.instance.chesses?.[tempx]?.[tempy]
            if (!tempchess) break
            if (!tempchess.isClear) break
            if (arr = searchAroundOnce(tempx, tempy, this.num, this.x, this.y)) {
                // console.log(`【右移${this.num}】(${this.x}, ${this.y}):(${arr.x}, ${arr.y})`)
                return [this, arr]
            }
        }
        // 左边
        tempx = this.x, tempy = this.y
        while (true) {
            tempx -= 1
            const tempchess = DataManager.instance.chesses?.[tempx]?.[tempy]
            if (!tempchess) break
            if (!tempchess.isClear) break
            if (arr = searchAroundOnce(tempx, tempy, this.num, this.x, this.y)) {
                // console.log(`【左移${this.num}】(${this.x}, ${this.y}):(${arr.x}, ${arr.y})`)
                return [this, arr]
            }
        }
        // 上边
        tempx = this.x, tempy = this.y
        while (true) {
            tempy += 1
            const tempchess = DataManager.instance.chesses?.[tempx]?.[tempy]
            if (!tempchess) break
            if (!tempchess.isClear) break
            if (arr = searchAroundOnce(tempx, tempy, this.num, this.x, this.y)) {
                // console.log(`【上移${this.num}】(${this.x}, ${this.y}):(${arr.x}, ${arr.y})`)
                return [this, arr]
            }
        }
        // 下边
        tempx = this.x, tempy = this.y
        while (true) {
            tempy -= 1
            const tempchess = DataManager.instance.chesses?.[tempx]?.[tempy]
            if (!tempchess) break
            if (!tempchess.isClear) break
            if (arr = searchAroundOnce(tempx, tempy, this.num, this.x, this.y)) {
                // console.log(`【下移${this.num}】(${this.x}, ${this.y}):(${arr.x}, ${arr.y})`)
                return [this, arr]
            }
        }
        return []
    }

    backChessMove() {
        let bnums = Math.floor((Math.abs(this.moveDis.x) + CHESS_INFO.width / 2) / CHESS_INFO.width)
        if (this.moveDis.y) {
            bnums = Math.floor((Math.abs(this.moveDis.y) + CHESS_INFO.height / 2) / CHESS_INFO.height)
        }
        // 进
        for (let i = 0; i < bnums; i++) {
            const chess = DataManager.instance.backChesses[i]
            if (chess.startPos.x == chess.node.position.x && chess.startPos.y == chess.node.position.y) {
                AudioManager.instance.playSound(ENUM_AUDIO_CLIP.MOVE)
                if (this.moveDir.x == 1) {
                    // console.log(index, '左移动', CHESS_INFO.width * DataManager.instance.frontChesses.length)
                    chess.node.setPosition(chess.node.position.x - CHESS_INFO.width * DataManager.instance.frontChesses.length, chess.node.position.y)
                } else if (this.moveDir.x == -1) {
                    // console.log(index, '右移动', CHESS_INFO.width * DataManager.instance.frontChesses.length)
                    chess.node.setPosition(chess.node.position.x + CHESS_INFO.width * DataManager.instance.frontChesses.length, chess.node.position.y)
                } else if (this.moveDir.y == 1) {
                    // console.log(index, '下移动', CHESS_INFO.height * DataManager.instance.frontChesses.length)
                    chess.node.setPosition(chess.node.position.x, chess.node.position.y - CHESS_INFO.height * DataManager.instance.frontChesses.length)
                } else if (this.moveDir.y == -1) {
                    // console.log(index, '上移动', CHESS_INFO.height * DataManager.instance.frontChesses.length)
                    chess.node.setPosition(chess.node.position.x, chess.node.position.y + CHESS_INFO.height * DataManager.instance.frontChesses.length)
                }
            }
        }
        // 退
        for (let j = DataManager.instance.backChesses.length - 1; j >= bnums; j--) {
            // console.log(bnums, i)
            const chess = DataManager.instance.backChesses[j]
            if (!(chess.startPos.x == chess.node.position.x && chess.startPos.y == chess.node.position.y)) {
                AudioManager.instance.playSound(ENUM_AUDIO_CLIP.MOVE)
                chess.node.setPosition(v3(chess.startPos.x, chess.startPos.y, 0))
            }
        }
    }

    resetChess(x: number, y: number, chess: Chess) {
        chess.x = x
        chess.y = y
        DataManager.instance.chesses[x][y] = chess
        chess.node.setPosition(CHESS_INFO.width / 2 + chess.x * CHESS_INFO.width, CHESS_INFO.height / 2 + chess.y * CHESS_INFO.height)
    }

    resetStatus() {
        this.isMoving = false
        this.moveDir = v2(0, 0)
        this.moveDis = v2(0, 0)
        DataManager.instance.isChecking = false
        DataManager.instance.frontChesses = []
        DataManager.instance.backChesses = []
    }
}
