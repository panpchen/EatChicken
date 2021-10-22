// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { IObstacle, OBSTACLE_TYPE } from "./Constants";
import Game from "./Game";
import { PlayerData } from "./GameData";
import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Obstacle extends cc.Component {
  @property(cc.Sprite)
  sp: cc.Sprite = null;
  @property(cc.SpriteAtlas)
  atals: cc.SpriteAtlas = null;
  private _data: IObstacle = null;

  init(data: IObstacle) {
    this._data = data;
    cc.error("障碍物类型：", data);
  }

  update(dt) {
    this.node.y += this._data.speed;

    const players = Game.instance.playerManager.node.children;
    for (let i = 0, len = players.length; i < len; i++) {
      const p = players[i];
      const pWorldPos = p.parent.convertToWorldSpaceAR(p.position);
      const pLocalPos = this.node.parent.convertToNodeSpaceAR(pWorldPos);
      if (
        pLocalPos.x >= this.node.x - this.node.width / 2 &&
        pLocalPos.x <= this.node.x + this.node.width / 2 &&
        pLocalPos.y >= this.node.y - this.node.height / 2 + 120 &&
        pLocalPos.y <= this.node.y + this.node.height / 2 - 120
      ) {
        const player = p.getComponent(Player);
        if (player.getData().uname == PlayerData.uname) {
          player.scaleToZero();
        }
      }
    }

    if (this.node.y - this.node.height / 2 > cc.winSize.height) {
      cc.error("销毁障碍");
      this.node.destroy();
    }
  }
}
