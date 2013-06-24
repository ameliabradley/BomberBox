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
ItemManager = function() {
   "use strict";

   var self = this,

      m_oItemById = {},

      addAvailableItems = function (alist) {
         each(alist, function(i, item) {
            var aMods = item.mods,
               iItemId = item.id;

            m_oItemById[iItemId] = item;

            if (aMods) {
               each(aMods, function (i, mod) {
                  m_oItemById[mod.id] = mod;
               });
            }
         });
      },

      initialize = function () {
         addAvailableItems(PLAYER_ITEMS);
      };

   self.getItemById = function (iItemId) {
      return m_oItemById[iItemId];
   };

   initialize();
};
