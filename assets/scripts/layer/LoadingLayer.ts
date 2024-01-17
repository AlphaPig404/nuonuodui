import { ENUM_UI_TYPE } from "../Enum";
import DataManager from "../manager/DataManager";
import BaseLayer from "./BaseLayer";
import { StaticInstance } from "../StaticInstance";
import { Sprite, _decorator } from "cc";

const {ccclass, property} = _decorator;

@ccclass
export default class LoadingLayer extends BaseLayer {

    @property(Sprite)
    loadfill: Sprite = null

    onEnable(){}

    onDisable(){}

    update(dt: number) {
        if(this.loadfill && this.node.active) {
            this.loadfill.fillRange = DataManager.instance.loadingRate
            if(DataManager.instance.loadingRate >= 1){
                // menu已加载完毕
                if(StaticInstance.uiManager.isActive(ENUM_UI_TYPE.MENU)){
                    this.hide()
                }
            }
        }
    }
}
