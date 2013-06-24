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

/**
 * Dumb AI that walks around, but charges if it sees player
 */
Charger = function(world, x, y) {
   var self = this,
      m_tile = new Tile(world),
      wanderingEntity = new WanderingEntity(world, m_tile),
      iTimoutFast = 450,
      iTimeoutSlow = 900,
      m_aLastSeenPath;

   m_tile.setStyle(TILE_STYLE.TILE_CHARGER);
   m_tile.setPosition(x, y);
   world.createTile(m_tile);

   m_tile.setOnFrag(function() {
      world.dropAfterFrag(m_tile, function(x, y) {
         Util.chances({
            1 : function() {
               new MoneyBlock(world, x, y, 3);
            },
            2 : function() {
               new MoneyBlock(world, x, y, 2);
            }
         });
      });
      m_tile.destroy();
   });

   m_tile.setInteract(function(tile) {
      if (tile.dieBy) tile.dieBy('Charger');
   });

   self.runAmok = function() {
      if (m_tile.isDestroyed()) return;

      var iRadius = 5,
         path = Util.pathfind(world, TILE_TRAIT.TRAIT_PLAYER,
            [TILE_TRAIT.TRAIT_BLOCKING, TILE_TRAIT.TRAIT_MONSTER_BLOCKING],
            [false, false, false],
            iRadius, m_tile.x, m_tile.y),
         nextMove;

      if (path) {
         m_aLastSeenPath = path.splice(1);
         nextMove = world.getPosFromIndex(m_aLastSeenPath.splice(0,1));
      } else if (m_aLastSeenPath) {
         nextMove = world.getPosFromIndex(m_aLastSeenPath.splice(0,1));
         if (!wanderingEntity.getMovesAtPosition(nextMove[0], nextMove[1])) {
            m_aLastSeenPath = null;
         }
      }

      if (m_aLastSeenPath) {
         wanderingEntity.setTickSpeed(iTimoutFast);
         wanderingEntity.move(nextMove[0], nextMove[1], 200);
         m_tile.setStyle(TILE_STYLE.TILE_CHARGER_RED);

         if (m_aLastSeenPath.length == 0) {
            m_aLastSeenPath = null;
         }
      } else {
         wanderingEntity.setTickSpeed(iTimeoutSlow);
         m_tile.setStyle(TILE_STYLE.TILE_CHARGER);
         wanderingEntity.runAmok();
      }
   };

   wanderingEntity.startMoving(self.runAmok);
};
