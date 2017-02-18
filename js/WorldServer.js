/**
* Copyright © 2012-2013 Lee Bradley
* All Rights Reserved
*
* NOTICE: All information herein is, and remains the property of
* Lee Bradley. Dissemation of this information or reproduction of
* this material is strictly forbidden unless prior written permission
* is obtained from Lee Bradley.
*
* The above copyright notice and this notice shall be included in
* all copies or substantial portions of the Software.
*/
WorldServer = function (broadcast, log) {
  var self = this;
  var m_world;
  var iPlayerTotal = 0;
  var m_aConnections = [];

  function generateWorld () {
    m_world.reset();

    m_world.setTileManipulationObserver({
      reset: function () {
        broadcast(OP_WORLD_RESET);
      },
      createTile: function (tile) {
        broadcast(OP_WORLD_CREATE_TILE, tile.toJson());
      },
      deleteTile: function (tile) {
        broadcast(OP_WORLD_DELETE_TILE, tile.getId());
      },
      moveTile: function (tile, x, y) {
        broadcast(OP_WORLD_MOVE_TILE, [
          tile.getId(),
          x,
          y
        ]);
      },
      animMoveTile: function (tile, x, y, speed) {
        broadcast(OP_WORLD_ANIM_MOVE, [
          tile.getId(),
          x,
          y,
          speed
        ]);
      },
      tileStyleChange: function (tile) {
        broadcast(OP_WORLD_UPDATE_TILE_STYLE, [
          tile.getId(),
          tile.styleToJson()
        ]);
      },
      tileTextChange: function (tile) {
        broadcast(OP_WORLD_UPDATE_TILE_TEXT, [
          tile.getId(),
          tile.getText()
        ]);
      }
    });

    var worldGenerator = new WorldGenerator();
    worldGenerator.generateRandomWorld(m_world, resetWorld);
  }

  function resetWorld () {
    generateWorld();

    var jsonWorld = m_world.toJson();
    each(m_aConnections, function (i, connection) {
      connection.loadWorld(m_world, jsonWorld);
    });
  }

  self.getWorld = function () {
    return m_world;
  };

  self.setupWorld = function () {
    m_world = new World();
    generateWorld();
    return m_world;
  }

  function Connection (conn, sendMessage) {
    var self = this;
    var p;
    var iPlayerId;
    var playerInformation = new PlayerInformation();

    self.loadWorld = function (world, jsonWorld) {
      sendMessage(OP_WORLD_LOAD, jsonWorld);
      p.setWorld(world, 3, 0);
    }

    self.close = function () {
      delete m_aConnections[iPlayerId];
      p.removeFromWorld();
      log(conn + ' left the game');
      broadcast(OP_PLAYER_DISCONNECT, [iPlayerId]);
    }

    self.handleClientRequest = function (packet) {
      if (p.isDead()) return;

      switch (packet[0]) {
        case REQ_PLAYER_WEAPON_SET:
          var iWeaponIndex = packet[1];
          p.getWeaponSlotControl().setWeapon(iWeaponIndex);
          break;

        case REQ_PLAYER_MOVE:
          p.shift(packet[1]);
          break;

        case REQ_BUY:
          var aItemIds = packet[1],
          aPurchasedItems = [];

          each(aItemIds, function (i, iItemId) {
            var iResult = p.getStoreControl().tryBuyItem(iItemId);
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

          sendMessage(OP_BUY_SUCCESS, aPurchasedItems);
          break;

        case REQ_SELL:
          var aItemIds = packet[1],
          oSoldItems = [];

          each(aItemIds, function (i, iItemId) {
            var iResult = p.getStoreControl().trySellItem(iItemId);
            switch (iResult) {
              case SELL_SUCCESS:
              oSoldItems.push(iItemId);
              break;

              case SELL_ERROR_ITEM_NOT_OWNED:
              break;
            }
          });

          sendMessage(OP_SELL_SUCCESS, oSoldItems);
          break;

        case REQ_PLAYER_FIRE:
          p.activateWeapon();
          break;

        default:
          throw Exception("Unrecognized packet message")
          break;
      }
    };

    function initialize () {
      var jsonWorld = m_world.toJson();
      sendMessage(OP_WORLD_LOAD, jsonWorld);

      p = new Player();
      p.initialize(sendMessage);
      p.addDeathObserver(function (strKilledBy) {
        log(conn + playerInformation.getName() + ' was killed by ' + strKilledBy);
        broadcast(OP_PLAYER_DIE, [iPlayerId, strKilledBy]);
      });

      var moneyControl = p.getMoneyControl();
      moneyControl.setOnMoneyUpdate(function (iMoney) {
        sendMessage(OP_MONEY_UPDATE, [iMoney]);
      });

      moneyControl.setMoney(40);
      p.setWorld(m_world, 3, 0);

      iPlayerId = iPlayerTotal;
      iPlayerTotal++;

      var strPlayerName = "bob" + iPlayerId.toString();
      playerInformation.setName(strPlayerName);

      broadcast(OP_PLAYER_CONNECT, [iPlayerId, strPlayerName]);
      broadcast(OP_PLAYER_SPAWN, [iPlayerId]);

      var purchasedItems = p.getStoreControl().getPurchasedItems(),
      aPurchasedIds = [];

      each(purchasedItems, function (iItemId, item) {
        aPurchasedIds.push(iItemId);
      });
      sendMessage(OP_BUY_SUCCESS, aPurchasedIds);

      log(conn + playerInformation.getName() + ' joined the game.');
    };

    self.getPlayerId = function () {
      return iPlayerId;
    };

    initialize();
  };

  self.createConnection = function (conn, sendMessage) {
    var connection = new Connection(conn, sendMessage);
    m_aConnections.push(connection);
    return connection;
  };
}
