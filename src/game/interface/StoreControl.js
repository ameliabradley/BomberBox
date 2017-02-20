import { Util, each } from 'game/util';
import {
  PRICE_PLAYER_STARTING_ITEM,
  PURCHASE_ERROR_INSUFFICIENT_FUNDS,
  PURCHASE_ERROR_ITEM_ALREADY_OWNED,
  PURCHASE_SUCCESS,
  SELL_SUCCESS,
  PLAYER_ITEMS,
  SELL_ERROR_ITEM_NOT_OWNED,
} from 'game/const';

const StoreControl = function() {
   "use strict";

   var self = this,

      m_itemManager,
      m_moneyControl,
      m_oPurchasedItems = {},
      m_observer,

      onBuyItem = function(iItemId, item) {
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
         m_observer.onBuyItem(iItemId, item);
         m_oPurchasedItems[iItemId] = item;
      },

      onSellItem = function (iItemId, item) {
         m_observer.onSellItem(iItemId, item);
         delete m_oPurchasedItems[iItemId];
      },

      addAvailableItems = function (alist) {
         each(alist, (i, item) => {
            var iItemId = item.id;

            m_observer.onAddItem(iItemId, item);

            if (item.price === PRICE_PLAYER_STARTING_ITEM) {
               self.tryBuyItem(iItemId, item);
            }
         });
      };

   /**
    * Tries to buy the item with the specified item ID
    * Does not trust input to be valid
    */
   self.tryBuyItem = function (iItemId) {
      var item,
         iPrice,
         bOwned = m_oPurchasedItems[iItemId];

      if (bOwned) {
         return PURCHASE_ERROR_ITEM_ALREADY_OWNED;
      }

      // TODO: Make sure we're not trying to buy a mod that
      // the player does not own the weapon for
      item = m_itemManager.getItemById(iItemId);
      iPrice = item.price;

      if (m_moneyControl.hasMoney(iPrice)) {
         m_moneyControl.modifyMoney(-iPrice);
         onBuyItem(iItemId, item);
         return PURCHASE_SUCCESS;
      } else {
         return PURCHASE_ERROR_INSUFFICIENT_FUNDS;
      }
   };

   self.trySellItem = function (iItemId) {
      var item,
         iPrice,
         bOwned = m_oPurchasedItems[iItemId];

      if (!bOwned) {
         return SELL_ERROR_ITEM_NOT_OWNED;
      }

      // TODO: Sell all mods with any given weapon
      item = m_itemManager.getItemById(iItemId);
      iPrice = item.price;

      m_moneyControl.modifyMoney(iPrice);
      onSellItem(iItemId, item);
      return SELL_SUCCESS;
   };

   self.isPurchased = function (iItemId) {
      return (m_oPurchasedItems[iItemId] !== undefined);
   };

   self.getPurchasedItems = function () {
      return m_oPurchasedItems;
   };

   self.initialize = function (itemManager, moneyControl, observer) {
      m_itemManager = itemManager;
      m_moneyControl = moneyControl;
      m_observer = observer;
      addAvailableItems(PLAYER_ITEMS);
   };
};

export default StoreControl;
