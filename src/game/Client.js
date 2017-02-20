// blah
// BACKPACK ICON

//
//
// Action Types
// 1. Server
//    a. Send command to player
//       1. Reset random key to increase cheating difficulty
//    b. Interpret command in browser
//       1. Deterministically choose the step to apply the server's command
// 2. Player
//    a. Send command to server
//    b. Interpret command on server
//       (Server Response)
//    c. Send command to player
//       1. Reset random key to increase cheating difficulty
//    d. Interpret command in browser
//       1. Deterministically choose the step to apply the server's command
// 3. Program/AI
//    a. Generate command from key
//    b. Interpret command in browser
//       1. Deterministically choose the step to apply the AI's command
//
//
// Move Management
// 1. Store Move ID/time-step
// 2. Store Move action/data
// 3. Store previous move ID/time-step in each move
// 4. Retroactively apply moves when current time-step is ahead of received time-step
// 5. Request the previous move if/while the previous ID/time-step wasn't recieved, then apply forward
// 6. Delete moves when all previous moves were received
//
//

/*global $, msgpack*/
/*eslint-env browser*/
import PlayerInformationManager from 'game/PlayerInformationManager';
import StoreInterface from 'game/interface/StoreInterface';
import MoneyControl from 'game/interface/MoneyControl';
import World from 'game/World';
import WorldInterface from 'game/WorldInterface';
import Tile from 'game/entities/Tile';
import { ResourceManager, requestAnimFrame } from 'game/util-client';

// TODO: Use Reducer so consts are in their individual files
import {
  REQ_PLAYER_MOVE,
  DIR_LEFT,
  DIR_UP,
  DIR_DOWN,
  DIR_RIGHT,
  REQ_PLAYER_FIRE,
  REQ_PLAYER_WEAPON_SET,
  REQ_BUY,
  REQ_SELL,
  OP_WORLD_LOAD,
  OP_WORLD_RESET,
  OP_WORLD_CREATE_TILE,
  OP_WORLD_DELETE_TILE,
  OP_WORLD_MOVE_TILE,
  OP_WORLD_UPDATE_TILE_TEXT,
  OP_WORLD_UPDATE_TILE_STYLE,
  OP_WORLD_ANIM_MOVE,
  OP_PLAYER_BLINK,
  OP_MONEY_UPDATE,
  OP_BUY_SUCCESS,
  OP_BUY_FAILURE,
  OP_SELL_SUCCESS,
  OP_PLAYER_MOVE,
  OP_PLAYER_WEAPON_ADD,
  OP_PLAYER_WEAPON_SET,
  OP_PLAYER_WEAPON_REMOVE,
  OP_PLAYER_WEAPON_STARTCOOLDOWN,
  OP_PLAYER_CONNECT,
  OP_PLAYER_DISCONNECT,
  OP_PLAYER_SPAWN,
  OP_PLAYER_DIE,
} from 'game/const'

