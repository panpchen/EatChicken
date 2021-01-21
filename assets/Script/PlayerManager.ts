// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { IPlayer, isSelfByName, PlayerData } from "./GameData";
import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerManager extends cc.Component {
  @property(cc.Prefab)
  prefab: cc.Prefab = null;

  private _allPlayers: Player[] = [];
  createPlayer(players) {
    for (let i = players.length - 1; i >= 0; i--) {
      for (let j = this._allPlayers.length - 1; j >= 0; j--) {
        if (players[i].uname === this._allPlayers[j].getData().uname) {
          players.splice(i, 1);
          break;
        }
      }
    }

    for (let i = 0, len = players.length; i < len; i++) {
      const player = cc.instantiate(this.prefab).getComponent(Player);
      const pData: IPlayer = players[i];
      if (isSelfByName(pData.uname)) {
        PlayerData.uindex = pData.uindex;
      }
      player.init(pData);
      player.node.parent = this.node;
      this._allPlayers.push(player);
      player.node.setSiblingIndex(0);
      player.node.setPosition(cc.v2(-400, 640));
      cc.tween(player.node)
        .to(1, { position: this._getPosByIndex(pData.uindex) })
        .start();
    }
  }

  movePlayerToPosByIndex(data, callback?: Function) {
    const player = this._getPlayerByName(data.playerName);
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

  _getPlayerByName(name: string) {
    for (let i = 0, len = this._allPlayers.length; i < len; i++) {
      if (this._allPlayers[i].getData().uname === name) {
        return this._allPlayers[i];
      }
    }
    return null;
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
  removePlayer(player: IPlayer) {
    cc.error("离开的玩家: ", player);
    for (let i = 0, len = this._allPlayers.length; i < len; i++) {
      const p = this._allPlayers[i];
      if (p.getData().uname === player.uname) {
        p.node.destroy();
        this._allPlayers.splice(i, 1);
        break;
      }
    }
  }
}
