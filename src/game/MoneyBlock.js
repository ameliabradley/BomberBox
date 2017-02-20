import Tile from './Tile.js';
import { TILE_STYLE } from './const.js';

/**
 * @param world
 * @param x
 * @param y
 */
const MoneyBlock = function(world, x, y, iAmount) {
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

export default MoneyBlock;
