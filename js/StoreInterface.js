StoreInterface = function () {
   "use strict";

   var self = this,

      m_jBuyTab,
      m_jBuyBody,
      m_jBuyBottom,
      m_iBuyPrice = 0,

      m_jSellTab,
      m_jSellBody,
      m_jSellBottom,
      m_iSellPrice = 0,

      m_jStoreItemTemplate,
      m_jStoreModTemplate,

      m_storeControl,
      m_moneyControl,

      m_observer,

      initializeBuyTab = function () {
         m_jBuyBottom = $("#sidebarBuyBottom");
         m_jBuyBody = $("#bodyBuy");
         m_jBuyTab = $("#tabBuy");

         var jFinishButton = m_jBuyBottom.find(".btnFinish"),
            jNothingSelected = m_jBuyBottom.find(".storeNothingSelected"),
            jSomethingSelected = m_jBuyBottom.find(".storeSomethingSelected"),
            jTotalGold = m_jBuyBottom.find(".totalText"),
            iTotal = 0;

         m_checkListBuy.initialize(function (iPrice) {
            var aCheckedItems = m_checkListBuy.getCheckedItems();

            iTotal += iPrice;
            jTotalGold.text(iTotal);

            if (aCheckedItems.length === 0) {
               jNothingSelected.show();
               jSomethingSelected.hide();
            } else {
               jNothingSelected.hide();
               jSomethingSelected.show();
               if (m_moneyControl.hasMoney(iTotal)) {
                  jFinishButton.removeClass("disabled").text("Buy");
               } else {
                  jFinishButton.addClass("disabled").text("Not Enough");
               }
            }
         });

         jFinishButton.click(function () {
            if (jFinishButton.hasClass("disabled")) return;

            var aCheckedItems = m_checkListBuy.getCheckedItems(),
               aItemIds = [];

            each(aCheckedItems, function (i, checkableItem) {
               var iItemId = checkableItem.getInfo().id;
               aItemIds.push(iItemId);
            });

            // TODO: Show loading indicator
            m_observer.onBuy(aItemIds);
         });
      },

      initializeSellTab = function () {
         m_jSellBody = $("#bodySell");
         m_jSellTab = $("#tabSell");
         m_jSellBottom = $("#sidebarSellBottom");

         var jFinishButton = m_jSellBottom.find(".btnFinish"),
            jNothingSelected = m_jSellBottom.find(".storeNothingSelected"),
            jSomethingSelected = m_jSellBottom.find(".storeSomethingSelected"),
            jTotalGold = m_jSellBottom.find(".totalText"),
            iTotal = 0;

         m_checkListSell.initialize(function (iPrice) {
            var aCheckedItems = m_checkListSell.getCheckedItems();

            m_iSellPrice += iPrice;
            jTotalGold.text(m_iSellPrice);

            if (aCheckedItems.length === 0) {
               jNothingSelected.show();
               jSomethingSelected.hide();
            } else {
               jNothingSelected.hide();
               jSomethingSelected.show();
               jFinishButton.removeClass("disabled");
            }
         });

         jFinishButton.click(function () {
            if (jFinishButton.hasClass("disabled")) return;

            var aCheckedItems = m_checkListSell.getCheckedItems(),
               aItemIds = [];

            each(aCheckedItems, function (i, checkableItem) {
               var iItemId = checkableItem.getInfo().id;
               aItemIds.push(iItemId);
            });

            m_observer.onSell(aItemIds);
         });
      },

      formatPrice = function (iPrice) {
         return iPrice.toString() + " G";
      },

      CheckList = function () {
         var self = this,
            m_aCheckedItems = [],
            m_oCheckableItemsById = {},
            m_fnModifyMoney,

            checkItem = function (checkableItem) {
               m_aCheckedItems.push(checkableItem);
            },

            uncheckItem = function (checkableItem) {
               var i = m_aCheckedItems.indexOf(checkableItem);
               m_aCheckedItems.splice(i, 1);
            },
            
            initialize = function (fnModifyMoney) {
               m_fnModifyMoney = fnModifyMoney;
            };

         self.addItem = function (id, item) {
            var checkableItem = new CheckableItem();
            checkableItem.initialize(item);
            checkableItem.addObserver({
               check: checkItem,
               uncheck: uncheckItem
            });
            m_oCheckableItemsById[id] = checkableItem;
            return checkableItem;
         };

         self.getItem = function (id) {
            return m_oCheckableItemsById[id];
         };

         self.modifyPrice = function (iPrice) {
            m_fnModifyMoney(iPrice);
         };

         self.uncheckAll = function () {
            each(m_oCheckableItemsById, function (id, item) {
               item.uncheck();
            });
         };

         self.removeItem = function (id) {
            var item = m_oCheckableItemsById[id];
            item.uncheck();
            item.remove();
            delete m_oCheckableItemsById[id];
         };

         self.getCheckedItems = function () {
            return m_aCheckedItems;
         };

         self.initialize = initialize;
      },

      CheckableItem = function () {
         var self = this,
            m_aObservers = [],
            m_jItem,
            m_info,
            m_checkTrackerListener,
            m_bChecked = false,
            m_bDisabled = false,

            initialize = function (info) {
               m_info = info;
            };

         self.addObserver = function (observer) {
            m_aObservers.push(observer);
         };
         
         self.check = function () {
            if (m_bDisabled || m_bChecked) return;
            m_bChecked = true;
            each(m_aObservers, function (i, observer) {
               if (observer.check) observer.check(self);
            });
         };

         self.uncheck = function () {
            if (m_bDisabled || !m_bChecked) return;
            m_bChecked = false;
            each(m_aObservers, function (i, observer) {
               if (observer.uncheck) observer.uncheck(self);
            });
         };

         self.remove = function () {
            each(m_aObservers, function (i, observer) {
               if (observer.remove) observer.remove(self);
            });
         };

         self.isChecked = function () {
            return m_bChecked;
         };

         self.disable = function () {
            if (m_bDisabled) return;
            self.uncheck();
            m_bDisabled = true;
            each(m_aObservers, function (i, observer) {
               if (observer.disable) observer.disable(self);
            });
         };

         self.enable = function () {
            if (!m_bDisabled) return;
            m_bDisabled = false;
            each(m_aObservers, function (i, observer) {
               if (observer.enable) observer.enable(self);
            });
         };

         self.toggleCheck = function () {
            if (self.isChecked()) {
               self.uncheck();
            } else {
               self.check();
            }
         };

         self.getInfo = function () {
            return m_info;
         };

         self.initialize = initialize;
      },

      m_checkListBuy = new CheckList(),
      m_checkListSell = new CheckList(),

      addMods = function (jItem, jBtnMods, oMods, fnCheck) {
         // TODO: Mods
         /*
         var jMods = $("<div class='mods' />"),
            aMods = [];

         $.each(oMods, function (i, oMod) {
            var jMod = m_jStoreModTemplate.clone(),
               strTitle = oMod.name,
               jMain = jMod.find(".main"),
               iPrice = oMod.price,
               m_checkableItem = m_checkList.addItem(oMod);

            m_checkableItem.addObserver({
               check: function () {
                  jMod.addClass("selected");
                  modifyPrice(iPrice);
                  fnCheck();
               },
               uncheck: function () {
                  jMod.removeClass("selected");
                  modifyPrice(-iPrice);
               }
            });

            jMod.find(".title").text(strTitle);
            jMod.find(".cost").text(formatPrice(iPrice));

            jMain.click(m_checkableItem.toggleCheck);
            
            jMods.append(jMod);
            aMods.push({
               uncheck: function () {
                  uncheck();
               }
            });
         });

         jBtnMods.click(function () {
            jMods.slideToggle({
               duration: 300
            });

            jItem.toggleClass("expanded");
         });

         m_jBuyBody.append(jMods);

         return aMods;
         */
      },

      Weapon = function () {
         var self = this,
            m_checkableItem = new CheckableItem(),
            initialize = function () {
               m_checkableItem.initialize();
            };
      },

      addStoreItem = function (jList, checkList, o) {
         var jItem = m_jStoreItemTemplate.clone(),
            strTitle = o.name,
            iPrice = o.price,
            strStoreDesc = o.description,
            oMods = o.mods,
            jBtnMods = jItem.find(".btnMods"),
            jMain = jItem.find(".main"),
            aMods,
            checkableItem = checkList.addItem(o.id, o);

         checkableItem.addObserver({
            check: function () {
               jItem.addClass("selected");
               checkList.modifyPrice(iPrice);
            },
            uncheck: function () {
               jItem.removeClass("selected");
               checkList.modifyPrice(-iPrice);

               if (aMods) {
                  $.each(aMods, function (i, mod) {
                     mod.uncheck();
                  });
               }
            },
            remove: function () {
               jItem.remove();
            },
            enable: function () {
               jItem.removeClass("disabled");
            },
            disable: function () {
               jItem.addClass("disabled");
            }
         });

         jItem.show();
         jItem.find(".title").text(strTitle);
         jItem.find(".subtitle").text(strStoreDesc);
         jItem.find(".cost").text(formatPrice(iPrice));

         jMain.click(checkableItem.toggleCheck);

         jList.append(jItem);

         if (oMods && oMods.length) {
            aMods = addMods(jItem, jBtnMods, oMods, function () {
               checkableItem.check();
            });
         } else {
            jBtnMods.hide();
         }
      };

   self.setObserver = function (observer) {
      m_observer = observer;
   };

   self.buyItemsSuccess = function (aItemIds) {
      each(aItemIds, function (i, iItemId) {
         var storeInfo = PLAYER_ITEMS[iItemId],
            itemInfo = storeInfo.itemInfo;

         addStoreItem(m_jSellBody, m_checkListSell, itemInfo);
         m_checkListBuy.getItem(iItemId).disable();
      });

      m_checkListBuy.uncheckAll();
   };

   self.sellItemsSuccess = function (aItemIds) {
      each(aItemIds, function (i, iItemId) {
         var storeInfo = PLAYER_ITEMS[iItemId],
            itemInfo = storeInfo.itemInfo;

         //addStoreItem(m_jBuyBody, m_checkListBuy, itemInfo);
         m_checkListBuy.getItem(iItemId).enable();
         m_checkListSell.removeItem(iItemId);
      });

      m_checkListSell.uncheckAll();
   };

   self.initialize = function (moneyControl) {
      initializeBuyTab();
      initializeSellTab();

      m_jStoreItemTemplate = m_jBuyBody.find(".item:first");
      m_jStoreModTemplate = m_jBuyBody.find(".mod:first");
      m_jStoreItemTemplate.hide();

      m_jBuyTab.click(function () {
         m_jBuyBody.show();
         m_jSellBody.hide();
         m_jBuyTab.addClass("selected");
         m_jSellTab.removeClass("selected");
         m_jSellBottom.hide();
         m_jBuyBottom.show();
      });
      
      m_jSellTab.click(function () {
         m_jBuyBody.hide();
         m_jSellBody.show();
         m_jBuyTab.removeClass("selected");
         m_jSellTab.addClass("selected");
         m_jSellBottom.show();
         m_jBuyBottom.hide();
      });

      m_moneyControl = moneyControl;

      m_storeControl = new StoreControl();
      m_storeControl.initialize(m_moneyControl, {
         onAddItem: function (iItemId, storeInfo) {
            var itemInfo = storeInfo.itemInfo;
            addStoreItem(m_jBuyBody, m_checkListBuy, itemInfo);
         },
         onBuyItem: function (iItemId, storeInfo) {
            /*
            var itemInfo = storeInfo.itemInfo;
            m_checkListBuy.disableItem(itemInfo);
            m_checkListSell.addItem(iItemId, itemInfo);
            */
         }
      });

      /*
      addStoreItem({
         title: "Super Nova",
         price: 10,
         mods: [
            {
               title: "Expando",
               price: 200
            },
            {
               title: "Fool-proof",
               price: 10
            }
         ]
      });

      addStoreItem({
         title: "Something Else",
         price: 10
      });
      */
   };
};
