// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { IPlayer, isSelf, PlayerData } from "./GameData";
import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerManager extends cc.Component {
  @property(cc.Prefab)
  prefab: cc.Prefab = null;

  private _allPlayers: Player[] = [];

  update() {
    for (let i = 0; i < this._allPlayers.length; i++) {
      if (this._allPlayers[i].remove) {
        this._allPlayers[i].node.destroy();
        this._allPlayers.splice(i, 1);
        break;
      }
    }
  }

  createPlayer(players) {
    for (let i = players.length - 1; i >= 0; i--) {
      for (let j = this._allPlayers.length - 1; j >= 0; j--) {
        if (players[i].uname == this._allPlayers[j].getData().uname) {
          players.splice(i, 1);
          break;
        }
      }
    }

    for (let i = 0, len = players.length; i < len; i++) {
      const player = cc.instantiate(this.prefab).getComponent(Player);
      const pData: IPlayer = players[i];
      if (isSelf(pData.uname)) {
        PlayerData.uIndex = pData.uIndex;
      }
      player.init(pData);
      player.node.parent = this.node;
      this._allPlayers.push(player);
      player.node.setSiblingIndex(0);
      player.node.setPosition(cc.v2(-400, 640));
      cc.tween(player.node)
        .to(1, { position: this._getPosByIndex(pData.uIndex) })
        .start();
    }
  }

  movePlayerToPosByIndex(data, callback?: Function) {
    const player = this.getPlayerByName(data.playerName);
    const pos = this._getPosByIndex(data.targetIndex);
    if (player) {
      cc.tween(player.node)
        .to(0.3, {
          position: pos,
        })
        .call(() => {
          callback && callback();
        })
        .start();
    }
  }

  getPlayerByName(name: string): Player {
    for (let i = 0, len = this._allPlayers.length; i < len; i++) {
      if (this._allPlayers[i].getData().uname == name) {
        return this._allPlayers[i];
      }
    }
    return null;
  }

  getSelf() {
    return this.getPlayerByName(PlayerData.uname);
  }

  // 通过key获取对应坐标 L1,L2,R1,R2
  _getPosByIndex(index: number) {
    const wrapNum = 9;
    let newPos = cc.Vec3.ZERO;
    if (index < wrapNum) {
      newPos = cc.v3(
        -320 + (index % 3) * 100,
        -270 + Math.floor(index / 3) * 70,
        0
      );
    } else {
      index %= wrapNum;
      newPos = cc.v3(
        120 + (index % 3) * 100,
        -270 + Math.floor(index / 3) * 70,
        0
      );
    }
    return newPos;
  }

  moveOutside(callback?: Function) {
    this._allPlayers.forEach((p) => {
      p.moveOutSide();
    });
    callback && callback();
  }

  removePlayer(playerName: string) {
    cc.error("离开的玩家: ", playerName);
    for (let i = this._allPlayers.length - 1; i >= 0; i--) {
      const p = this._allPlayers[i];
      if (p.getData().uname == playerName) {
        // p.node.destroy();
        // this._allPlayers.splice(i, 1);
        p.remove = true;
        break;
      }
    }
    // cc.error("剩余玩家数：", this._allPlayers.length);
  }

  removeAllPlayer() {
    for (let i = this._allPlayers.length - 1; i >= 0; i--) {
      const p = this._allPlayers[i];
      // p.node.destroy();
      // this._allPlayers.splice(i, 1);
      p.remove = true;
    }
    // cc.error("剩余玩家数：", this._allPlayers.length);
  }
}
