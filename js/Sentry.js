/**
 * Dumb AI that walks around
 */
var Sentry = function(world, x, y) {
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

   m_tile.friendlyWith = function(tile) {
      if (tile.dieBy) tile.dieBy('Sentry');
   }

   wanderingEntity.startMoving();
};
