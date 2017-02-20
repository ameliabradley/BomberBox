import { each } from 'game/util';
import {
  OP_PLAYER_BLINK,
  WEAPON_BOMB,
  WEAPON_CARPET_BOMB,
  OP_PLAYER_WEAPON_STARTCOOLDOWN,
  TILE_TRAIT,
  OP_PLAYER_MOVE,
  DIR_UP,
  DIR_LEFT,
  DIR_DOWN,
  DIR_RIGHT,
  TILE_STYLE,
  ITEM_TYPE_WEAPON,
  OP_PLAYER_WEAPON_SET,
  OP_PLAYER_WEAPON_ADD,
  OP_PLAYER_WEAPON_REMOVE,
} from 'game/const'

import MoneyControl from 'game/interface/MoneyControl';
import Tile from 'game/entities/Tile';
import BombDeployer from 'game/BombDeployer';
import CarpetBombDeployer from 'game/CarpetBombDeployer';
import StoreControl from 'game/interface/StoreControl';
import WeaponSlotControl from 'game/interface/WeaponSlotControl';

const Player = function() {
   var self = this,
      m_iX, m_iY,
      m_storeControl,
      m_moneyControl,
      m_weaponSlotControl,
      m_world,
      m_tile,
      m_bDead = false,

      // As in, not a BROADCAST
      m_fnSendToClient,

      m_aDeathObservers = [],

      onDeath = function(strKilledBy) {
         m_bDead = true;
         each(m_aDeathObservers, function(i, fn) {
            fn(strKilledBy);
         });
      };

   self.getTile = function() {
      return m_tile;
   };

   self.getStoreControl = function() {
      return m_storeControl;
   };

   self.getMoneyControl = function() {
      return m_moneyControl;
   };

   self.getWeaponSlotControl = function() {
      return m_weaponSlotControl;
   };

   self.getWorld = function() {
      return m_world;
   };

   self.removeFromWorld = function () {
      m_world.deleteTile(m_tile);
   };

   self.blinkPlayer = function() {
      m_fnSendToClient(OP_PLAYER_BLINK, m_tile.getId());
   }

   self.activateWeapon = function() {
      var weapon = m_weaponSlotControl.getSelectedWeapon();
      if (weapon) {
         weapon.activate(m_tile.x, m_tile.y);
      }
   }

   self.addWeapon = function(iItemId, item) {
      var specificWeapon,
         weapon;

      switch (iItemId) {
      case WEAPON_BOMB:
         specificWeapon = new BombDeployer();
         break;

      case WEAPON_CARPET_BOMB:
         specificWeapon = new CarpetBombDeployer();
         break;
      }

      specificWeapon.initialize(m_world);
      weapon = specificWeapon.getWeapon();
      m_weaponSlotControl.addWeapon(iItemId, weapon);
      weapon.setCooldownObserver({
         onItemTestedButNotReady: function () {
            self.blinkPlayer();
         },
         startCooldown: function (iCooldownTime) {
            var iSlotIndex = m_weaponSlotControl.getSlotIndexByItemId(iItemId);
            m_fnSendToClient(OP_PLAYER_WEAPON_STARTCOOLDOWN, [iCooldownTime, iSlotIndex]);
         },
         updateCooldown: function () {
         },
         finishCooldown: function () {
         }
      });
   };

   self.removeWeapon = function (iItemId, item) {
      m_weaponSlotControl.removeWeapon(iItemId);
   };

   self.shift = function(iDirection) {
      if (m_tile.isDestroyed()) return;

      var x = m_tile.x,
         y = m_tile.y;

      switch (iDirection) {
      case DIR_LEFT:
         x -= 1;
         break;
      case DIR_RIGHT:
         x += 1;
         break;
      case DIR_UP:
         y -= 1;
         break;
      case DIR_DOWN:
         y += 1;
         break;
      }

      if (m_world.locationHasTraits(x, y, [TILE_TRAIT.TRAIT_BLOCKING])) {
         self.blinkPlayer();
         return;
      }

      m_fnSendToClient(OP_PLAYER_MOVE, [x, y]);
      m_world.moveTile(m_tile, x, y);
   }

   self.addDeathObserver = function(fnObserver) {
      m_aDeathObservers.push(fnObserver);
   };

   self.setWorld = function(world, iX, iY) {
      m_world = world;

      m_tile = new Tile(m_world);
      m_tile.setStyle(TILE_STYLE.TILE_QUTE);
      m_tile.setPosition(iX, iY);
      m_tile.setText('P');
      m_tile.setTrait(TILE_TRAIT.TRAIT_PLAYER, true);
      m_world.createTile(m_tile);

      m_tile.teleport = function(x, y) {
         self.world.setTimeout(function() {
            self.world.moveTile(m_tile, x, y);
            self.world.moveCamera(x, y);
         }, 100);
      };

      m_tile.eatMoney = function(iAmount) {
         m_moneyControl.modifyMoney(iAmount);
      };

      m_tile.dieBy = function(strName) {
         m_tile.destroy();
         onDeath(strName);
      };

      m_tile.setOnFrag(function() {
         m_tile.destroy();
         onDeath("Bomb");
      });

      if (!m_storeControl) {
         m_storeControl = new StoreControl();
         m_storeControl.initialize(m_world.getItemManager(), m_moneyControl, {
            onSellItem: function (iItemId, item) {
               switch (item.type) {
               case ITEM_TYPE_WEAPON:
                  self.removeWeapon(iItemId, item);
                  break;
               // TODO: Sell mods
               }
            },
            onBuyItem: function (iItemId, item) {
               switch (item.type) {
               case ITEM_TYPE_WEAPON:
                  self.addWeapon(iItemId, item);
                  break;
               // TODO: Buy mods
               }
            },
            onAddItem: function (iItemId, item) {
            }
         });
      }

      m_fnSendToClient(OP_PLAYER_MOVE, [iX, iY]);
   };

   self.getMoneyControl = function () {
      return m_moneyControl;
   };

   self.isDead = function () {
      return m_bDead;
   };

   self.initialize = function(fnSendCommand) {
      m_weaponSlotControl = new WeaponSlotControl();
      m_weaponSlotControl.initialize({
         onSetWeapon: function (iWeaponSlot) {
            m_fnSendToClient(OP_PLAYER_WEAPON_SET, iWeaponSlot);
         },
         onAddWeapon: function (iWeaponSlot, iItemId) {
            m_fnSendToClient(OP_PLAYER_WEAPON_ADD, [iWeaponSlot, iItemId]);
         },
         onRemoveWeapon: function (iWeaponSlot, iItemId) {
            m_fnSendToClient(OP_PLAYER_WEAPON_REMOVE, [iWeaponSlot, iItemId]);
         }
      });

      m_moneyControl = new MoneyControl();
      m_moneyControl.initialize();

      m_fnSendToClient = fnSendCommand;
   };
};

export default Player;
