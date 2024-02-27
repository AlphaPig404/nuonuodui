import { Component, Node, _decorator, tween, v3 } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class BaseLayer extends Component {

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    zoomIn(node: Node, scale: number = 1.5, speed: number = 0.3) {
        node.setScale(v3(scale, scale, 1))
        tween(node).to(speed, {scale: v3(1, 1, 1)}).start()
    }

    zoomOut(node: Node, scale: number = 0.5, speed: number = 0.3) {
        node.setScale(v3(scale, scale, 1))
        tween(node).to(speed, {scale: v3(1, 1, 1)}).start()
    }
}
