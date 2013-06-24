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
 * Dumb AI that walks around
 */
Sentry = function(world, x, y) {
   var self = this,
      m_tile = new Tile(world),
      wanderingEntity = new WanderingEntity(world, m_tile);

   m_tile.setStyle(TILE_STYLE.TILE_ZOMB);
   m_tile.setPosition(x, y),
   world.createTile(m_tile);

   m_tile.setOnFrag(function() {
      world.dropAfterFrag(m_tile, function(x, y) {
         Util.chances({
            80 : null,
            1 : function() {
               new MoneyBlock(world, x, y, 1);
            }
         });
      });
      m_tile.destroy();
   });

   m_tile.setInteract(function(tile) {
      if (tile.dieBy) tile.dieBy('Sentry');
   });

   wanderingEntity.startMoving();
};
