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

BombDeployer = function() {
   var self = this,
      m_weapon = new Weapon(),
      m_iTimeout = 3,
      m_iBombRadius = 1;

   self.getWeapon = function() {
      return m_weapon;
   };

   self.initialize = function(world) {
      m_weapon.initialize(world, WEAPON_BOMB, {
         useWeapon: function(iX, iY) {
            new Bomb(world, iX, iY, m_iTimeout, m_iBombRadius);
         },

         canUse: function(iX, iY) {
            return !world.locationHasTraits(iX, iY, [TILE_TRAIT.TRAIT_BOMB_INERT]);
         },

         upgrade: function(upgrade) {
            var upgrade = upgrade.bombUpgradeInfo;
            if (!upgrade) return;

            if (upgrade.timeout) {
               m_iTimeout = upgrade.timeout;
            }

            if (upgrade.radius) {
               m_iBombRadius = upgrade.radius;
            }
         }
      });
   };
};
