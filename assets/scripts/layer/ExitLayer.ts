import { ENUM_AUDIO_CLIP, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from './../StaticInstance';
import AudioManager from "../manager/AudioManager";
import BaseLayer from "./BaseLayer";
import DataManager from "../manager/DataManager";
import SdkManager from "../manager/SdkManager";
import { Node, _decorator, find } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class ExitLayer extends BaseLayer {

    panel: Node = null
    btnSubmit: Node = null
    btnClose: Node = null

    onLoad() {
        this.panel = find('style/panel', this.node)
        this.btnSubmit = find('btn_submit', this.panel)
        this.btnClose = find('btn_close', this.panel)
        this.btnSubmit.on('click', this.onSubmitClick, this)
        this.btnClose.on('click', this.onCloseClick, this)
    }

    onDestroy() {
        this.btnSubmit.off('click', this.onSubmitClick, this)
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        SdkManager.instance.toggleCustomRowAd(true)
    }

    onDisable() {
        SdkManager.instance.toggleCustomRowAd(false)
    }

    onCloseClick() {
      console.log('log:::onCloseClick')
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT, false)
    }

    onSubmitClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        // 中途退出进入结算
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.LOSE)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.OVER)
    }
}
