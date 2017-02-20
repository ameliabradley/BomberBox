import { each } from 'game/util';
import { PLAYER_ITEMS } from 'game/const';

const ItemManager = function() {
   "use strict";

   var self = this,

      m_oItemById = {},

      addAvailableItems = function (alist) {
         each(alist, (i, item) => {
            var aMods = item.mods,
               iItemId = item.id;

            m_oItemById[iItemId] = item;

            if (aMods) {
               each(aMods, (i, mod) => {
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

export default ItemManager;
