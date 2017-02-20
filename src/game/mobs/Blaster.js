import Tile from 'game/entities/Tile';
import WanderingEntity from 'game/mobs/WanderingEntity';
import CountDown from 'game/CountDown';
import Util from 'game/util';
import BombFragment from 'game/entities/BombFragment';
import MoneyBlock from 'game/entities/MoneyBlock';

import {
  TILE_STYLE,
  TILE_TRAIT,
} from 'game/const';

/**
 * Dumb AI that walks around
 */
const Blaster = function (world, x, y) {
   var self = this,
      m_tile = new Tile(world),
      wanderingEntity = new WanderingEntity(world, m_tile),

      m_bTicking = false,
      m_iTimeout = 3,

      m_iBombRadius = 10,

      startTicking = function() {
         m_bTicking = true;

         var countDown = new CountDown((i) => {
            if (i == m_iTimeout) {
               self.explode();
               return;
            };

            self.tick();
            m_tile.setText((m_iTimeout - i).toString());
         }, world.setTimeout, 1000, m_iTimeout, 1);

         if (countDown) countDown.start();
      };

   m_tile.setStyle(TILE_STYLE.TILE_BLASTER);
   m_tile.setPosition(x, y),
   world.createTile(m_tile);

   self.tryFrag = function(x, y) {
      var aTiles = world.getTilesAtPosition(x, y),
         iTotalTiles = aTiles.length,
         bHasEntities = (iTotalTiles != 0),
         iTraitUnfraggable = TILE_TRAIT.TRAIT_UNFRAGGABLE;

      while (iTotalTiles--) {
         if (aTiles[iTotalTiles].getTrait(iTraitUnfraggable)) return false;
      }

      new BombFragment(world, x, y);
      return (!bHasEntities);
   };

   self.explode = function() {
      self.onExplode(m_tile.x, m_tile.y, m_iBombRadius);
      m_tile.setStyle(TILE_STYLE.TILE_BLASTER);
      m_tile.setText("");

      m_bTicking = false;

      setTimeout(() => wanderingEntity.runAmok(), 100);
   }

   self.onExplode = function(x, y, iMaxRadius) {
      for (var i = 0; i < iMaxRadius; i++) {
         var iRadius = i + 1,
            bWest = true, bEast = true, bNorth = true, bSouth = true;

         world.setTimeout((function(iRadius) {
            return function() {
               if (!bWest || !self.tryFrag(x - iRadius, y)) bWest = false;
               if (!bEast || !self.tryFrag(x + iRadius, y)) bEast = false;
               if (!bNorth || !self.tryFrag(x, y - iRadius)) bNorth = false;
               if (!bSouth || !self.tryFrag(x, y + iRadius)) bSouth = false;
            }
         }(iRadius)), 100 * iRadius);
      }
   };

   self.tick = function() {
      m_tile.setStyle(TILE_STYLE.TILE_TIMEDMINE_RED);
      world.setTimeout(() => m_tile.setStyle(TILE_STYLE.TILE_TIMEDMINE), 300);
   }

   m_tile.setOnFrag(() => {
      if (m_bTicking) return;

      world.dropAfterFrag(m_tile, (x, y) => {
         Util.chances({
            10 : null,
            1 : function() {
               new MoneyBlock(world, x, y, 1);
            }
         });
      });
      m_tile.destroy();
   });

   m_tile.setInteract((tile) => {
      if (tile.dieBy) tile.dieBy('Sentry');
   });

   self.runAmok = function() {
      if (m_bTicking) return;

      wanderingEntity.setTickSpeed(100);
      Util.chances({
         20: function() {
            wanderingEntity.runAmok();
         },
         1: function() {
            startTicking();
         }
      });
   };

   wanderingEntity.startMoving(self.runAmok);
};

export default Blaster;
