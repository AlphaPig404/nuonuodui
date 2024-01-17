import { CCFloat, CCInteger, Component, Enum, Node, Rect, Size, UITransform, _decorator, v2, v3 } from "cc";
import { accNodePositionX, accNodePositionY, getNodeAnchorPoint, getNodeAnchorX, getNodeAnchorY, getNodeContentSize, getNodeHeight, getNodeWidth, mulNodePositionX, mulNodePositionY, setNodePositionX, setNodePositionY } from "../Utils";

const { ccclass, property } = _decorator;

@ccclass
export default class UIScrollLoopControl extends Component {

    @property({ type: Enum({ Horizontal: 0, Vertical: 1, }) })
    _direction: number = 0
    @property({ type: Enum({ Horizontal: 0, Vertical: 1, }), tooltip: '方向' })
    get direction() {
        return this._direction;
    }
    set direction(value) {
        this._direction = value;
        this._initItemPos();
    }

    @property({ type: CCInteger, tooltip: 'node 间隔' })
    itemOffset: number = 0
    @property({ type: CCInteger, tooltip: '移动速度' })
    speed: number = 500
    @property({ type: CCFloat, tooltip: '减速频率' })
    rub: number = 1.0
    @property({ type: CCFloat, tooltip: '缩放最小值' })
    scaleMin: number = 1
    @property({ type: CCFloat, tooltip: '缩放最大值' })
    scaleMax: number = 1

    @property({ type: [Node] })
    _item: Node[] = []
    @property({ type: [Node], tooltip: '卡片节点' })
    get item() {
        return this._item;
    }
    set item(value) {
        this._item = value;
        this._initItemPos();
    }

    @property({ type: CCInteger })
    _offset: number = 0
    @property({ type: CCInteger, tooltip: '偏移量' })
    get offset() {
        return this._offset;
    }
    set offset(value) {
        this._offset = value;
        this._initItemPos();
    }

    _startTime: number = 0
    _moveSpeed: number = 0
    _maxSize: Size = null
    _screenRect: Rect = null
    itemList: Node[] = []

    protected onLoad(): void {
        this.init()
    }

    init() {
        this._initItemPos();
        this.updateScale();
        // this.node.on('touchstart', function (event) {
        //     this._moveSpeed = 0;
        //     this._startTime = new Date().getTime();
        // }.bind(this));

        // this.node.on('touchmove', function (event) {
        //     var movePos = event.getDelta();
        //     this.itemMoveBy(movePos);
        // }.bind(this));

        // this.node.on('touchend', function (event) {
        //     this.touchEnd(event)
        // }.bind(this));

        // this.node.on('touchcancel', function (event) {
        //     this.touchEnd(event)
        // }.bind(this));
    }

    touchEnd(event) {
        var curpos = event.getLocation();
        var startpos = event.getStartLocation();

        var dis;
        if (this.direction == 0) {
            dis = startpos.x - curpos.x;

        } else {
            dis = startpos.y - curpos.y;
        }

        var curTime = new Date().getTime();
        var disTime = curTime - this._startTime;
        //v = s/t
        this._moveSpeed = dis / disTime;
    }

    _initItemPos() {
        
        this.node.getComponent(UITransform).setAnchorPoint(v2(0.5, 0.5))
        this._maxSize = new Size(0, 0);
        for (let i = 0; i < this.item.length; i++) {
            this._maxSize.width += this.item[i].getComponent(UITransform).width;
            this._maxSize.height += this.item[i].getComponent(UITransform).height;
            this._maxSize.width += this.itemOffset;
            this._maxSize.height += this.itemOffset;
        }
        var startPos;
        if (this.direction == 0) {
            startPos = v2(-this._maxSize.width * getNodeAnchorX(this.node), -this._maxSize.height * getNodeAnchorY(this.node));
        } else {
            startPos = v2(this._maxSize.width * getNodeAnchorX(this.node), this._maxSize.height * getNodeAnchorY(this.node));
        }
        this._screenRect = new Rect(startPos.x, startPos.y, this._maxSize.width, this._maxSize.height);
        this.itemList = [];
        for (let i = 0; i < this.item.length; i++) {
            var anchor = getNodeAnchorPoint(this.item[i]);
            var itemSize = getNodeContentSize(this.item[i]);

            if (this.direction == 0) {
                startPos.addSelf(v2(itemSize.width * anchor.x, itemSize.height * anchor.y));
                this.item[i].setPosition(v3(startPos.x + this.offset, 0 , 0))
                // log('x:'+startPos.x);
   
                startPos.addSelf(v2(itemSize.width * anchor.x, itemSize.height * anchor.y));
                startPos.addSelf(v2(this.itemOffset, this.itemOffset));
            } else {
                startPos.subSelf(v2(itemSize.width * anchor.x, itemSize.height * anchor.y));
                this.item[i].setPosition(v3(0+ this.offset, startPos.y + this.offset, 0))
                startPos.subSelf(v2(itemSize.width * anchor.x, itemSize.height * anchor.y));
                startPos.subSelf(v2(this.itemOffset, this.itemOffset));
            }
            this.itemList[i] = this.item[i];
        }

    }

