import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from './../StaticInstance';
import AudioManager from "../manager/AudioManager";
import BaseLayer from "./BaseLayer";
import SdkManager from "../manager/SdkManager";
import ToastManager from "../manager/ToastManager";
import DataManager from "../manager/DataManager";
import { _decorator, Node, find, Label, ParticleSystem2D, color } from 'cc'

const { ccclass, property } = _decorator;

@ccclass
export default class OverLayer extends BaseLayer {

    panel: Node = null
    btnRestart: Node = null
    btnShare: Node = null
    scoreNode: Node = null
    noticeNode: Node = null
    particles: Node = null
    btnClose: Node = null

    onLoad() {
        this.panel = find('style/panel', this.node)
        this.btnRestart = find('buttons/btn_restart', this.panel)
        this.btnShare = find('buttons/btn_share', this.panel)
        this.btnRestart.on('click', this.onRestartClick, this)
        this.btnShare.on('click', this.onShareClick, this)
        this.scoreNode = find('score', this.panel)
        this.noticeNode = find('notice', this.panel)
        this.particles = find('particles', this.panel)
        this.btnClose = find('btn_close', this.panel)
        this.btnClose.on('click', this.onCloseClick, this)
    }

    onDestroy() {
        this.btnRestart.off('click', this.onRestartClick, this)
        this.btnShare.off('click', this.onShareClick, this)
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        // 关闭combo计时器
        StaticInstance.uiManager.setMainComboTimerStop()
        this.rendorScore()
        SdkManager.instance.showInterstitialAd()
        SdkManager.instance.toggleBannerAd(true)
    }

    onDisable() {
        SdkManager.instance.toggleBannerAd(false)
    }

    rendorScore() {
        this.scoreNode.getComponent(Label).string = `${DataManager.instance.score}`
        if (DataManager.instance.score > DataManager.instance.scoreMax) {
            // 刷新纪录
            DataManager.instance.scoreMax = DataManager.instance.score
            DataManager.instance.save()
            // 计入排行榜
            SdkManager.instance.setRank(DataManager.instance.scoreMax)
            // 特效
            this.noticeNode.active = true
            this.particles.children.forEach(node => {
                node.getComponent(ParticleSystem2D).resetSystem()
            })
        } else {
            this.noticeNode.active = false
        }
    }

    onRestartClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.transitionsManager.play(ENUM_UI_TYPE.OVER, null, () => {
            StaticInstance.gameManager.onGameStart()
        })
    }

    onShareClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        if (SdkManager.instance.getPlatform()) {
            SdkManager.instance.activeShare()
        } else {
            ToastManager.instance.show('仅支持小游戏平台', { gravity: 'TOP', bg_color: color(226, 69, 109, 255) })
        }
    }

    onCloseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MAIN, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.OVER, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU)
    }
}
