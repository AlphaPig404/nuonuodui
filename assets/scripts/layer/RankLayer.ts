import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../Enum";
import BaseLayer from "./BaseLayer";
import AudioManager from "../manager/AudioManager";
import SdkManager from "../manager/SdkManager";
import { StaticInstance } from './../StaticInstance';
import ToastManager from "../manager/ToastManager";
import { _decorator, Node, find, color } from "cc";
 
const { ccclass, property } = _decorator;
 
@ccclass
export default class RankLayer extends BaseLayer {
 
    panel: Node = null
    btnClose: Node = null
    btnShare: Node = null
 
    onLoad() {
        this.panel = find('style/panel', this.node)
        this.btnClose = find('btn_close', this.panel)
        this.btnShare = find('btn_share', this.panel)
        this.btnClose.on('click', this.onCloseClick, this)
        this.btnShare.on('click', this.onShareClick, this)
    }
 
    onDestroy() {
        this.btnClose.off('click', this.onCloseClick, this)
        this.btnShare.off('click', this.onShareClick, this)
    }
 
    onEnable() {
        this.zoomIn(this.panel)
        // 读取排行榜数据
        SdkManager.instance.getRank()
        SdkManager.instance.showInterstitialAd()
        SdkManager.instance.toggleBannerAd(true)
    }
 
    onDisable() {
        SdkManager.instance.toggleBannerAd(false)
    }
 
    onCloseClick(e: any) {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.RANK, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU)
    }
 
    onShareClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        if (SdkManager.instance.getPlatform()) {
            SdkManager.instance.activeShare()
        } else {
            ToastManager.instance.show('仅支持小游戏平台', { gravity: 'TOP', bg_color: color(226, 69, 109, 255) })
        }
    }
}