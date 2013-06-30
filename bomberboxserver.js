#!/usr/bin/env node

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

// !!! player can set bombs after dead

// !!! Better UI for store
// !!! lobby for multi-player to wait for players to join and click "ready"
// !!! Player position on reset
// !!! Map generation for multi-player games
// !!! Different player colors
// !!! Different player spawn locations
// !!! Basic graphics for weapons
// ! Dialog: Start single-player or multi-player game?
// ! Zoom out to map, then zoom to player on start

// Add icons (see bookmark)

// YOU DIED - Killed by X - Respawn in Y
// Player mini-game on death (keep them occupied)
// Winning determined by taking enemy flag and carrying it back to your own base

// TODO: Add back pause / play for single-player
// TODO: Remove animation functions being called from the server

require('./lib/msgpack');
require('./lib/dijkstra');

require('./js/util');
require('./js/const');

require('./js/MoneyControl');
require('./js/StoreControl');

require('./js/Weapon');
require('./js/ItemCooldown');
require('./js/WeaponSlotControl');
require('./js/Bomb');
require('./js/BombBase');
require('./js/BombDeployer');
require('./js/BombFragment');
require('./js/CarpetBomb');
require('./js/CarpetBombDeployer');
require('./js/ItemManager');

require('./js/WanderingEntity');
require('./js/Charger');
require('./js/Ghost');
require('./js/Sentry');
require('./js/Blaster');
require('./js/MoneyBlock');

require('./js/World');
require('./js/Tile');
require('./js/CountDown');
require('./js/Player');
require('./js/Portal');
require('./js/RectDimensions');

require('./js/PlayerInformation');
require('./js/PlayerInformationManager');

require('./js/ServerObjectManager');
require('./js/WorldGenerator');

//
//  bomberboxserver.js
//  BomberBox Server
//  Copyright (c) 2013 Lee Bradley
//
//  Read README for instructions and LICENSE license.
//
//  Based on WPilot
//  Copyright (c) 2010 Johan Dahlberg
//
var path = require('path'),
   fs = require('fs'),
   fu = require('./lib/fu');
   ws = require('ws'),
   optparse = require('./lib/optparse'),

   WebSocketServer = ws.Server,
   inspect = require('util');

