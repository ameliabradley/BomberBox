WeaponSlotControl = function() {
   var self = this,
      m_aSlotIndexByItemId = {},
      m_aWeaponSlots = [],
      m_oWeapons = {},
      m_iWeaponIndex = 0;

   self.tabWeapon = function() {
      m_iWeaponIndex++;

      if (m_iWeaponIndex >= m_aWeaponSlots.length) {
         m_iWeaponIndex = 0;
      }

      self.setWeapon(m_iWeaponIndex);
   };

   self.upgradeWeapon = function(iItemId, itemInfo) {
      m_oWeapons[iItemId].upgrade(itemInfo);
   };

   self.setWeapon = function(iWeaponIndex) {
      m_iWeaponIndex = iWeaponIndex;
   };

   self.addWeapon = function(iItemId, weapon) {
      var index = m_aWeaponSlots.length;
      m_aSlotIndexByItemId[iItemId] = index;
      m_aWeaponSlots.push(weapon);
      m_oWeapons[iItemId] = weapon;
   };

   self.updateWeaponOrder = function (aItemId) {
      // TODO
   };

   self.removeWeapon = function (iItemId) {
      var iSlotIndex = m_aSlotIndexByItemId[iItemId];
      m_aWeaponSlots.splice(iSlotIndex, 1);
      delete m_oWeapons[iItemId];
   };

   self.getSelectedWeapon = function() {
      return m_aWeaponSlots[m_iWeaponIndex];
   };

   self.initialize = function() {
   };
};
