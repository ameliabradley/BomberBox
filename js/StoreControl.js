StoreControl = function() {
   "use strict";

   var self = this,

      m_moneyControl,
      m_oPurchasedItems = {},
      m_observer,

      onBuyItem = function(iItemId, storeItem) {
         // Weapon Upgrad
         //m_player.getWeaponSlotControl().upgradeWeapon(storeInfo.weaponModInfo.forWeapon, storeInfo);

         // Player Upgrade
         /*
         var upgrade = storeInfo.playerUpgradeInfo;
         if (upgrade.addEnergy) {
            var energyManager = m_player.getEnergyManager(),
               iMax = energyManager.getMax();

            energyManager.setMax(iMax + upgrade.addEnergy);
         }
         */
         m_observer.onBuyItem(iItemId, storeItem);
         m_oPurchasedItems[iItemId] = storeItem;
      },

      onSellItem = function (iItemId, storeItem) {
         m_observer.onSellItem(iItemId, storeItem);
         delete m_oPurchasedItems[iItemId];
      },

      addAvailableItems = function (alist) {
         each(alist, function(iItemId, storeItem) {
            var itemInfo = storeItem.itemInfo;

            m_observer.onAddItem(iItemId, storeItem);

            if (itemInfo.price === PRICE_PLAYER_STARTING_ITEM) {
               self.tryBuyItem(iItemId, storeItem);
            }
         });
      };

   /**
    * Tries to buy the item with the specified item ID
    * Does not trust input to be valid
    */
   self.tryBuyItem = function (iItemId) {
      var storeItem,
         iPrice,
         bOwned = m_oPurchasedItems[iItemId];

      if (bOwned) {
         return PURCHASE_ERROR_ITEM_ALREADY_OWNED;
      }

      storeItem = PLAYER_ITEMS[iItemId];
      iPrice = storeItem.itemInfo.price;

      if (m_moneyControl.hasMoney(iPrice)) {
         m_moneyControl.modifyMoney(-iPrice);
         onBuyItem(iItemId, storeItem);
         return PURCHASE_SUCCESS;
      } else {
         return PURCHASE_ERROR_INSUFFICIENT_FUNDS;
      }
   };

   self.trySellItem = function (iItemId) {
      var storeItem,
         iPrice,
         bOwned = m_oPurchasedItems[iItemId];

      if (!bOwned) {
         return SELL_ERROR_ITEM_NOT_OWNED;
      }

      storeItem = PLAYER_ITEMS[iItemId];
      iPrice = storeItem.itemInfo.price;

      m_moneyControl.modifyMoney(iPrice);
      onSellItem(iItemId, storeItem);
      return SELL_SUCCESS;
   };

   self.isPurchased = function (iItemId) {
      return (m_oPurchasedItems[iItemId] !== undefined);
   };

   self.getPurchasedItems = function () {
      return m_oPurchasedItems;
   };

   self.initialize = function (moneyControl, observer) {
      m_moneyControl = moneyControl;
      m_observer = observer;
      addAvailableItems(PLAYER_ITEMS);
   };
};
