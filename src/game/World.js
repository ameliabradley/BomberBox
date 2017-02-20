import Util from './util.js';
import { each } from './util.js';

import ItemManager from './ItemManager.js';
import Tile from './Tile.js';
import MoneyBlock from './MoneyBlock.js';
import Portal from './Portal.js';

import {
  INT_SHIFT,
  INT_HALF_AND,
  TILE_STYLE,
  TILE_TRAIT,
  TILE_DRAW_SIZE,
} from './const'

const World = function () {
   "use strict";

   var self = this,

      // Tiles
      m_iTotalTiles = 0, m_aTiles = [], m_oTileById  = {},
      m_oTileManipulationObserver,

      // Background Tiles
      m_iTotalBackgroundTiles = 0, m_aBackgroundTiles = [], m_oBackgroundTilesById = {},

      // Timeout
      m_oTimeouts = {}, m_iTimeoutId = 0,
      m_dPauseTime = 0, m_dWorldTimeOffset = new Date(), m_aOnResume = [], m_aPauseObserver = [],
      m_aResetObservers = [],

      m_itemManager = new ItemManager();

   self.getItemManager = function () {
      return m_itemManager;
   };

   self.addResetObserver = function(observer) {
      m_aResetObservers.push(observer);
   };

   self.setTileManipulationObserver = function (oTileManipulationObserver) {
      m_oTileManipulationObserver = oTileManipulationObserver;
   };

   self.setTimeout = function(fn, iTimeout) {
      if (m_dPauseTime) {
         m_aOnResume.push([fn, iTimeout]);
         return;
      };

      var dStart = new Date(),
         oInfo = {
            start: dStart,
            remaining: iTimeout
         },
         fnWrapper = function() {
            delete m_oTimeouts[oInfo.origId];
            fn();
         },
         iTimeoutId = setTimeout(fnWrapper, iTimeout);

      oInfo.fn = fnWrapper;
      oInfo.id = iTimeoutId;

      // This custom timeout ID is REQUIRED for compatibility
      // with Node.js (which, as of the latest version, returns
      // an object instead of a Number for timeouts)
      oInfo.origId = m_iTimeoutId;

      m_oTimeouts[m_iTimeoutId] = oInfo;
      m_iTimeoutId++;

      return m_iTimeoutId;
   };

   self.isPaused = function() {
      return (m_dPauseTime) ? true : false;
   }

   self.togglePause = function() {
      if (m_dPauseTime) {
         self.resume();
      } else {
         self.pause();
      }
   };

   self.pause = function() {
      if (m_dPauseTime) return;

      m_dPauseTime = new Date();
      each(m_oTimeouts, (i, oInfo) => {
         clearTimeout(oInfo.id);
         oInfo.remaining -= m_dPauseTime - oInfo.start;
      });

      each(m_aPauseObserver, (i, observer) => observer.onWorldPause());
   };

   self.resume = function() {
      if (!m_dPauseTime) return;

      var dResume = new Date();
      each(m_oTimeouts, (i, oInfo) => {
         oInfo.start = dResume;
         oInfo.id = setTimeout(oInfo.fn, oInfo.remaining);
      });

      m_dPauseTime = null;

      each(m_aOnResume, (i, a) => {
         var fn = a[0],
            iTimeout = a[1];

         self.setTimeout(fn, iTimeout);
      });

      each(m_aPauseObserver, (i, observer) => observer.onWorldResume());
   };

   self.addPauseObserver = function(observer) {
      m_aPauseObserver.push(observer);
   };

   self.clearTimeout = function(iTimeoutId) {
      var oInfo = m_oTimeouts[iTimeoutId];
      if (oInfo) {
         clearTimeout(oInfo.id);
         delete m_oTimeouts[iTimeoutId];
      }
   };

   self.clearTimeouts = function() {
      each(m_oTimeouts, (i, oInfo) => clearTimeout(oInfo.id));
      m_oTimeouts = {};
   };

   self.getTimeoutRemaining = function(iTimeoutId) {
      var oInfo = m_oTimeouts[iTimeoutId];

      if (!oInfo) return 0;

      var dCurrentTime = new Date(),
         dEndTime = oInfo.start.getTime() + oInfo.remaining,
         dRemainingTime = dEndTime - dCurrentTime;

      return dRemainingTime;
   };

   self.tileStyleChange = function (tile) {
      if (m_oTileManipulationObserver) {
         m_oTileManipulationObserver.tileStyleChange(tile);
      }
   };

   self.tileTextChange = function (tile) {
      if (m_oTileManipulationObserver) {
         m_oTileManipulationObserver.tileTextChange(tile);
      }
   };

   /**
    * Set the size of the world
    * @param x the width in cells
    * @param y the height in cells
    */
   self.reset = function() {
      // Destroy all the tiles
      for (var i in m_aTiles) {
         var a = m_aTiles[i];
         if (a && a.length) {
            for (var j = 0; j < a.length; j++) {
               a[j].destroy(true);
            }
         }
      }

      m_iTotalTiles = 0;
      m_oTileById = {};
      m_aTiles = [];

      m_iTotalBackgroundTiles = 0;
      m_oBackgroundTilesById = {};
      m_aBackgroundTiles = [];

      self.clearTimeouts();

      each(m_aResetObservers, (i, fn) => fn());

      if (m_oTileManipulationObserver) {
         m_oTileManipulationObserver.reset();
      }
   };

   /**
    * Run an event on any tiles in a cell
    * @param strEvent the event
    * @param x
    * @param y
    */
   self.runEventAtPosition = function(strEvent, x, y) {
      var tiles = self.getTilesAtPosition(x, y);
      for (var i = 0; i < tiles.length; i++) {
         var tile = tiles[i];
         if (tile[strEvent])
            tile[strEvent]();
      }
   }

   self.getTilesAtPosition = function(x, y) {
      var iPos = self.getIndexFromPos(x, y);
      if (!m_aTiles[iPos]) return [];
      return m_aTiles[iPos];
   }

   self.getLocationTraits = function(x, y) {
      var aEntities = self.getTilesAtPosition(x, y),
         oTraits = {};

      each(aEntities, (i, tile) => {
         var oEntityTraits = tile.getTraits();
         each(oEntityTraits, (traitName, value) => oTraits[traitName] = value);
      });

      return oTraits;
   };

   self.locationHasTraits = function(x, y, aTraits) {
      var aEntities = self.getTilesAtPosition(x, y),
         iEntity = aEntities.length,
         iTrait;

      while (iEntity--) {
         var tile = aEntities[iEntity];

         iTrait = aTraits.length;
         while (iTrait--) {
            if (tile.getTrait(aTraits[iTrait])) return true;
         }
      }

      return false;
   }

   self.getIndexFromPos = function(x, y) {
      return x << INT_SHIFT | (y & INT_HALF_AND);
   }

   self.getPosFromIndex = function(i) {
      return [
         i >> INT_SHIFT,
         (i << INT_SHIFT) >> INT_SHIFT
      ];
   };

   self.clearEntities = function(x, y) {
      var aEntities = self.getTilesAtPosition(x, y);
      each(aEntities, (i, tile) => tile.destroy());
   };

   /**
    * Create an tile in the world
    */
   self.createTile = function(tile, bFromDifferentCall) {
      self.createTileClient(m_iTotalTiles, tile);
      if (m_oTileManipulationObserver && !bFromDifferentCall && !tile.getManaged()) {
         m_oTileManipulationObserver.createTile(tile);
      }
      return tile;
   };

   self.createTileClient = function (iTileId, tile) {
      tile.setId(iTileId);
      m_oTileById[iTileId] = tile;

      m_iTotalTiles++;

      self.moveTile(tile, tile.x, tile.y, true);

      return tile;
   };

   self.createBackgroundTile = function(aStyle) {
      var tile = new Tile(self);
      tile.setStyle(aStyle);
      m_oBackgroundTilesById[m_iTotalBackgroundTiles] = tile;
      tile.setId(m_iTotalBackgroundTiles);
      m_iTotalBackgroundTiles++;
      return tile;
   };

   self.createEndWall = function(x, y) {
      var wall = new Tile(self);
      wall.setStyle(TILE_STYLE.TILE_STONE_SURROUND);
      wall.setPosition(x, y);
      wall.setTrait(TILE_TRAIT.TRAIT_BLOCKING_COMPLETE, true);
      wall.setTrait(TILE_TRAIT.TRAIT_BLOCKING, true);
      wall.setTrait(TILE_TRAIT.TRAIT_MONSTER_BLOCKING, true);
      wall.setTrait(TILE_TRAIT.TRAIT_UNFRAGGABLE, true);
      self.createTile(wall);
   };

   self.createGravel = function(x, y) {
      var wall = new Tile(self);
      wall.setStyle(TILE_STYLE.TILE_GRAVEL);
      wall.setPosition(x, y);
      wall.setTrait(TILE_TRAIT.TRAIT_MONSTER_BLOCKING, true);
      wall.setTrait(TILE_TRAIT.TRAIT_BOMB_INERT, true);
      self.createTile(wall);
   };

   self.createWall = function(x, y) {
      var wall = new Tile(self);
      wall.setStyle(TILE_STYLE.TILE_STONE_IMMOVABLE);
      wall.setPosition(x, y);
      wall.setTrait(TILE_TRAIT.TRAIT_BLOCKING, true);
      wall.setTrait(TILE_TRAIT.TRAIT_STRONG, true);
      self.createTile(wall);

      wall.setOnSuperFrag(() => {
         /*
         self.dropAfterFrag(wall, function(x, y) {
            Util.chances({
               //90 : null,
               4 : function() {
                  new MoneyBlock(self, x, y, 1);
               }
            });
         });
         */
         wall.destroy();
      });
   };

   self.dropAfterFrag = function(tile, fn) {
      var x = tile.x, y = tile.y;
      // Have to set timeout or teh loot will frag
      self.setTimeout(() => fn(x, y), 10);
   };

   self.createDestructibleWall = function(x, y) {
      var wall = new Tile(self);
      wall.setStyle(TILE_STYLE.TILE_STONE_DESTRUCTIBLE);
      wall.setPosition(x, y);
      wall.setTrait(TILE_TRAIT.TRAIT_BLOCKING, true);
      self.createTile(wall);

      wall.setOnFrag(() => {
         self.dropAfterFrag(wall, (x, y) => {
            Util.chances({
               //90 : null,
               4 : function() {
                  new MoneyBlock(self, x, y, 1);
               }
            });
         });
         wall.destroy();
      });
   };

   self.createPortalSet = function(x1, y1, x2, y2) {
      var portal1 = new Portal(self, x1, y1);
      var portal2 = new Portal(self, x2, y2);
      portal1.setSisterPortal(portal2);
      portal2.setSisterPortal(portal1);
   };

   self.deleteTile = function(tile, bFromDifferentCall) {
      if (m_oTileManipulationObserver && !bFromDifferentCall && !tile.getManaged()) {
         m_oTileManipulationObserver.deleteTile(tile);
      }

      // Cancel the animation
      tile.stopAnim();

      // Delete the tile's index by position
      self.deletePos(tile);

      // Delete the tile's index by ID
      delete m_oTileById[tile.getId()];
   };

   self.deletePos = function(tile, x, y) {
      if (x === undefined) x = tile.x;
      if (y === undefined) y = tile.y;

      var aTiles = self.getTilesAtPosition(x, y),
         strId = tile.getId(),
         i = aTiles.length;

      while (i--) {
         if (strId === aTiles[i].getId()) {
            aTiles.splice(i, 1);

            if ((x != tile.xMovingTo) || (y != tile.yMovingTo))
               self.deletePos(tile, tile.xMovingTo, tile.yMovingTo);

            return;
         }
      }
   };

   /**
    * Position an tile at a coordinate
    * @param tile
    * @param x
    * @param y
    */
   self.moveTile = function(tile, x, y, bFromDifferentCall) {
      if (m_oTileManipulationObserver && !bFromDifferentCall && !tile.getManaged()) {
         m_oTileManipulationObserver.moveTile(tile, x, y);
      }

      self.deletePos(tile);

      tile.setOffset(x * TILE_DRAW_SIZE, y * TILE_DRAW_SIZE);
      tile.x = x;
      tile.y = y;

      var iPos = self.getIndexFromPos(x, y);
      if (!m_aTiles[iPos]) { m_aTiles[iPos] = []; };
      m_aTiles[iPos].push(tile);

      var aEntities = m_aTiles[iPos],
         iEntity = aEntities.length,
         tileAtPosition;

      while (iEntity--) {
         tileAtPosition = aEntities[iEntity];
         tileAtPosition.interact(tile);
         tile.interact(tileAtPosition);
      }
   };

   self.moveTileClient = function(iTileId, x, y) {
      var tile = m_oTileById[iTileId];
      self.moveTile(tile, x, y);
   };

   self.animMoveTileClient = function(iTileId, x, y, speed) {
      var tile = m_oTileById[iTileId];
      self.animMoveTile(tile, x, y, speed);
   };

   self.deleteTileClient = function (iTileId) {
      var tile = m_oTileById[iTileId];
      self.deleteTile(tile);
   };

   self.animMoveTile = function(tile, x, y, speed, fnCallback) {
      if (m_oTileManipulationObserver && !tile.getManaged()) {
         m_oTileManipulationObserver.animMoveTile(tile, x, y, speed);
      }

      // Get the new position, in pixels
      var iStartX = tile.getOffsetLeft(),
         iStartY = tile.getOffsetTop(),
         iEndX = (x * TILE_DRAW_SIZE).toString(),
         iEndY = (y * TILE_DRAW_SIZE).toString(),
         iDeltaX = iEndX - iStartX,
         iDeltaY = iEndY - iStartY;

      tile.xMovingTo = x;
      tile.yMovingTo = y;

      var iPos = self.getIndexFromPos(x, y);
      if (!m_aTiles[iPos]) { m_aTiles[iPos] = []; };
      m_aTiles[iPos].push(tile);

      var anim = Util.anim(self, {
         end: 1,
         duration: speed,
         easing: "easeOutQuad",
         step: function (i) {
            if (tile.isDestroyed()) return;

            var xNew = Math.floor(iStartX + (iDeltaX * i)),
               yNew = Math.floor(iStartY + (iDeltaY * i));

            tile.setOffset(xNew, yNew);
         },
         complete: function () {
            self.moveTile(tile, x, y, true);
            if (fnCallback) fnCallback();
         }
      });

      tile.setAnim(anim);
   };

   self.createTileRect = function(rectDimensions, fnCallback) {
      var outerWidth = rectDimensions.getOuterWidth(),
         outerHeight = rectDimensions.getOuterHeight(),
         xStart = rectDimensions.getLeft(),
         yStart = rectDimensions.getTop();

      for (var x = 0; x <= outerWidth; x++) {
         fnCallback(xStart + x, yStart);
         fnCallback(xStart + x, yStart + outerHeight);
      }

      for (var y = 1; y < outerHeight; y++) {
         fnCallback(xStart, yStart + y);
         fnCallback(xStart + outerWidth, yStart + y);
      }
   };

   self.getTiles = function () {
      return m_oTileById;
   };

   self.blinkPlayer = function (id) {
      var tile = m_oTileById[id];
      tile.setStyle(TILE_STYLE.TILE_QUTE_BUMP);
      self.setTimeout(() => tile.setStyle(TILE_STYLE.TILE_QUTE), 100);
   };

   self.getTile = function (id) {
      return m_oTileById[id];
   };

   self.toJson = function () {
      var oTileById = {};

      each(m_oTileById, (strTileId, tile) => {
         var oTile = tile.toJson();
         oTileById[strTileId] = oTile;
      });

      return oTileById;
   };

   self.fromJson = function (json) {
      each(json, (strTileId, oTile) => {
         var tile = new Tile(self);
         tile.fromJson(oTile);

         m_oTileById[strTileId] = tile;
         m_iTotalTiles++;

         self.moveTile(tile, tile.x, tile.y, true);
      });
   };
};

export default World;
