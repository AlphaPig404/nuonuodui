import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from './../StaticInstance';
import AudioManager from "../manager/AudioManager";
import BaseLayer from "./BaseLayer";
import SdkManager from "../manager/SdkManager";
import ToastManager from "../manager/ToastManager";
import DataManager, { LEVEL_TIPS } from "../manager/DataManager";
import { _decorator, find, Node, ParticleSystem2D, Label, color} from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class WinLayer extends BaseLayer {

    panel: Node = null
    btnNext: Node = null
    btnShare: Node = null
    particles: Node = null
    btnClose: Node = null
    tipLabel: Node = null

    onLoad() {
        this.panel = find('style/panel', this.node)
        this.btnNext = find('buttons/btn_next', this.panel)
        this.btnShare = find('buttons/btn_share', this.panel)
        this.btnNext.on('click', this.onNextClick, this)
        this.btnShare.on('click', this.onShareClick, this)
        this.particles = find('particles', this.panel)
        this.btnClose = find('btn_close', this.panel)
        this.btnClose.on('click', this.onCloseClick, this)
        this.tipLabel = find('tip', this.panel)
    }

    onDestroy() {
        this.btnNext.off('click', this.onNextClick, this)
        this.btnShare.off('click', this.onShareClick, this)
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        this.rendorTip()
        SdkManager.instance.showInterstitialAd()
        SdkManager.instance.toggleBannerAd(true)
    }

    onDisable() {
        SdkManager.instance.toggleBannerAd(false)
    }

    rendorTip() {
        this.particles.children.forEach(node => {
            node.getComponent(ParticleSystem2D).resetSystem()
        })
        let tip = LEVEL_TIPS[0]
        if (DataManager.instance.levelCount > 2 && DataManager.instance.levelCount < 10) {
            tip = LEVEL_TIPS[1]
        } else if (DataManager.instance.levelCount >= 10 && DataManager.instance.levelCount < 50) {
            tip = LEVEL_TIPS[2]
        } else if (DataManager.instance.levelCount >= 50 && DataManager.instance.levelCount < 100) {
            tip = LEVEL_TIPS[3]
        } else if (DataManager.instance.levelCount >= 100 && DataManager.instance.levelCount < 180) {
            tip = LEVEL_TIPS[4]
        } else if (DataManager.instance.levelCount >= 180 && DataManager.instance.levelCount < 1000) {
            tip = LEVEL_TIPS[5]
        } else if (DataManager.instance.levelCount >= 1000) {
            tip = LEVEL_TIPS[6]
        }
        this.tipLabel.getComponent(Label).string = `${tip}`
    }

    onNextClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.transitionsManager.play(ENUM_UI_TYPE.WIN, null, () => {
            StaticInstance.gameManager.onGameLevelStart()
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
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MAIN_LEVEL, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.WIN, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU)
    }
}