const Client = function () {
   var self = this,

      m_ctx,
      m_world,
      m_worldInterface,
      m_bIsConnected = false,
      m_bLocal,
      m_sendRequestLocal,

      m_bRendering = true,

      m_playerInformationManager = new PlayerInformationManager(),
      m_storeInterface = new StoreInterface(),
      m_moneyControl = new MoneyControl(),

      m_jGold,

      WeaponSlotControlInterface = function () {
         var self = this,
            m_jSelected,
            m_jWeaponSlots,
            m_jWeaponContainer;

         self.getCurrentIndex = function () {
            return m_jWeaponContainer.find(".selected").index();
         };

         self.getNextWeapon = function () {
            var jNext, bFound = false;

            if (m_jSelected) {
               jNext = m_jSelected.nextAll(":not(.disabled)").eq(0);
               bFound = (jNext.length === 1);
            }

            if (!bFound) {
               jNext = m_jWeaponSlots.filter(":not(.disabled)").eq(0);
               bFound = (jNext.length === 1);
            }

            if (bFound) {
               return jNext.index();
            } else {
               return null;
            }
         };

         self.setSelected = function (iWeaponSlot) {
            if (m_jSelected) {
               m_jSelected.removeClass("selected");
            }

            m_jSelected = m_jWeaponSlots.eq(iWeaponSlot).addClass("selected").stop().css({ top: -10 }).animate({ top: 0 }, { duration: 600, easing: "easeOutElastic" });
         };

         self.addWeapon = function (iWeaponSlot, iItemId) {
            // TODO: Change image
            //var strImage = ...
            var item = m_world.getItemManager().getItemById(iItemId);
            m_jWeaponSlots.eq(iWeaponSlot).removeClass("disabled")
               .css({
                  backgroundImage: "url(images/" + item.image + ")"
               });
         };

         self.removeWeapon = function (iWeaponSlot, iItemId) {
            // TODO: Remove image
            m_jWeaponSlots.eq(iWeaponSlot).addClass("disabled")
               .css({
                  backgroundImage: "none"
               });
         };

         self.setCooldown = function (iWeaponSlot, iCooldownTime) {
            m_jWeaponSlots.eq(iWeaponSlot).find(".slotCooldown").css({
               top: "0%"
            }).show().animate({
               top: "100%"
            }, {
               easing: "easeInQuad",
               duration: iCooldownTime,
               complete: function () {
               }
            });
         };

         self.initialize = function () {
            m_jWeaponContainer = $("#weaponSelectionContainer");
            m_jWeaponSlots = m_jWeaponContainer.find(".weaponSlot");
         };
      },

      m_weaponSlotControlInterface = new WeaponSlotControlInterface();

   $(document).keyup(function(evt) {
      switch (evt.keyCode) {
         // Escape key
         case 27:
            //self.reset();
            break;

         // P key
         case 80:
            //m_world.togglePause();
            break;
      }

      if (m_world.isPaused()) return;

      switch (evt.keyCode) {
      case 37: // LEFT
      case 65: // A
         self.sendRequest(REQ_PLAYER_MOVE, DIR_LEFT);
         break;

      case 38: // UP
      case 87: // W
         self.sendRequest(REQ_PLAYER_MOVE, DIR_UP);
         break;

      case 39: // RIGHT
      case 68: // D
         self.sendRequest(REQ_PLAYER_MOVE, DIR_RIGHT);
         break;

      case 40: // DOWN
      case 83: // S
         self.sendRequest(REQ_PLAYER_MOVE, DIR_DOWN);
         break;

      case 32: // SPACE
         self.sendRequest(REQ_PLAYER_FIRE);
         evt.preventDefault();
         break;

      case 81: // Q
         m_worldInterface.decreaseZoom();
         break;

      case 69: // E
         m_worldInterface.increaseZoom();
         break;
      }
   }).keydown(function (evt) {
      if (m_world.isPaused()) return;

      switch (evt.keyCode) {
      case 9: // TAB
         var iWeaponSlot = m_weaponSlotControlInterface.getNextWeapon();
         if (iWeaponSlot !== null) {
            self.sendRequest(REQ_PLAYER_WEAPON_SET, iWeaponSlot);
         }
         evt.preventDefault();
         break;
      }
   });

   self.renderDebugFrame = function() {
      if (!m_bRendering) return;
      m_worldInterface.renderDebug(m_ctx);
      requestAnimFrame(self.renderDebugFrame);
   };

   self.setupSidebar = function () {
      var jSidebar = $("#sidebar"),
         bShowing = false,
         iLeftShowing = 13,
         iLeftHiding = -280;

      m_storeInterface.initialize(m_world.getItemManager(), m_moneyControl);
      m_storeInterface.setObserver({
         onBuy: function (aItemIds) {
            self.sendRequest(REQ_BUY, aItemIds);
         },
         onSell: function (aItemIds) {
            self.sendRequest(REQ_SELL, aItemIds);
         }
      });

      m_moneyControl.setOnMoneyUpdate(function (iMoney) {
         var jStoreSelector = $("#storeSelector"),
            strMoney = iMoney.toString();

         jStoreSelector.html(strMoney).css({
            backgroundColor: "#FFBF1F",
            borderColor: "#FFF146"
         }).animate({
            backgroundColor: "#9a7a2f",
            borderColor: "#9a9343"
         }, {
            duration: 1000,
            complete: function () {
               jStoreSelector.css({
                  backgroundColor: "",
                  borderColor: ""
               });
            }
         });
         m_jGold.css({ top: -50 }).animate({ top: 10 }, { duration: 600, easing: "easeOutElastic" });
      });

      m_jGold = $("#storeSelectorContainer");
      m_jGold.click(function () {
         jSidebar
            .show()
            .stop()
            .animate({
               left: (bShowing) ? iLeftHiding : iLeftShowing
            }, {
               easing: 'easeOutQuad'
            });

         bShowing = !bShowing;
      });
   };

   self.hideText = function () {
      $("#displayText").css({
         display: "none"
      });
   };

   self.showText = function(strText) {
      $("#displayText").css({
         display: "inline"
      }).text(strText);
      setTimeout(function() {
         self.hideText();
      }, 3000);
   };

   self.start = function () {
      window.onresize = function() {
         self.doResize();
      }

      m_world = new World();
      m_worldInterface = new WorldInterface(self, m_world);

      var elCanvas = document.getElementById('canvas');
      m_ctx = elCanvas.getContext('2d');
      self.doResize();
      //self.reset();

      self.setupSidebar();

      m_weaponSlotControlInterface.initialize();

      ResourceManager.addImage('btn_play.png');
      ResourceManager.loadImages(function() {
         m_worldInterface.cacheEntities(m_ctx);
         self.renderDebugFrame();
      });
   };

   self.doResize = function() {
      m_ctx.canvas.width = window.innerWidth;
      m_ctx.canvas.height = window.innerHeight;
      m_worldInterface.setCameraSize(window.innerWidth, window.innerHeight);
      m_worldInterface.renderDebug(m_ctx);
   };

   self.interpretCommand = function (iCommandId, o) {
      switch (iCommandId) {
      case OP_WORLD_LOAD:
         m_world.fromJson(o);
         break;

      case OP_WORLD_RESET:
         m_world.reset();
         break;

      case OP_WORLD_CREATE_TILE:
         var tile = new Tile(m_world);
         tile.fromJson(o);
         m_world.createTileClient(tile.getId(), tile);
         break;

      case OP_WORLD_DELETE_TILE:
         m_world.deleteTileClient(o);
         break;

      case OP_WORLD_MOVE_TILE:
         m_world.moveTileClient(o[0], o[1], o[2]);
         break;

      case OP_WORLD_UPDATE_TILE_TEXT:
         var tile = m_world.getTile(o[0]);
         tile.setText(o[1]);
         break;

      case OP_WORLD_UPDATE_TILE_STYLE:
         var tile = m_world.getTile(o[0]);
         tile.styleFromJson(o[1]);
         break;

      case OP_WORLD_ANIM_MOVE:
         m_world.animMoveTileClient(o[0], o[1], o[2], o[3]);
         break;

      case OP_PLAYER_BLINK:
         m_world.blinkPlayer(o);
         break;

      case OP_MONEY_UPDATE:
         m_moneyControl.setMoney(o[0]);
         break;

      case OP_BUY_SUCCESS:
         m_storeInterface.buyItemsSuccess(o);
         break;

      case OP_BUY_FAILURE:
         break;

      case OP_SELL_SUCCESS:
         m_storeInterface.sellItemsSuccess(o);
         break;

      /*
      case OP_PLAYER_SPAWN:
         break;

      case OP_PLAYER_DIE:
         break;
      */

      case OP_PLAYER_MOVE:
         m_worldInterface.moveCamera(o[0], o[1], null, {
            easing: 'linear',
            duration: 800
         });
         break;

      case OP_PLAYER_WEAPON_SET:
         var iWeaponSlot = o;
         m_weaponSlotControlInterface.setSelected(iWeaponSlot);
         break;

      case OP_PLAYER_WEAPON_ADD:
         var iWeaponSlot = o[0],
            iItemId = o[1];
         m_weaponSlotControlInterface.addWeapon(iWeaponSlot, iItemId);
         break;

      case OP_PLAYER_WEAPON_REMOVE:
         var iWeaponSlot = o[0],
            iItemId = o[1];
         m_weaponSlotControlInterface.removeWeapon(iWeaponSlot, iItemId);
         break;

      case OP_PLAYER_WEAPON_STARTCOOLDOWN:
         var iCooldownTime = o[0],
            iSlotIndex = o[1];
         m_weaponSlotControlInterface.setCooldown(iSlotIndex, iCooldownTime);
         break;

      case OP_PLAYER_CONNECT:
         var iPlayerId = o[0],
            strPlayerName = o[1],
            playerInformation = m_playerInformationManager.add(iPlayerId, strPlayerName);
         break;

      case OP_PLAYER_DISCONNECT:
         var iPlayerId = o[0],
            playerInformation = m_playerInformationManager.get(iPlayerId);

         m_playerInformationManager.setConnected(false);
         break;

      case OP_PLAYER_SPAWN:
         var iPlayerId = o[0],
            playerInformation = m_playerInformationManager.get(iPlayerId);

         playerInformation.setAlive(true);
         break;

      case OP_PLAYER_DIE:
         var iPlayerId = o[0],
            strCauseOfDeath = o[1],
            playerInformation = m_playerInformationManager.get(iPlayerId),
            strPlayerName = playerInformation.getName();

         playerInformation.setAlive(false);
         self.showText(strPlayerName + " was killed by " + strCauseOfDeath);
         break;

      default:
         console.debug("unrecognized command", iCommandId, "DATA", o);
      };
   };

   self.joinLocal = function (sendRequest) {
      m_bIsConnected = true;
      m_bLocal = true;
      m_sendRequestLocal = sendRequest;
   };

   self.joinServer = function (url) {
     m_bLocal = false;
      if (!m_bIsConnected) {
         self.conn = new WebSocket(url);

         /**
         *  Override the onopen event of the WebSocket instance.
         *  @param {WebSocketEvent} event The websocket event object.
         *  @returns {undefined} Nothing
         */
         self.conn.onopen = function(event) {
            m_bIsConnected = true;
/*
            self.set_state(CLIENT_CONNECTING);
            setTimeout(function() {
               self.conn.send(JSON.stringify([OP_REQ_SERVER_INFO]));
            }, 100);
*/
         };

         /**
         *  Override the onmessage event of the WebSocket instance.
         *  @param {WebSocketEvent} event The websocket event object.
         *  @returns {undefined} Nothing
         */
         self.conn.onmessage = function(event) {
            self.receiveCommand(event.data);
         }

         self.conn.onclose = function () {
            m_bRendering = false;
            // TODO: More permanant display for closed connection
            self.showText("Connection to server was closed");
         }
      }
   };

   self.sendRequest = function (iRequestId, oMessage) {
      if (m_sendRequestLocal) {
        m_sendRequestLocal([iRequestId, oMessage]);
      } else {
        if (self.conn) {
           var strRequest = msgpack.pack([iRequestId, oMessage], true);
           //parent.frames.server.receive(strMessage);
           self.conn.send(strRequest);
        }
      }
   };

   self.receiveCommand = function (strCommand) {
      var aCommand = msgpack.unpack(strCommand),
         iCommandId = aCommand[0],
         oCommandData = aCommand[1];

      self.interpretCommand(iCommandId, oCommandData);
   };
};

export default Client;
