import { Label, Node, ParticleSystem, ParticleSystem2D, Tween, UIOpacity, _decorator, color, find, tween, v3 } from "cc";
import { ENUM_AUDIO_CLIP, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../Enum";
import AudioManager from "../manager/AudioManager";
import DataManager from "../manager/DataManager";
import SdkManager from "../manager/SdkManager";
import ToastManager from "../manager/ToastManager";
import { StaticInstance } from "../StaticInstance";
import BaseLayer from "./BaseLayer";

const { ccclass, property } = _decorator;

@ccclass
export default class MainLayer extends BaseLayer {

    btnPause: Node = null
    btnShuffle: Node = null
    btnTip: Node = null
    levelUpNode: Node = null
    scoreNode: Node = null
    particle: Node = null
    comboTimer: Node = null
    comboTimerNum: Node = null
    comboTimerNumOpacity: UIOpacity

    onLoad() {
        this.btnPause = find('btn_pause', this.node)
        this.btnPause.on('click', this.onPauseClick, this)
        this.btnShuffle = find('skills/btn_shuffle', this.node)
        this.btnShuffle.on('click', this.onShuffleClick, this)
        this.btnTip = find('skills/btn_tip', this.node)
        this.btnTip.on('click', this.onTipClick, this)
        this.levelUpNode = find('level_up', this.node)
        this.scoreNode = find('bar_score/nums', this.node)
        this.particle = find('bar_score/particle', this.node)
        this.comboTimer = find('combo_timer', this.node)
        this.comboTimerNum = find('timer/nums', this.comboTimer)
        this.comboTimerNumOpacity = this.comboTimerNum.getComponent(UIOpacity)
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

    onPauseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT)
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

    setLevelUpNotice() {
        Tween.stopAllByTarget(this.levelUpNode)
        const _tween = tween(this.levelUpNode)
        this.levelUpNode.setPosition(v3(600, this.levelUpNode.position.y, 0))
        const act1 = _tween.to(0.5, {position: v3(0, this.levelUpNode.position.y, 0)})
        const act2 = _tween.delay(1)
        const act3 = _tween.to(0.5, {position: v3(-600, this.levelUpNode.position.y, 0)})
        tween(this.levelUpNode).sequence(act1, act2, act3).start()
    }

    setScoreNum(isInit: boolean) {
        const scoreLabel = this.scoreNode.getComponent(Label)
        const comboLabel = this.comboTimerNum.getComponent(Label)
        if (isInit) {
            scoreLabel.string = `${DataManager.instance.score}`
            this.comboTimerNumOpacity.opacity = 0
            comboLabel.unscheduleAllCallbacks()
        } else {
            this.particle.getComponent(ParticleSystem2D).resetSystem()
            scoreLabel.string = `${DataManager.instance.score}`
            // 开启连接加成倒计时
            this.comboTimerNumOpacity.opacity = 255
            comboLabel.unscheduleAllCallbacks()
            comboLabel.string = `${DataManager.instance.scoreComboDuration}`
            DataManager.instance.scoreComboTime = DataManager.instance.scoreComboDuration
            comboLabel.schedule(() => {
                let num = parseInt(comboLabel.string)
                num -= 1
                if (num <= 0) {
                    num = 0
                    comboLabel.unscheduleAllCallbacks()
                    this.comboTimerNumOpacity.opacity = 0
                }
                DataManager.instance.scoreComboTime = num
                comboLabel.string = `${num}`
            }, 1)
        }
    }

    setComboTimerStop() {
        this.comboTimerNum.getComponent(Label).unscheduleAllCallbacks()
        this.comboTimerNumOpacity.opacity = 0
    }
}