const SERVER_VERSION = '1.0',

   // Player Connection states
   STATE_DISCONNECTED = -1,
   STATE_IDLE = 0,
   STATE_CONNECTED = 1,
   STATE_HANDSHAKING = 3,
   STATE_JOINED = 4;

   // Command line option parser switches
   SWITCHES = [
      ['-d', '--debug', 'Enables debug mode (Default: false)'],
      ['-H', '--help', 'Shows this help section'],
      ['--name NAME', 'The name of the server.'],
      ['--host HOST', 'The host adress (default: 127.0.0.1).'],
      ['--region REGION', 'Set region of this server. This info is displayed in the global server list (default: n/a).'],
      ['--admin_password PASSWORD', 'Admin password (default: "none").'],
      ['--map PATH', 'Path to world map (default: built-in map).'],
      ['--pub_host HOST', 'Set if the public host differs from the local one'],
      ['--http_port PORT', 'Port number for the HTTP server. Disable with 0 (default: 8000)'],
      ['--ws_port PORT', 'Port number for the WebSocket server (default: 6114)'],
      ['--pub_ws_port PORT', 'Set if the public WebSocket port differs from the local one'],
      ['--max_rate NUMBER', 'The maximum rate per client and second (default: 1000)'],
      ['--max_connections NUMBER', 'Max connections, including players (default: 60)'],
      ['--max_players NUMBER', 'Max connected players allowed in server simultaneously (default: 8)'],
      ['--r_ready_ratio NUMBER', 'Rule: Player ready ratio before a round start. (Default: 0.6)'],
      ['--r_respawn_time NUMBER', 'Rule: Player respawn time after death. (Default: 500)'],
      ['--r_reload_time NUMBER', 'Rule: The reload time after fire. (Default: 15)'],
      ['--r_shoot_cost NUMBER', 'Rule: Energy cost of shooting a bullet. (Default: 800)'],
      ['--r_shield_cost NUMBER', 'Rule: Energy cost of using the shield. (Default: 70)'],
      ['--r_energy_recovery NUMBER', 'Rule: Energy recovery unit (Default: 40)'],
      ['--r_round_limit NUMBER', 'Rule: Round score limit (Default: 10)'],
      ['--r_suicide_penelty NUMBER', 'Rule: The cost for suicides (Default: 1)'],
      ['--r_kill_score NUMBER', 'Rule: The price of a kill (Default: 1)'],
      ['--r_powerup_max NUMBER', 'Rule: Max no of powerups to spawn (Default: 3)'],
      ['--r_powerup_respawn NUMBER', 'Rule: Time between powerup respawns (Default: 1200)'],
      ['--r_powerup_spread_t NUMBER', 'Rule: Time before the spread powerup decline (Default: 700)'],
      ['--r_powerup_rapid_t NUMBER', 'Rule: Time before the rapid fire powerup decline (Default: 600)'],
      ['--r_powerup_rico_t NUMBER', 'Rule: Time before the ricoshet powerup decline (Default: 800)']
   ],

   // Default server options
   DEFAULT_OPTIONS = {
      debug: true,
      name: 'BomberBox Server',
      host: '127.0.0.1',
      region: 'n/a',
      admin_password: null,
      map: null,
      pub_host: null,
      http_port: 8000,
      ws_port: 6114,
      pub_ws_port: null,
      max_connections: 60,
      max_players: 8,
      max_rate: 5000,
      r_ready_ratio: 0.6,
      r_respawn_time: 400,
      r_reload_time: 15,
      r_shoot_cost: 300,
      r_shield_cost: 30,
      r_energy_recovery: 30,
      r_round_limit: 10,
      r_suicide_penelty: 1,
      r_kill_score: 1,
      r_powerup_max: 2,
      r_powerup_respawn: 600,
      r_powerup_spread_t: 700,
      r_powerup_rapid_t: 600,
      r_powerup_rico_t: 600
   };

   // Paths to all files that should be server to client.
   CLIENT_DATA = [
      'client/index.html', '',
      'client/game.css', '',

      "client/images/btn_play.png", "images/",
      "client/images/btn_pause.png", "images/",
      "client/images/checkmark-item.png", "images/",
      "client/images/checkmark-mod.png", "images/",

      "client/images/item_bomb.png", "images/",
      "client/images/item_carpetbomb.png", "images/",

      "client/images/arrow_down.png", "images/",
      "client/images/arrow_up.png", "images/",

      "lib/jquery-1.8.2.js", "lib/",
      "lib/jquery-ui/jquery-ui.css", "lib/jquery-ui/",
      "lib/jquery-ui/jquery-ui.js", "lib/jquery-ui/",
      "lib/msgpack.js", "lib/",
      "lib/dijkstra.js", "lib/",

      "js/util.js", "js/",
      "js/util-client.js", "js/",
      "js/Blaster.js", "js/",
      "js/Bomb.js", "js/",
      "js/BombBase.js", "js/",
      "js/BombDeployer.js", "js/",
      "js/BombFragment.js", "js/",
      "js/CameraCursor.js", "js/",
      "js/CarpetBomb.js", "js/",
      "js/CarpetBombDeployer.js", "js/",
      "js/Charger.js", "js/",
      "js/Client.js", "js/",
      "js/ClientObjectManager.js", "js/",
      "js/ContextCache.js", "js/",
      "js/CountDown.js", "js/",
      "js/ItemManager.js", "js/",
      "js/Ghost.js", "js/",
      "js/ItemCooldown.js", "js/",
      "js/MoneyBlock.js", "js/",
      "js/Player.js", "js/",
      "js/Portal.js", "js/",
      "js/RectDimensions.js", "js/",
      "js/Sentry.js", "js/",
      "js/ServerObjectManager.js", "js/",
      "js/WorldGenerator.js", "js/",
      "js/Tile.js", "js/",
      "js/WanderingEntity.js", "js/",
      "js/Weapon.js", "js/",
      "js/WeaponSlotControl.js", "js/",
      "js/World.js", "js/",
      "js/WorldInterface.js", "js/",
      "js/const.js", "js/",
      "js/PlayerInformationManager.js", "js/",
      "js/PlayerInformation.js", "js/",
      "js/MoneyControl.js", "js/",
      "js/StoreControl.js", "js/",
      "js/StoreInterface.js", "js/",

      "client/FABridge.js", "lib/",
      'client/swfobject.js', 'lib/',
      'client/web_socket.js', 'lib/',
      'client/WebSocketMain.swf', 'lib/',
      'client/crossdomain.xml', 'lib/'
   ];

