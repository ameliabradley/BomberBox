import Tile from 'game/entities/Tile';
import WanderingEntity from 'game/mobs/WanderingEntity';
import MoneyBlock from 'game/entities/MoneyBlock';
import Util from 'game/util';
import { TILE_STYLE, } from 'game/const'

/**
 * Dumb AI that walks around
 */
const Sentry = function(world, x, y) {
   var self = this,
      m_tile = new Tile(world),
      wanderingEntity = new WanderingEntity(world, m_tile);

   m_tile.setStyle(TILE_STYLE.TILE_ZOMB);
   m_tile.setPosition(x, y),
   world.createTile(m_tile);

   m_tile.setOnFrag(() => {
      world.dropAfterFrag(m_tile, (x, y) => {
         Util.chances({
            80 : null,
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

   wanderingEntity.startMoving();
};

export default Sentry;