    itemMoveBy(pos) {
        for (let i = 0; i < this.item.length; i++) {
            if (this.direction == 0) {
              accNodePositionX(this.item[i], pos.x)
            } else {
              accNodePositionY(this.item[i], pos.y)
            }
        }
        this.updatePos();
    }

    updatePos() {

        var startItem = this.itemList[0];
        var endItem = this.itemList[this.itemList.length - 1];

        var startout = false;
        if (this.direction == 0) {
            if (startItem.position.x < -this._maxSize.width / 2) {
                startout = true;
            }
        } else {
            if (startItem.position.y > this._maxSize.width / 2) {
                startout = true;
            }
        }

        //left
        if (startout) {
            var item = this.itemList.shift();
            this.itemList.push(item);

            if (this.direction == 0) {
              item.setPosition(v3(endItem.position.x + getNodeWidth(endItem) + this.itemOffset, item.position.y, 0))
            } else {
              item.setPosition(v3(item.position.x, endItem.position.y - getNodeHeight(endItem)- this.itemOffset, 0))
            }
        }

        var endout = false;
        if (this.direction == 0) {
            if (endItem.position.x > this._maxSize.width / 2) {
                endout = true;
            }
        } else {
            if (endItem.position.y < -this._maxSize.height / 2) {
                endout = true;
            }
        }

        //right
        if (endout) {
            var item = this.itemList.pop();
            this.itemList.unshift(item);

            if (this.direction == 0) {
              setNodePositionX(item, startItem.position.x - getNodeWidth(startItem) - this.itemOffset)
            } else {
              setNodePositionY(item, startItem.position.y + getNodeHeight(startItem) + this.itemOffset)
            }
        }

        this.updateScale();
    }

    updateScale() {
        if (this.scaleMax < this.scaleMin || this.scaleMax == 0) {
            return;
        }
        for (let i = 0; i < this.item.length; i++) {

            var pre;
            if (this.direction == 0) {
                var x = this.item[i].position.x + this._maxSize.width / 2;
                if (this.item[i].position.x < 0) {
                    pre = x / this._maxSize.width;
                }
                else {
                    pre = 1 - x / this._maxSize.width;
                }

            } else {
                var y = this.item[i].position.y + this._maxSize.height / 2;
                if (this.item[i].position.y < 0) {
                    pre = y / this._maxSize.height;
                }
                else {
                    pre = 1 - y / this._maxSize.height;
                }
            }
            pre *= 2;
            var scaleTo = this.scaleMax - this.scaleMin;
            scaleTo *= pre;
            scaleTo += this.scaleMin;
            scaleTo = Math.abs(scaleTo);
            this.item[i].setScale(v3(scaleTo, scaleTo, 0))
        }
    }

    update(dt) {
        if (this._moveSpeed == 0) return;
        for (let i = 0; i < this.item.length; i++) {

            if (this.direction == 0) {
              mulNodePositionX(this.item[i], this._moveSpeed * dt * this.speed)
            } else {
              mulNodePositionY(this.item[i], this._moveSpeed * dt * this.speed)
            }
        }
        if (this._moveSpeed > 0) {
            this._moveSpeed -= dt * this.rub;
            if (this._moveSpeed < 0) {
                this._moveSpeed = 0;
            }
        } else {
            this._moveSpeed += dt * this.rub;
            if (this._moveSpeed > 0) {
                this._moveSpeed = 0;
            }
        }
        var moveTo = -this._moveSpeed * dt * this.speed;
        this.itemMoveBy(v2(moveTo, moveTo))
        this.updatePos();
    }
}
