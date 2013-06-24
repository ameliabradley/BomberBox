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
 * Little exploding aftermath that bombs tend to leave
 * @param world
 * @param x
 * @param y
 */
BombFragment = function(world, x, y, bSuper) {
   if (world.locationHasTraits(x, y, [TILE_TRAIT.TRAIT_BOMB_INERT])) return;

   var self = this,
      m_tile = new Tile(world);
   
   m_tile.setStyle(TILE_STYLE.TILE_EXPLOSION_ORANGE);
   m_tile.setPosition(x, y);
   world.createTile(m_tile);

   world.runEventAtPosition('frag', x, y);
   world.runEventAtPosition('superFrag', x, y);

   world.setTimeout(function() {
      m_tile.setStyle(TILE_STYLE.TILE_EXPLOSION_YELLOW);
      world.setTimeout(function() {
         m_tile.destroy();
      }, 100);
   }, 100);
}
