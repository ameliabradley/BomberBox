/**
 * Carpet Bomb
 * @param world
 * @param x
 * @param y
 * @param timeout the seconds until BOOM
 * @param radius the distance the bomb fragments will travel
 * @param fnCallback function to call after explosion
 */
var CarpetBomb = function(world, x, y, timeout, radius, fnCallback) {
   var self = this,

      m_bombBase = new BombBase(world, x, y, timeout, radius, fnCallback),

      tryFrag = function () {
         new BombFragment(world, x, y, true);
      },
      
      onExplode = function () {
         new BombFragment(world, x, y);

         for (var i = 0; i < radius; i++) {
            var iRadius = i + 1;
            world.setTimeout((function(iRadius) {
               return function() {
                  // Currently will go through walls
                  var size = (iRadius * 2);
                  var rectDimensions = new RectDimensions(x - iRadius, y - iRadius, size, size);
                  world.createTileRect(rectDimensions, tryFrag);
               }
            }(iRadius)), 100 * iRadius);
         }
      };

   m_bombBase.deploy(onExplode);
};
