import { sys } from 'cc';
import { ENUM_GAME_MODE, ENUM_GAME_STATUS } from '../Enum';
import Chess from '../game/Chess';

const STORAGE_KEY = 'CC_MATCH_MOVE'

export const LEVEL_DATA = [
    {
        name: 'Stage1',
        xnums: 8,
        ynums: 3,
        pairs: 6
    },
    {
        name: 'Stage2',
        xnums: 10,
        ynums: 8,
        pairs: 20
    },
    {
        name: 'Stage3',
        xnums: 10,
        ynums: 12,
        pairs: 30
    }
]

export const CHESS_INFO = {
    width: 70,
    height: 86
}

export const LEVEL_TIPS = [
    '你目前仅击败了全国0.2%的玩家',
    '你的战绩击败了全国32%的玩家',
    '你的战绩击败了全国56%的玩家',
    '你的战绩击败了全国62%的玩家',
    '你的战绩击败了全国80%的玩家',
    '太棒了，你的战绩击败了全国98%的玩家',
    '无敌了，你的战绩无人能超越！'
]

export default class DataManager {

    private static _instance: any = null

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
        }

        return this._instance
    }

    static get instance() {
        return this.getInstance<DataManager>()
    }

    // 游戏模式
    mode: ENUM_GAME_MODE = ENUM_GAME_MODE.SCORE
    // 游戏状态
    status: ENUM_GAME_STATUS = ENUM_GAME_STATUS.UNRUNING
    // 加载进度
    loadingRate: number = 0
    // 声音开启
    _isMusicOn: boolean = true
    _isSoundOn: boolean = true
    // 更多游戏
    games: any[] = [
      // { title: '消灭星星', icon: 'xiao2d', appid: 'wxefd5a4ddd8e31b44', url: 'https://store.cocos.com/app/detail/4183' }
    ]
    // 关卡
    level: number = 1
    levelMax: number = 3
    levelCount: number = 1
    // 得分
    score: number = 0
    scoreMax: number = 0
    scoreUnit: number = 5
    scoreComboDuration: number = 10
    scoreComboTime: number = 0
    // 所有棋子
    chesses: Chess[][] = []
    // 点击棋子和周围棋子
    activeChesses: { center: Chess, around: Chess[] } = null
    // 移动的front棋子
    frontChesses: Chess[] = []
    // 移动的clear棋子
    backChesses: Chess[] = []
    // 当前选中棋子
    currentChess: Chess = null
    // 层级
    zIndex: number = 0
    // 点击
    isTouching: boolean = false
    // 检测Clear
    isChecking: boolean = false
    // 洗牌中
    isShuffling: boolean = false
    // 提示棋子
    tipChesses: Chess[] = []
    // 体力
    power: number = 5
    powerCollectByVideo: number = 1
    // 体力回复间隔(60秒)
    lastPowerRefreshTime: number = 0 // 每次刷新纪录点
    powerRefreshTime: number = 60 // 间隔刷新
    lastPowerUpdateTime: number = 0 // 后续离开游戏返回补充能量
    // 金币
    keys: number = 5
    keysCollectByVideo: number = 1
    // 棋子总数和删除数
    chessNums: { total: number, clear: number } = { total: 0, clear: 0 }
    // 自动提示
    tipLong: number = 150
    tipTime: number = 0

    get isMusicOn() {
        return this._isMusicOn
    }

    set isMusicOn(data: boolean) {
        this._isMusicOn = data
    }

    get isSoundOn() {
        return this._isSoundOn
    }

    set isSoundOn(data: boolean) {
        this._isSoundOn = data
    }

    reset() {
        this.status = ENUM_GAME_STATUS.UNRUNING
        this.chesses = []
        this.activeChesses = null
        this.frontChesses = []
        this.backChesses = []
        this.tipChesses = []
        this.zIndex = 0
        this.isTouching = false
        this.isChecking = false
        this.isShuffling = false
        this.chessNums = { total: 0, clear: 0 }
        this.tipTime = 0
        this.scoreComboTime = 0
        this.currentChess = null
    }

    save() {
        sys.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            isSoundOn: this.isSoundOn,
            isMusicOn: this.isMusicOn,
            keys: this.keys,
            power: this.power,
            lastPowerRefreshTime: this.lastPowerRefreshTime,
            lastPowerUpdateTime: this.lastPowerUpdateTime,
            scoreMax: this.scoreMax,
            levelCount: this.levelCount
        }))
    }

    restore() {
        const _data = sys.localStorage.getItem(STORAGE_KEY) as any
        try {
            const data = JSON.parse(_data)
            this.isMusicOn = data?.isMusicOn === false ? false : true
            this.isSoundOn = data?.isSoundOn === false ? false : true
            this.keys = typeof data.keys == 'number' ? data.keys : 5
            this.power = typeof data.power == 'number' ? data.power : 5
            this.lastPowerRefreshTime = typeof data.lastPowerRefreshTime == 'number' ? data.lastPowerRefreshTime : 0
            this.lastPowerUpdateTime = typeof data.lastPowerUpdateTime == 'number' ? data.lastPowerUpdateTime : 0
            this.scoreMax = typeof data.scoreMax == 'number' ? data.scoreMax : 0
            this.levelCount = typeof data.levelCount == 'number' ? data.levelCount : 1
        } catch {
            this.isMusicOn = true
            this.isSoundOn = true
            this.keys = 5
            this.power = 5
            this.lastPowerRefreshTime = 0
            this.lastPowerUpdateTime = 0
            this.scoreMax = 0
            this.levelCount = 1
        }
    }
}
