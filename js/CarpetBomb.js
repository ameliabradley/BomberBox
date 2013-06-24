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
 * Carpet Bomb
 * @param world
 * @param x
 * @param y
 * @param timeout the seconds until BOOM
 * @param radius the distance the bomb fragments will travel
 * @param fnCallback function to call after explosion
 */
CarpetBomb = function(world, x, y, timeout, radius, fnCallback) {
   var self = this,

      m_bombBase = new BombBase(world, x, y, timeout, radius, fnCallback),

      tryFrag = function (x, y) {
         new BombFragment(world, x, y, true);
      },
      
      onExplode = function () {
         var iRadius;

         new BombFragment(world, x, y);

         for (var i = 0; i < radius; i++) {
            iRadius = i + 1;
            world.setTimeout((function(iRadius) {
               return function() {
                  // Currently will go through walls
                  var size = (iRadius * 2),
                     rectDimensions = new RectDimensions(x - iRadius, y - iRadius, size, size);

                  world.createTileRect(rectDimensions, tryFrag);
               }
            }(iRadius)), 100 * iRadius);
         }
      };

   m_bombBase.deploy(onExplode);
};
