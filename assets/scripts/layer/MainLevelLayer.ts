import { Label, Node, _decorator, color, find } from "cc";
import { ENUM_AUDIO_CLIP, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../Enum";
import AudioManager from "../manager/AudioManager";
import DataManager from "../manager/DataManager";
import SdkManager from "../manager/SdkManager";
import ToastManager from "../manager/ToastManager";
import { StaticInstance } from "../StaticInstance";
import BaseLayer from "./BaseLayer";

const { ccclass, property } = _decorator;

@ccclass
export default class MainLevelLayer extends BaseLayer {

    btnPause: Node = null
    btnShuffle: Node = null
    btnTip: Node = null
    levelNum: Node = null

    onLoad() {
        this.btnPause = find('btn_pause', this.node)
        this.btnPause.on('click', this.onPauseClick, this)
        this.btnShuffle = find('skills/btn_shuffle', this.node)
        this.btnShuffle.on('click', this.onShuffleClick, this)
        this.btnTip = find('skills/btn_tip', this.node)
        this.btnTip.on('click', this.onTipClick, this)
        this.levelNum = find('bar_level/nums', this.node)
    }

    onDestroy() {
        this.btnPause.off('click', this.onPauseClick, this)
        this.btnShuffle.off('click', this.onShuffleClick, this)
        this.btnTip.off('click', this.onTipClick, this)
    }

    onEnable() {
        // SdkManager.instance.toggleCustomColAd(true)
    }

    onDisable() {
        // SdkManager.instance.toggleCustomColAd(false)
    }

    rendorLevel() {
        this.levelNum.getComponent(Label).string = `${DataManager.instance.levelCount}`
    }

    onPauseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT_LEVEL)
        DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
    }

    onShuffleClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        if (DataManager.instance.isShuffling || DataManager.instance.activeChesses || DataManager.instance.isTouching || DataManager.instance.isChecking) return
        if (DataManager.instance.keys > 0) {
            DataManager.instance.keys -= 1
            DataManager.instance.save()
            StaticInstance.gameManager.onShuffle()
        } else {
            SdkManager.instance.showVideoAd((msg: string) => {
                if (!SdkManager.instance.getPlatform()) {
                    ToastManager.instance.show(msg, { gravity: 'TOP', bg_color: color(102, 202, 28, 255) })
                }
                StaticInstance.gameManager.onShuffle()
            }, (msg: string) => {
                ToastManager.instance.show(msg, { gravity: 'TOP', bg_color: color(226, 69, 109, 255) })
            })
        }
    }

    onTipClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        if (DataManager.instance.tipChesses.length || DataManager.instance.isShuffling || DataManager.instance.activeChesses || DataManager.instance.isTouching || DataManager.instance.isChecking) return
        SdkManager.instance.showVideoAd((msg: string) => {
            if (!SdkManager.instance.getPlatform()) {
                ToastManager.instance.show(msg, { gravity: 'TOP', bg_color: color(102, 202, 28, 255) })
            }
            StaticInstance.gameManager.onTip()
        }, (msg: string) => {
            ToastManager.instance.show(msg, { gravity: 'TOP', bg_color: color(226, 69, 109, 255) })
        })
    }
}
