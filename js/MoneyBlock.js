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
 * @param world
 * @param x
 * @param y
 */
MoneyBlock = function(world, x, y, iAmount) {
   var self = this,
      m_tile = new Tile(world);
   
   m_tile.setStyle(TILE_STYLE.TILE_GOLD);
   m_tile.setPosition(x, y);
   m_tile.setText(iAmount.toString());
   world.createTile(m_tile);

   m_tile.setInteract(function(e) {
      if (e.eatMoney) {
         e.eatMoney(iAmount);
         m_tile.destroy();
      }
   });
};
