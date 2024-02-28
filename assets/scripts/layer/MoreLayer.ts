import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../Enum";
import { StaticInstance } from './../StaticInstance';
import AudioManager from "../manager/AudioManager";
import BaseLayer from "./BaseLayer";
import DataManager from "../manager/DataManager";
import PoolManager from "../manager/PoolManager";
import UIScrollControl from "../plugins/UIScrollControl";
import ResourceManager from "../manager/ResourceManager";
import SdkManager from "../manager/SdkManager";
import { _decorator, size, Node, find, ScrollView, Sprite, Label } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class MoreLayer extends BaseLayer {

    panel: Node = null
    btnClose: Node = null
    scrollNode: Node = null
    scrollItem: Node = null

    onLoad() {
        this.panel = find('style/panel', this.node)
        this.btnClose = find('btn_close', this.panel)
        this.scrollNode = find('scroll', this.panel)
        this.scrollItem = PoolManager.instance.getNode('MoreItem')
        this.btnClose.on('click', this.onCloseClick, this)
    }

    onDestroy() {
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        this.rendor()
        SdkManager.instance.toggleCustomRowAd(true)
    }

    onDisable() {
        SdkManager.instance.toggleCustomRowAd(false)
    }

    rendor() {
        const games = DataManager.instance.games
        let isScrollToTop = false
        this.scrollNode.getComponent(UIScrollControl).init(this.scrollItem, games.length, size(500, 110), 0, (node: Node, index: number) => {
            if (!isScrollToTop) {
                isScrollToTop = true
                this.scrollNode.getComponent(ScrollView).scrollToTop()
            }
            const game = games[index]
            node.getChildByName('icon').getComponent(Sprite).spriteFrame = ResourceManager.instance.getSprite(`${game.icon}`)
            node.getChildByName('title').getComponent(Label).string = `${game.title}`
            if (!node.hasEventListener('click')) {
                node.on('click', () => { this.onItemClick(game) }, this)
            } else {
                node.off('click')
                node.on('click', () => { this.onItemClick(game) }, this)
            }
        }, (scroll: ScrollView) => {
            // scroll.scrollToOffset(cc.v2(0, maxLevel * 110 - (scroll.node.height / 2)), 0.05)
            scroll.scrollToTop()
        })
    }

    onItemClick(item: any) {
        let url: string = ''
        if (typeof window['wx'] == 'undefined') {
            url = item.url
        } else {
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
            url = item.appid
        }
        if (url) SdkManager.instance.turnToApp(url)
    }

    onCloseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MORE, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU)
    }
}
