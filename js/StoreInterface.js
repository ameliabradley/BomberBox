StoreInterface = function () {
   var self = this,

      m_jStoreBody,
      m_jStoreItemTemplate,
      m_jStoreModTemplate,
      m_iTotalPrice = 0,
      m_jStoreTotalGold,
      m_jStoreNothingSelected,
      m_jStoreBuyItems,

      m_storeControl,

      formatPrice = function (iPrice) {
         return iPrice.toString() + " G";
      },

      modifyPrice = function (iPrice) {
         m_iTotalPrice += iPrice;
         m_jStoreTotalGold.text(m_iTotalPrice);

         if (m_iTotalPrice === 0) {
            m_jBuy.addClass("disabled");
            m_jStoreNothingSelected.show();
            m_jStoreSomethingSelected.hide();
         } else {
            m_jBuy.removeClass("disabled");
            m_jStoreNothingSelected.hide();
            m_jStoreSomethingSelected.show();
         }
      },

      addMods = function (jItem, jBtnMods, oMods, fnCheck) {
         var jMods = $("<div class='mods' />"),
            aMods = [];

         $.each(oMods, function (i, oMod) {
            var jMod = m_jStoreModTemplate.clone(),
               strTitle = oMod.title,
               jMain = jMod.find(".main"),
               bSelected = false,
               iPrice = oMod.price,
               check = function () {
                  bSelected = true;
                  jMod.addClass("selected");
                  modifyPrice(iPrice);
                  fnCheck();
               },
               uncheck = function () {
                  bSelected = false;
                  jMod.removeClass("selected");
                  modifyPrice(-iPrice);
               };

            jMod.find(".title").text(strTitle);
            jMod.find(".cost").text(formatPrice(iPrice));

            jMain.click(function () {
               if (bSelected) {
                  uncheck();
               } else {
                  check();
               }
            });
            
            jMods.append(jMod);
            aMods.push({
               uncheck: function () {
                  if (!bSelected) return;
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

         m_jStoreBody.append(jMods);

         return aMods;
      },

      addStoreItem = function (o) {
         var jItem = m_jStoreItemTemplate.clone(),
            strTitle = o.title,
            iPrice = o.price,
            strStoreDesc = o.desc,
            oMods = o.mods,
            jBtnMods = jItem.find(".btnMods"),
            jMain = jItem.find(".main"),
            aMods,
            bSelected = false,

            check = function () {
               bSelected = true;
               jItem.addClass("selected");
               modifyPrice(iPrice);
            },

            uncheck = function () {
               bSelected = false;
               jItem.removeClass("selected");
               modifyPrice(-iPrice);

               if (aMods) {
                  $.each(aMods, function (i, mod) {
                     mod.uncheck();
                  });
               }
            };

         jItem.show();
         jItem.find(".title").text(strTitle);
         jItem.find(".cost").text(formatPrice(iPrice));

         jMain.click(function () {
            if (bSelected) {
               uncheck();
            } else {
               check();
            }
         });

         m_jStoreBody.append(jItem);

         if (oMods && oMods.length) {
            aMods = addMods(jItem, jBtnMods, oMods, function () {
               if (bSelected) return;
               check();
            });
         } else {
            jBtnMods.hide();
         }
      };

   self.initialize = function (moneyControl) {
      m_jStoreBody = $("#bodyStore");
      m_jStoreItemTemplate = m_jStoreBody.find(".item:first");
      m_jStoreItemTemplate.hide();

      m_jStoreModTemplate = m_jStoreBody.find(".mod:first");
      m_jStoreTotalGold = $("#storeTotalGold");
      m_jBuy = $("#btnBuy");

      m_jStoreNothingSelected = $("#storeNothingSelected");
      m_jStoreSomethingSelected = $("#storeSomethingSelected");

      m_storeControl = new StoreControl();
      m_storeControl.initialize(moneyControl, {
         onAddItem: function (iItemId, storeInfo) {
            var itemInfo = storeInfo.itemInfo;
            addStoreItem({
               title: itemInfo.name,
               price: itemInfo.price
            });
         },
         onBuyItem: function (iItemId, storeInfo) {
         }
      });

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
   };
};
