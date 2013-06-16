StoreControl = function() {
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

      addAvailableItems = function(oList) {
         each(oList, function(iItemId, storeItem) {
            var itemInfo = storeItem.itemInfo;

            m_observer.onAddItem(iItemId, storeItem);

            if (itemInfo.price === PRICE_PLAYER_STARTING_ITEM) {
               self.tryBuyItem(iItemId, storeItem);
            }
         });
      };

   self.tryBuyItem = function(iItemId, storeItem) {
      var iPrice = storeItem.itemInfo.price;

      if (m_moneyControl.hasMoney(iPrice)) {
         m_moneyControl.modifyMoney(-iPrice);
         onBuyItem(iItemId, storeItem);
         return true;
      } else {
         return false;
      }
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
