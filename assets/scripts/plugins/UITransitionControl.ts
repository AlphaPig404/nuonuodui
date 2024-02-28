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
        this.imgOpacity = this.img.getComponent(UIOpacity)
        const transform = this.node.getComponent(UITransform)
        const imgTransform = this.img.getComponent(UITransform)
        imgTransform.setContentSize(math.size(winSize.width, winSize.height))

        const size = Math.max(winSize.width, winSize.height)
        this.scale = size * 2 / transform.width
        console.log('log:::this.scale', this.scale, size, winSize)
        this.node.setScale(v3(this.scale, this.scale))
    }

    play(from: ENUM_UI_TYPE = null, to: ENUM_UI_TYPE = null, changed?: () => void, finished?: () => void){
        this.imgOpacity.opacity = 0
        tween(this.node).to(this.transitionTime, {scale: v3(1, 1, 1)}).call(()=>{
              if (from) StaticInstance.uiManager.toggle(from, false)
              if (to) StaticInstance.uiManager.toggle(to)
              changed && changed()
          }).to(this.transitionTime, {scale: v3(this.scale, this.scale, 1)}).call(()=>{
              this.imgOpacity.opacity = 0
              finished && finished()
          }).start()
    }

    onStart(from: ENUM_UI_TYPE = null, to: ENUM_UI_TYPE = null, callback?: () => void){
        this.imgOpacity.opacity = 255
        const _tween = tween(this.node)
        _tween.to(this.transitionTime, {scale: v3(1, 1, 1)}).call(()=>{
          this.mask.enabled = false
          if (from) StaticInstance.uiManager.toggle(from, false)
          if (to) StaticInstance.uiManager.toggle(to)
          callback && callback()
        }).start()
    }

    onEnd(){
        this.scheduleOnce(()=>{
            tween(this.node).to(this.transitionTime, {scale: v3(1, 1, 1)}).call(()=>{
                this.imgOpacity.opacity = 0
            }).start()
        })
    }
}
