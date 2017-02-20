import Tile from 'game/entities/Tile';
import { TILE_TRAIT, TILE_STYLE } from 'game/const';

/**
 * Little exploding aftermath that bombs tend to leave
 * @param world
 * @param x
 * @param y
 */
const BombFragment = function(world, x, y, bSuper) {
   if (world.locationHasTraits(x, y, [TILE_TRAIT.TRAIT_BOMB_INERT])) return;

   var self = this,
      m_tile = new Tile(world);

   m_tile.setStyle(TILE_STYLE.TILE_EXPLOSION_ORANGE);
   m_tile.setPosition(x, y);
   world.createTile(m_tile);

   world.runEventAtPosition('frag', x, y);
   world.runEventAtPosition('superFrag', x, y);

   world.setTimeout(() => {
      m_tile.setStyle(TILE_STYLE.TILE_EXPLOSION_YELLOW);
      world.setTimeout(() => m_tile.destroy(), 100);
   }, 100);
};

export default BombFragment;