/**
 *  Entry point for server.
 *  @returns {undefined} Nothing.
 */

function main() {
   var options = parse_options(),
      shared = {
         get_state: function () {}
      },
      webserver = null,
      gameserver = null,
      maps = null;

   if (!options) return;

   console.log('BomberBox server ' + SERVER_VERSION);

   maps = options.maps;

   if (options.http_port != 0) {
      webserver = start_webserver(options, shared);
   }

   gameserver = start_gameserver(maps, options, shared);
}

/**
 *  Starts the web socket game server.
 *  @param {GameOptions} options Game options.
 *  @returns {WebSocketServer} Returns the newly created WebSocket server
 *                             instance.
 */

function start_gameserver(maps, options, shared) {
   var connections = {},
      no_connections = 0,
      world = null,
      server = null,
      next_map_index = 0,
      iPlayerTotal = 0;

   // Is called by the web instance to get current state
   shared.get_state = function () {
      return {
         server_name: options.name,
         region: options.region,
         version: SERVER_VERSION,
         game_server_url: 'ws://' + (options.pub_host || options.host) + ':' +
         (options.pub_ws_port || options.ws_port) + '/'
         //map_name:         world.map_name,
         //max_players:      options.max_players,
         //no_players:       world.no_players,
         //no_ready_players: world.no_ready_players,
         //rules:            world.rules
      }
   }

   function connection_for_player(player) {
      for (var connid in connections) {
         var conn = connections[connid];
         if (conn.player && conn.player.id == player.id) {
            return conn;
         }
      }
      return null;
   }

   /**
    *  Broadcasts a game message to all current connections. Broadcast always
    *  set's message priority to HIGH.
    *  @param {String} msg The message to broadcast.
    *  @return {undefined} Nothing
    */

   function broadcast() {
      var msg = msgpack.pack(Array.prototype.slice.call(arguments), true);
      for (var id in connections) {
         connections[id].send(msg);
      }
   }

   /**
    *  Broadcast, but calls specified callback for each connection
    *  @param {Array} msg The message to broadcast.
    *  @param {Function} callback A callback function to call for each connection
    *  @return {undefined} Nothing
    */

   function broadcast_each(msg, callback) {
      for (var id in connections) {
         var conn = connections[id];
         if (conn.state == STATE_JOINED) {
            var prio = callback(msg, conn);
            if (prio) conn.send(msg);
         }
      }
   }

   /**
    *  pad single digit numbers with leading zero
    *  @param {Integer} Number
    *  @return {String} padded number
    */

   function pad0(num) {
      return (num < 10) ? '0' + num : num;
   }

   /**
    *  Prints a system message on the console.
    *  @param {String} msg The message to print .
    *  @return {undefined} Nothing
    */

   function log(msg) {
      var now = new Date();
      console.log(pad0(now.getHours()) + ':' + pad0(now.getMinutes()) + ':' +
         pad0(now.getSeconds()) + ' ' + options.name + ': ' + msg);
   }

   function generateRandomWorld () {
      if (world) {
         world.reset();
      }

      var worldGenerator = new WorldGenerator();
      worldGenerator.generateRandomWorld(world, function () {
         generateRandomWorld();
      });

      var jsonWorld = world.toJson();

      world.setTileManipulationObserver({
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

      for (var id in connections) {
         var conn = connections[id];
         conn.setWorld(jsonWorld);
      }
   }

   /**
    *  Load a map
    *  @param path {String} path to map.
    *  @param default_on_fail {Boolean} loads the default map if the specified
    *                                   map failed to load.
    *  @return {undefined} Nothing
    */

   function load_map(path, default_on_fail, callback) {
      // TODO: Implement actual map loading
      return;

      var map_path = path;

      function done(err, map_data) {
         if (!map_data && default_on_fail) {
            map_data = DEFAULT_MAP;
         }

         if (map_data) {
            // TODO: Load the map
         }
         callback(err);
      }

      if (!map_path) {
         if (maps.length == 0) {
            done(null, DEFAULT_MAP);
            return;
         } else {
            if (next_map_index >= maps.length) {
               next_map_index = 0;
            }
            map_path = maps[next_map_index];
            next_map_index++;
         }
      }

      fs.readFile(map_path, function (err, data) {
            if (err) {
               done('Failed to read map: ' + err);
               return;
            }
            try {
               done(null, JSON.parse(data));
            } catch (e) {
               done('Map file is invalid, bad format');
               return;
            }
         });
   }

   /**
    *  Create the web socket server.
    *  @param {function} callback The callback for new connections.
    *  @param {String} msg The message to broadcast.
    *  @return {undefined} Nothing
    */
   server = new WebSocketServer({
         port: parseInt(options.ws_port),
         host: options.host
      });

   server.on("connection", function (conn) {
         var connection_id = 0,
            disconnect_reason = 'Closed by client',
            iPlayerId,
            playerInformation = new PlayerInformation(),
            p;

         conn.setWorld = function (jsonWorld) {
            if (p) {
               conn.post(OP_WORLD_LOAD, jsonWorld);
               p.setWorld(world, 3, 0);
            }
         }

         /**
          *  Sends a chat message
          */
         conn.chat = function (strMessage) {
            if (p) {
               broadcast(OP_PLAYER_SAY, [iPlayerId, strMessage]);
               log('Chat ' + iPlayerId + ': ' + strMessage);
            }
         }

         /**
          *  Forces a connection to be disconnected.
          */
         conn.kill = function (reason) {
            disconnect_reason = reason || 'Unknown Reason';
            conn.post(OP_DISCONNECT_REASON, disconnect_reason);
            conn.close();
         }

         /**
          *  Stringifies specified object and sends it to remote part.
          */
         conn.post = function (iCommandId, o) {
            var strPacket = msgpack.pack([
                  iCommandId,
                  o
               ], true);

            conn.send(strPacket);
         }

         conn.post_command = function (iCommandId) {
            var strPacket = msgpack.pack([iCommandId], true);
            conn.send(strPacket);
         }

         /**
          *  Sets the state of the connection
          */
         conn.set_state = function (new_state) {
            switch (new_state) {

            case STATE_CONNECTED:
               if (no_connections++ > options.max_connections) {
                  conn.kill('server busy');
                  return;
               }

               while (connections[++connection_id]);

               conn.id = connection_id;
               conn.player = null;
               conn.is_admin = false;
               conn.rate = options.max_rate;
               conn.update_rate = 2;
               conn.max_rate = options.max_rate;
               conn.last_rate_check = get_time();
               conn.last_ping = 0;
               conn.ping = 0;
               conn.data_sent = 0;
               conn.dimensions = [640, 480];
               conn.state = STATE_IDLE;
               conn.debug = options.debug;

               connections[conn.id] = conn;

               break;

            case STATE_HANDSHAKING:
               // FIXME
               if (false || (world.no_players >= world.max_players)) {
                  conn.kill('Server is full');
               } else {
                  //conn.post(OP_WORLD_DATA, world.map_data, world.rules);

                  if (conn.debug) {
                     log('Debug: ' + conn + ' connected to server. Sending handshake...');
                  }
               }
               break;

            case STATE_JOINED:
               var jsonWorld = world.toJson();
               conn.post(OP_WORLD_LOAD, jsonWorld);

               p = new Player();
               p.initialize(conn.post);
               p.addDeathObserver(function (strKilledBy) {
                  log(conn + playerInformation.getName() + ' was killed by ' + strKilledBy);
                  broadcast(OP_PLAYER_DIE, [iPlayerId, strKilledBy]);
               });

               var moneyControl = p.getMoneyControl();
               moneyControl.setOnMoneyUpdate(function (iMoney) {
                  conn.post(OP_MONEY_UPDATE, [iMoney]);
               });

               moneyControl.setMoney(40);

               p.setWorld(world, 3, 0);

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
               conn.post(OP_BUY_SUCCESS, aPurchasedIds);

               log(conn + playerInformation.getName() + ' joined the game.');
               break;

            case STATE_DISCONNECTED:
               if (conn.id && connections[conn.id]) {
                  delete connections[conn.id];

                  no_connections--;

                  if (p) {
                     p.removeFromWorld();
                     log(conn + ' left the game (Reason: ' + disconnect_reason + ')');
                     broadcast(OP_PLAYER_DISCONNECT, [iPlayerId]);
                  }

                  if (conn.debug) {
                     log('Debug: ' + conn + ' disconnected (Reason: ' + disconnect_reason + ')');
                  }
               }
               break;
            }

            conn.state = new_state;
         }

         /**
          *  Returns a String representation for this Connection
          */
         conn.toString = function () {
            return this.remoteAddress + '(id: ' + this.id + ')';
         }

         // Connection 'receive' event handler. Occures each time that client sent
         // a message to the server.
         conn.on('message', function (data) {
               var packet = null;

               try {
                  packet = msgpack.unpack(data);
               } catch (e) {
                  console.error('Malformed message recieved');
                  console.error(inspect(data));
                  conn.kill('Malformed message sent by client');
                  return;
               }

               var iClientRequestTypeId = packet[0];

               if (p.isDead()) {
                  switch (packet[0]) {
                  case REQ_PING:
                     conn.ping = get_time() - conn.last_ping;
                     break;
                  }
               } else {
                  switch (packet[0]) {
                  case REQ_PING:
                     conn.ping = get_time() - conn.last_ping;
                     break;

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

                     conn.post(OP_BUY_SUCCESS, aPurchasedItems);
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

                     conn.post(OP_SELL_SUCCESS, oSoldItems);
                     break;

                  case REQ_PLAYER_FIRE:
                     p.activateWeapon();
                     break;
                  }
               }
            });

         // Connection 'close' event listener. Occures when the connection is
         // closed by user or server.
         conn.on('close', function () {
               conn.set_state(STATE_DISCONNECTED);
            });


         // Connection 'connect' event handler. Challenge the player and creates
         // a new PlayerSession.
         conn.set_state(STATE_CONNECTED);
         conn.set_state(STATE_HANDSHAKING);
         conn.set_state(STATE_JOINED);

         conn.remoteAddress = conn._socket.remoteAddress;
      });

   world = new World();
   generateRandomWorld();

   return server;
}

/**
 *  Starts a webserver that serves BomberBox client related files.
 *  @param {Object} options Web server options.
 *  @return {http.Server} Returns the HTTP server instance.
 */

function start_webserver(options, shared) {
   console.log('Starting HTTP server at http://' + options.host + ':' + options.http_port);
   var server = fu.listen(parseInt(options.http_port), options.host);

   for (var i = 0; i < CLIENT_DATA.length; i++) {
      var virtualpath = CLIENT_DATA[i + 1] + path.basename(CLIENT_DATA[i]);
      fu.get('/' + virtualpath, fu.staticHandler(CLIENT_DATA[i]));
      i++;
   }

   fu.get('/', fu.staticHandler(CLIENT_DATA[0]));

   fu.get('/state', function (req, res) {
         res.writeHead(200, {
               'Content-Type': 'application/json'
            });
         res.write(JSON.stringify(shared.get_state()), 'utf8');
         res.end();
      });

   return server;
}

/**
 *  Parses and returns server options from ARGV.
 *  @returns {Options} Server options.
 */

function parse_options() {
   var parser = new optparse.OptionParser(SWITCHES),
      result = {
         rules: {},
         maps: []
      };
   parser.banner = 'Usage: bomberboxserver.js [options]';

   parser.on('help', function () {
         console.log(parser.toString());
         parser.halt();
      });

   parser.on('map', function (prop, value) {
         result.maps.push(value);
      });

   parser.on('*', function (opt, value) {
         var match = opt.match(/^r_([a-z_]+)/);
         if (match) {
            result.rules[match[1]] = value;
         }
         result[opt] = value || true;
      });

   parser.parse(process.argv);
   return parser._halt ? null : mixin(DEFAULT_OPTIONS, result);
}

/**
 *  Returns current time stamp
 */

function get_time() {
   return new Date().getTime();
}

/**
 *  Quick'n'dirty mixin replacement
 */

function mixin(a, b) {
   var result = {}

   for (var prop in a) {
      result[prop] = a[prop];
   }

   for (var prop in b) {
      result[prop] = b[prop];
   }

   return result;
}

// Call programs entry point
main();
