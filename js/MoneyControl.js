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
MoneyControl = function() {
   var self = this,
      m_iMoney = 0,
      m_fnOnMoneyUpdate,
      onMoneyUpdate = function() {
         if (m_fnOnMoneyUpdate) {
            m_fnOnMoneyUpdate(m_iMoney);
         }
      };

   self.setOnMoneyUpdate = function (fnOnMoneyUpdate) {
      m_fnOnMoneyUpdate = fnOnMoneyUpdate;
   };

   self.modifyMoney = function(iModify) {
      m_iMoney += iModify;
      onMoneyUpdate();
   };

   self.setMoney = function(iMoney) {
      m_iMoney = iMoney;
      onMoneyUpdate();
   };

   self.getMoney = function() {
      return m_iMoney;
   };

   self.hasMoney = function(iRequiredMoney) {
      return (m_iMoney >= iRequiredMoney);
   }

   self.initialize = function() {
      onMoneyUpdate();
   };
};
