/**
 * A bomb. That explodes.
 * @param world
 * @param x
 * @param y
 * @param timeout the seconds until BOOM
 * @param radius the distance the bomb fragments will travel
 * @param fnCallback function to call after explosion
 */
Bomb = function(world, x, y, timeout, radius, fnCallback) {
   var self = this,
      m_bombBase = new BombBase(world, x, y, timeout, radius, fnCallback);

   self.tryFrag = function(x, y) {
      var aTiles = world.getTilesAtPosition(x, y),
         iTotalTiles = aTiles.length,
         bHasEntities = (iTotalTiles != 0);

      if (world.locationHasTraits(x, y, [TILE_TRAIT.TRAIT_STRONG, TILE_TRAIT.TRAIT_UNFRAGGABLE])) {
         return false;
      }

      new BombFragment(world, x, y);
      return (!bHasEntities);
   };

   self.onExplode = function() {
      var i = radius;

      new BombFragment(world, x, y);

      while (i--) {
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

   m_bombBase.deploy(self.onExplode);
};
