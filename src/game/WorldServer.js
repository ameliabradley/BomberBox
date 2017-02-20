import World from './World.js';
import WorldGenerator from './WorldGenerator.js';
import PlayerInformation from './PlayerInformation.js';
import Player from './Player.js';
import { each } from './util.js';

import {
  OP_WORLD_RESET,
  OP_WORLD_CREATE_TILE,
  OP_WORLD_DELETE_TILE,
  OP_WORLD_MOVE_TILE,
  OP_WORLD_ANIM_MOVE,
  OP_WORLD_UPDATE_TILE_STYLE,
  OP_WORLD_UPDATE_TILE_TEXT,
  OP_WORLD_LOAD,
  OP_PLAYER_DISCONNECT,
  REQ_PLAYER_WEAPON_SET,
  REQ_PLAYER_MOVE,
  REQ_BUY,
  PURCHASE_SUCCESS,
  PURCHASE_ERROR_INSUFFICIENT_FUNDS,
  PURCHASE_ERROR_ITEM_ALREADY_OWNED,
  OP_BUY_SUCCESS,
  REQ_SELL,
  SELL_SUCCESS,
  SELL_ERROR_ITEM_NOT_OWNED,
  OP_SELL_SUCCESS,
  REQ_PLAYER_FIRE,
  OP_PLAYER_DIE,
  OP_MONEY_UPDATE,
  OP_PLAYER_CONNECT,
  OP_PLAYER_SPAWN,
} from './const.js';

class WorldServer {
  constructor (broadcast, log) {
    this.world = null;
    this.iPlayerTotal = 0;
    this.m_aConnections = [];
    this.broadcast = broadcast;
    this.log = log;
  }

  allocatePlayer () {
    return this.iPlayerTotal++;
  }

  generateWorld () {
    //console.log('generating world');
    this.world.reset();

    this.world.setTileManipulationObserver({
      reset: () => {
        this.broadcast(OP_WORLD_RESET);
      },
      createTile: (tile) => {
        this.broadcast(OP_WORLD_CREATE_TILE, tile.toJson());
      },
      deleteTile: (tile) => {
        this.broadcast(OP_WORLD_DELETE_TILE, tile.getId());
      },
      moveTile: (tile, x, y) => {
        this.broadcast(OP_WORLD_MOVE_TILE, [
          tile.getId(),
          x,
          y
        ]);
      },
      animMoveTile: (tile, x, y, speed) => {
        this.broadcast(OP_WORLD_ANIM_MOVE, [
          tile.getId(),
          x,
          y,
          speed
        ]);
      },
      tileStyleChange: (tile) => {
        this.broadcast(OP_WORLD_UPDATE_TILE_STYLE, [
          tile.getId(),
          tile.styleToJson()
        ]);
      },
      tileTextChange: (tile) => {
        this.broadcast(OP_WORLD_UPDATE_TILE_TEXT, [
          tile.getId(),
          tile.getText()
        ]);
      }
    });

    var worldGenerator = new WorldGenerator();
    worldGenerator.generateRandomWorld(this.world, () => this.resetWorld());
  }

  resetWorld () {
    this.generateWorld();

    var jsonWorld = this.world.toJson();
    each(this.m_aConnections, (i, connection) => {
      connection.loadWorld(this.world, jsonWorld);
    });
  }

  closeConnection (connection) {
    delete this.m_aConnections[connection.iPlayerId];
  }

  getWorld () {
    return this.world;
  }

  setupWorld () {
    this.world = new World();
    this.generateWorld();
    return this.world;
  }

  createConnection (conn, sendMessage) {
    var connection = new Connection(this, conn, sendMessage);
    this.m_aConnections.push(connection);
    return connection;
  }
}

class Connection {
  constructor (worldServer, conn, sendMessage) {
    this.player = null;
    this.iPlayerId = null;
    this.conn = conn;
    this.sendMessage = sendMessage;

    this.playerInformation = new PlayerInformation();
    this.worldServer = worldServer;

    var jsonWorld = worldServer.getWorld().toJson();
    sendMessage(OP_WORLD_LOAD, jsonWorld);

    this.player = new Player();
    this.player.initialize(sendMessage);
    this.player.addDeathObserver((strKilledBy) => {
      worldServer.log(conn + this.playerInformation.getName() + ' was killed by ' + strKilledBy);
      worldServer.broadcast(OP_PLAYER_DIE, [this.iPlayerId, strKilledBy]);
    });

    var moneyControl = this.player.getMoneyControl();
    moneyControl.setOnMoneyUpdate(iMoney => sendMessage(OP_MONEY_UPDATE, [iMoney]));

    moneyControl.setMoney(40);
    this.player.setWorld(worldServer.getWorld(), 3, 0);

    this.iPlayerId = worldServer.allocatePlayer();

    var strPlayerName = "bob" + this.iPlayerId.toString();
    this.playerInformation.setName(strPlayerName);

    worldServer.broadcast(OP_PLAYER_CONNECT, [this.iPlayerId, strPlayerName]);
    worldServer.broadcast(OP_PLAYER_SPAWN, [this.iPlayerId]);

    var purchasedItems = this.player.getStoreControl().getPurchasedItems(),
    aPurchasedIds = [];

    each(purchasedItems, (iItemId, item) => {
      aPurchasedIds.push(iItemId);
    });
    sendMessage(OP_BUY_SUCCESS, aPurchasedIds);

    worldServer.log(conn + this.playerInformation.getName() + ' joined the game.');
  }

  loadWorld (world, jsonWorld) {
    this.sendMessage(OP_WORLD_LOAD, jsonWorld);
    this.player.setWorld(world, 3, 0);
  }

  close () {
    this.worldServer.closeConnection(this);
    this.player.removeFromWorld();
    this.worldServer.log(this.conn + ' left the game');
    this.worldServer.broadcast(OP_PLAYER_DISCONNECT, [this.iPlayerId]);
  }

  handleClientRequest (packet) {
    if (this.player.isDead()) return;

    switch (packet[0]) {
      case REQ_PLAYER_WEAPON_SET:
        var iWeaponIndex = packet[1];
        this.player.getWeaponSlotControl().setWeapon(iWeaponIndex);
        break;

      case REQ_PLAYER_MOVE:
        this.player.shift(packet[1]);
        break;

      case REQ_BUY:
        var aItemIds = packet[1],
        aPurchasedItems = [];

        each(aItemIds, (i, iItemId) => {
          var iResult = this.player.getStoreControl().tryBuyItem(iItemId);
          switch (iResult) {
            case PURCHASE_SUCCESS:
            aPurchasedItems.push(iItemId);
            break;

            case PURCHASE_ERROR_INSUFFICIENT_FUNDS:
            break;

            case PURCHASE_ERROR_ITEM_ALREADY_OWNED:
            break;
          }
        });

        this.sendMessage(OP_BUY_SUCCESS, aPurchasedItems);
        break;

      case REQ_SELL:
        var aItemIds = packet[1],
        oSoldItems = [];

        each(aItemIds, (i, iItemId) => {
          var iResult = this.player.getStoreControl().trySellItem(iItemId);
          switch (iResult) {
            case SELL_SUCCESS:
            oSoldItems.push(iItemId);
            break;

            case SELL_ERROR_ITEM_NOT_OWNED:
            break;
          }
        });

        this.sendMessage(OP_SELL_SUCCESS, oSoldItems);
        break;

      case REQ_PLAYER_FIRE:
        this.player.activateWeapon();
        break;

      default:
        throw new Error("Unrecognized packet message")
        break;
    }
  }

  getPlayerId () {
    return this.iPlayerId;
  };
}

export default WorldServer;
