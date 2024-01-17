import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from './../StaticInstance';
import AudioManager from "../manager/AudioManager";
import BaseLayer from "./BaseLayer";
import SdkManager from "../manager/SdkManager";
import { Node, _decorator, find } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class ExitLevelLayer extends BaseLayer {

    panel: Node = null
    btnSubmit: Node = null
    btnCancel: Node = null

    onLoad() {
        this.panel = find('style/panel', this.node)
        this.btnSubmit = find('buttons/btn_submit', this.panel)
        this.btnCancel = find('buttons/btn_cancel', this.panel)
        this.btnSubmit.on('click', this.onSubmitClick, this)
        this.btnCancel.on('click', this.onCancelClick, this)
    }

    onDestroy() {
        this.btnSubmit.off('click', this.onSubmitClick, this)
        this.btnCancel.off('click', this.onCancelClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        SdkManager.instance.toggleCustomRowAd(true)
    }

    onDisable() {
        SdkManager.instance.toggleCustomRowAd(false)
    }

    onCancelClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT_LEVEL, false)
    }

    onSubmitClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MAIN_LEVEL, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT_LEVEL, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU)
    }
}
