import { Canvas, Graphics, Label, Node, UIOpacity, UITransform, color, director, tween, v3 } from "cc";

export default class ToastManager {

  private static _instance: any = null

  static getInstance<T>(): T {
      if (this._instance === null) {
          this._instance = new this()
      }

      return this._instance
  }

  static get instance() {
      return this.getInstance<ToastManager>()
  }

  show(text: string = '', {gravity = 'CENTER', duration = 1, bg_color = color(102, 102, 102, 200)} = {}){
      // canvas
      let canvas = director.getScene().getComponentInChildren(Canvas);
      const canvasTransition = canvas.getComponent(UITransform)
      let width = canvasTransition.width;
      let height = canvasTransition.height;

      // 节点
      let bgNode = new Node();
      bgNode.layer = 0

      // Lable文本格式设置
      let textNode = new Node(); 
      let textLabel = textNode.addComponent(Label);
      let textTransition = textNode.getComponent(UITransform)
      textLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
      textLabel.verticalAlign = Label.VerticalAlign.CENTER;
      textLabel.fontSize = 30;
      textLabel.string = text;

      // 当文本宽度过长时，设置为自动换行格式
      if (text.length * textLabel.fontSize > (width * 3) / 5) {
        textTransition.width = (width * 3) / 5;
        textLabel.overflow = Label.Overflow.RESIZE_HEIGHT;
      } else {
        textTransition.width = text.length * textLabel.fontSize;
      }
      let lineCount =
          ~~((text.length * textLabel.fontSize) / ((width * 3) / 5)) + 1;
          textTransition.height = textLabel.fontSize * lineCount;

      // 背景设置
      let ctx = bgNode.addComponent(Graphics);
      ctx.arc(
          -textTransition.width / 2,
          0,
          textTransition.height / 2 + 20,
          0.5 * Math.PI,
          1.5 * Math.PI,
          true
      );
      ctx.lineTo(textTransition.width / 2, -(textTransition.height / 2 + 20));
      ctx.arc(
          textTransition.width / 2,
          0,
          textTransition.height / 2 + 20,
          1.5 * Math.PI,
          0.5 * Math.PI,
          true
      );
      ctx.lineTo(-textTransition.width / 2, textTransition.height / 2 + 20);
      ctx.fillColor = bg_color;
      ctx.fill();

      bgNode.addChild(textNode);

      // gravity 设置Toast显示的位置
      if (gravity === "CENTER") {
        bgNode.setPosition(v3(0, 0, 0))
      } else if (gravity === "TOP") {
        bgNode.setPosition(v3(bgNode.position.x, bgNode.position.y + (height / 5) * 2, 0))
      } else if (gravity === "BOTTOM") {
        bgNode.setPosition(v3(bgNode.position.x, bgNode.position.y - (height / 5) * 2, 0))
      }

      canvas.node.addChild(bgNode);
      // 执行动画
      let finished = function() {
          bgNode.destroy();
      };
      const fadeOut = tween(bgNode.getComponent(UIOpacity)).to(0.3, {opacity: 0})
      // const action0 = tween(bgNode).to(duration, {position: v3(0, 0,0)})
      // bgNode.runAction(action); 
      fadeOut.start().call(finished)
  }
}
