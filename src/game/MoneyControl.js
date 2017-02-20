const MoneyControl = function() {
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

export default MoneyControl;
