import { ENUM_AUDIO_CLIP, ENUM_GAME_MODE, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from './../StaticInstance';
import AudioManager from "../manager/AudioManager";
import SdkManager from "../manager/SdkManager";
import ToastManager from "../manager/ToastManager";
import HeaderLayer from "./HeaderLayer";
import DataManager from "../manager/DataManager";
import UIScrollLoopControl from "../plugins/UIScrollLoopControl";
import { Node, _decorator, color, find } from "cc";
import { getNodeWidth } from "../Utils";

const { ccclass, property } = _decorator;

@ccclass
export default class MenuLayer extends HeaderLayer {

    btnStart: Node = null
    btnStartLevel: Node = null
    btnSetting: Node = null
    btnGames: Node = null
    btnShare: Node = null
    btnRank: Node = null
    tips: Node = null
    btnLeftTip: Node = null
    btnRightTip: Node = null

    onLoad() {
        super.onLoad()
        
        this.btnStartLevel = find('buttons/btn_start_level', this.node)
        this.btnSetting = find('buttons/bottom/btn_setting', this.node)
        this.btnStart = find('buttons/btn_start', this.node)
        this.btnGames = find('buttons/bottom/btn_games', this.node)
        this.btnShare = find('buttons/bottom/btn_share', this.node)
        this.btnStart.on('click', this.onStartClick, this)
        this.btnStartLevel.on('click', this.onStartLevelClick, this)
        this.btnSetting.on('click', this.onSettingClick, this)
        this.btnGames.on('click', this.onGamesClick, this)
        this.btnShare.on('click', this.onShareClick, this)
        this.tips = find('main/panel/tips', this.node)
        this.btnRank = find('buttons/btn_rank', this.node)
        this.btnRank.on('click', this.onRankClick, this)
    }

    onDestroy() {
        this.btnStart.off('click', this.onStartClick, this)
        this.btnStartLevel.off('click', this.onStartLevelClick, this)
        this.btnSetting.off('click', this.onSettingClick, this)
        this.btnGames.off('click', this.onGamesClick, this)
        this.btnShare.off('click', this.onShareClick, this)
        this.btnRank.off('click', this.onRankClick, this)
    }

    onEnable() {
      this.rendorKeys()
      this.rendorPower()
      this.rendorPowerTimer()
    }

    onDisable() { }

    onTipLeftClick() {
        const loop = this.tips.getComponent(UIScrollLoopControl)
        const dis = getNodeWidth(loop.node) + loop.itemOffset
        loop.offset += dis
        if (loop.offset >= 1350) loop.offset = -770
        loop._initItemPos()
    }

    onTipRightClick() {
        const loop = this.tips.getComponent(UIScrollLoopControl)
        const dis = getNodeWidth(loop.node) + loop.itemOffset
        loop.offset -= dis
        if (loop.offset < -770) loop.offset = 820
        loop._initItemPos()
    }

    onStartClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        DataManager.instance.mode = ENUM_GAME_MODE.SCORE
        if (DataManager.instance.power <= 0) {
            ToastManager.instance.show('能量已用完, 请先补充能量', { gravity: 'TOP', bg_color: color(226, 69, 109, 255) })
        } else {
            DataManager.instance.power -= 1
            DataManager.instance.save()
            StaticInstance.transitionsManager.play(ENUM_UI_TYPE.MENU, ENUM_UI_TYPE.MAIN, () => {
                StaticInstance.gameManager.onGameLevelStart()
            })
        }
    }

    onStartLevelClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        DataManager.instance.mode = ENUM_GAME_MODE.LEVEL
        StaticInstance.transitionsManager.play(ENUM_UI_TYPE.MENU, ENUM_UI_TYPE.MAIN_LEVEL, () => {
            StaticInstance.gameManager.onGameStart()
        })
    }

    onSettingClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.SETTING)
    }

    onGamesClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MORE)
    }

    onShareClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        if (SdkManager.instance.getPlatform()) {
            SdkManager.instance.activeShare()
        } else {
            ToastManager.instance.show('仅支持小游戏平台', { gravity: 'TOP', bg_color: color(226, 69, 109, 255) })
        }
    }

    onRankClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.RANK)
    }
}
