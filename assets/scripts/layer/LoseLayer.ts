import { ENUM_AUDIO_CLIP, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from './../StaticInstance';
import AudioManager from "../manager/AudioManager";
import BaseLayer from "./BaseLayer";
import DataManager from "../manager/DataManager";
import SdkManager from "../manager/SdkManager";
import ToastManager from "../manager/ToastManager";
import { Node, _decorator, color, find } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class ExitLayer extends BaseLayer {

    panel: Node = null
    btnRevive: Node = null
    btnRestart: Node = null

    onLoad() {
        this.panel = find('style/panel', this.node)
        this.btnRevive = find('buttons/btn_revive', this.panel)
        this.btnRestart = find('buttons/btn_restart', this.panel)
        this.btnRevive.on('click', this.onReviveClick, this)
        this.btnRestart.on('click', this.onRestartClick, this)
    }

    onDestroy() {
        this.btnRevive.off('click', this.onReviveClick, this)
        this.btnRestart.off('click', this.onRestartClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        SdkManager.instance.toggleCustomRowAd(true)
    }

    onDisable() {
        SdkManager.instance.toggleCustomRowAd(false)
    }

    onRestartClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.transitionsManager.play(ENUM_UI_TYPE.LOSE, null, () => {
            StaticInstance.gameManager.onGameLevelStart()
        })
    }

    onReviveClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        SdkManager.instance.showVideoAd((msg: string) => {
            if (!SdkManager.instance.getPlatform()) {
                ToastManager.instance.show(msg, { gravity: 'TOP', bg_color: color(102, 202, 28, 255) })
            }
            // 洗牌
            while (!StaticInstance.gameManager.onShuffleCheck()) {
                StaticInstance.gameManager.onShuffle(false)
            }
            StaticInstance.uiManager.toggle(ENUM_UI_TYPE.LOSE, false)
        }, (msg: string) => {
            ToastManager.instance.show('中断视频，复活失败', { gravity: 'TOP', bg_color: color(226, 69, 109, 255) })
        })
    }
}
