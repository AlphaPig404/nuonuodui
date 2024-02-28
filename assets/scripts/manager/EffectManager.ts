import { Node, Animation, ParticleSystem2D, AnimationState } from "cc";
import PoolManager from "./PoolManager";
 
export default class EffectManager {
    public static _instance: EffectManager = null
 
    public static get instance() {
        if (null == this._instance) {
            this._instance = new EffectManager();
        }
        return this._instance
    }
 
    play(effect: string, parent: Node, options?: any) {
        const effNode = PoolManager.instance.getNode(`${effect}`, parent)
        if (options) {
            options.pos && effNode.setPosition(options.pos)
        }
        if (effNode.getComponent(Animation)) {
            const anim = effNode.getComponent(Animation)
            // anim.on('finished', () => {
            //     effNode.removeFromParent()
            // })
            
            anim.play()
        } else if (effNode.getComponent(ParticleSystem2D)) {
            effNode.getComponent(ParticleSystem2D).resetSystem()
        }
    }
}