import { ENUM_UI_TYPE } from './../Enum';
import { StaticInstance } from './../StaticInstance';
import BaseLayer from '../layer/BaseLayer';
import PoolManager from './PoolManager';
import MainLayer from '../layer/MainLayer';
import MainLevelLayer from '../layer/MainLevelLayer';
import { Component, Node, _decorator } from 'cc';

const { ccclass, property } = _decorator;

@ccclass
export default class UIManager extends Component {

    private uiMap = new Map<ENUM_UI_TYPE, BaseLayer>()

    protected onLoad(): void {
        StaticInstance.setUIManager(this)
        console.log('log:::UIManager', 'onLoad')
    }

    init() {
       console.log('log:::UIManager', 'init')
        for (let type in ENUM_UI_TYPE) {
            const node: Node = PoolManager.instance.getNode(ENUM_UI_TYPE[type], this.node)
            if (node && !this.uiMap.has(ENUM_UI_TYPE[type])) {
                node.active = false
                node.addComponent(ENUM_UI_TYPE[type])
                this.uiMap.set(ENUM_UI_TYPE[type], node.getComponent(ENUM_UI_TYPE[type]))
            }
        }
    }

    toggle(key: ENUM_UI_TYPE, status: boolean = true, callback?: () => void) {
        if (this.uiMap.has(key)) {
            const layer = this.uiMap.get(key)
            status ? layer.show() : layer.hide()
            console.log('log:::layer', layer, status, layer.node.active)
            callback && callback()
        }
    }

    isActive(key: ENUM_UI_TYPE) {
        if (this.uiMap.has(key)) {
            return this.uiMap.get(key).node.active
        }
        return false
    }

    getActiveTypes() {
        const types: ENUM_UI_TYPE[] = []
        this.uiMap.forEach((layer: BaseLayer, type: ENUM_UI_TYPE) => {
            if (this.isActive(type)) types.push(type)
        })
        return types
    }

    setMainLevelUpNotice() {
        const layer: MainLayer = this.uiMap.get(ENUM_UI_TYPE.MAIN) as MainLayer
        layer?.setLevelUpNotice()
    }

    setMainScoreNum(isInit: boolean = false) {
        const layer: MainLayer = this.uiMap.get(ENUM_UI_TYPE.MAIN) as MainLayer
        layer?.setScoreNum(isInit)
    }

    setMainComboTimerStop() {
        const layer: MainLayer = this.uiMap.get(ENUM_UI_TYPE.MAIN) as MainLayer
        layer?.setComboTimerStop()
    }

    rendorMainLevelNum() {
        const layer: MainLevelLayer = this.uiMap.get(ENUM_UI_TYPE.MAIN_LEVEL) as MainLevelLayer
        layer?.rendorLevel()
    }
}
