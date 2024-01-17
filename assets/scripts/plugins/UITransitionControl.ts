import { StaticInstance } from '../StaticInstance';
import { ENUM_UI_TYPE } from '../Enum';
import { Component, Mask, Node, UIOpacity, UITransform, _decorator, math, tween, v3 } from 'cc';

const {ccclass, property} = _decorator;

@ccclass
export default class UITransitionControl extends Component {

    @property
    transitionTime: number = 0.3

    mask: Mask = null
    img: Node = null
    scale: number = 0
    imgOpacity: UIOpacity
    
    protected onLoad(): void {
        StaticInstance.setTransitionManager(this)

        const winSize = screen;
        this.mask = this.node.getComponent(Mask)
        this.img = this.node.getChildByName('img')
        this.imgOpacity = this.img.addComponent(UIOpacity)
        const transform = this.img.getComponent(UITransform)
        transform.setContentSize(math.size(winSize.width, winSize.height))

        const size = Math.max(winSize.width, winSize.height)
        this.scale = size / transform.width
        this.node.setScale(v3(this.scale,this.scale,0))
    }

    play(from: ENUM_UI_TYPE = null, to: ENUM_UI_TYPE = null, changed?: () => void, finished?: () => void){
        this.imgOpacity.opacity = 255
        const _tween = tween(this.node)
        const act1 = _tween.to(this.transitionTime, {scale: v3(1, 1, 0)})
        const act2 = _tween.call(()=>{
            if (from) StaticInstance.uiManager.toggle(from, false)
            if (to) StaticInstance.uiManager.toggle(to)
            changed && changed()
        })
        const act3 = _tween.to(this.transitionTime, {scale: v3(this.scale,this.scale, 0)})
        const act4 = tween.call(()=>{
            this.imgOpacity.opacity = 0
            finished && finished()
        })
        tween(this.node).sequence(act1, act2, act3, act4).start()
    }

    onStart(from: ENUM_UI_TYPE = null, to: ENUM_UI_TYPE = null, callback?: () => void){
        this.imgOpacity.opacity = 255
        const _tween = tween(this.node)
        const act1 = _tween.to(this.transitionTime, {scale: v3(1, 1, 0)})
        const act2 = _tween.call(()=>{
            this.mask.enabled = false
            if (from) StaticInstance.uiManager.toggle(from, false)
            if (to) StaticInstance.uiManager.toggle(to)
            callback && callback()
        })
        _tween.sequence(act1, act2).start()
    }

    onEnd(){
        this.scheduleOnce(()=>{
            this.mask.enabled = true
            const _tween = tween(this.node)
            const act1 = _tween.to(this.transitionTime, {scale: v3(1, 1, 0)})
            const act2 = _tween.call(()=>{
                this.imgOpacity.opacity = 0
            })
            _tween.sequence(act1, act2).start()
        })
    }
}
