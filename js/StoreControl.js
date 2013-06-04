StoreControl = function() {
   var self = this,
      m_player,

      m_oPurchasedItems = {},
      m_oFnOnPurchase = {},
      m_interfaceElements = {};

   this.tryBuyItem = function(strId, storeItem) {
      var iPrice = storeItem.itemInfo.price,
         moneyControl = m_player.getMoneyControl();

      if (moneyControl.hasMoney(iPrice)) {
         moneyControl.modifyMoney(-iPrice);
         m_oFnOnPurchase[strId]();
      }
   };

   this.addClick = function(jItem, strId, storeItem) {
      jItem.hammer({ prevent_default: true }).bind("tap", function() {
         self.tryBuyItem(strId, storeItem);
      });
   }

   this.onBuyWeapon = function(strId, storeInfo) {
      m_player.addWeapon(strId);
   }

   this.onBuyWeaponMod = function(strId, storeInfo) {
      m_player.getWeaponSlotControl().upgradeWeapon(storeInfo.weaponModInfo.forWeapon, storeInfo);
   };

   this.onBuyPlayerUpgrade = function(strId, storeInfo) {
      var upgrade = storeInfo.playerUpgradeInfo;
      if (upgrade.addEnergy) {
         var energyManager = m_player.getEnergyManager(),
            iMax = energyManager.getMax();

         energyManager.setMax(iMax + upgrade.addEnergy);
      }
   };

   this.onBuyBombMod = function(strId, storeInfo) {
   };

   this.addList = function(oList) {
      each(oList, function(strId, storeItem) {
         var fnOnBuy, itemInfo = storeItem.itemInfo;

         switch (itemInfo.type) {
            case ITEM_TYPE.TYPE_WEAPON:
               fnOnBuy = self.onBuyWeapon;
               break;

            case ITEM_TYPE.TYPE_WEAPON_MOD:
               fnOnBuy = self.onBuyWeaponMod;
               break;

            case ITEM_TYPE.TYPE_PLAYER_UPGRADE:
               fnOnBuy = self.onBuyPlayerUpgrade;
               break;

            case ITEM_TYPE.TYPE_BOMB_MOD:
               fnOnBuy = self.onBuyBombMod;
               break;
         }

         /*
         var bRequirementsMet = true;
         if (oInfo.requires) {
            each(oInfo.requires, function(i, strRequiresName) {
               if (!m_oPurchasedItems[strRequiresName]) {
                  bRequirementsMet = false;
                  return false;
               }
            });
         }

         if (!bRequirementsMet) return;
         */

         m_oFnOnPurchase[strId] = function() {
            //self.purchaseInterfaceItem(strId);

            // Add items that require this item
            m_oPurchasedItems[strId] = storeItem;

            // Upgrade player weapon
            fnOnBuy(strId, storeItem);
         };

         if (itemInfo.price === PRICE_PLAYER_STARTING_ITEM) {
            self.tryBuyItem(strId, storeItem);
         }
      });
   }

   this.initialize = function(player) {
      m_player = player;

      self.addList(PLAYER_ITEMS);
   };
};
