WeaponSlotControl = function() {
   var self = this,
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

   self.upgradeWeapon = function(strWeaponId, itemInfo) {
      m_oWeapons[strWeaponId].upgrade(itemInfo);
   };

   self.setWeapon = function(iWeaponIndex) {
      m_iWeaponIndex = iWeaponIndex;
   };

   self.addWeapon = function(weapon) {
      var index = m_aWeaponSlots.length;
      m_aWeaponSlots.push(weapon);

      m_oWeapons[weapon.getId()] = weapon;
   };

   self.getSelectedWeapon = function() {
      return m_aWeaponSlots[m_iWeaponIndex];
   };

   self.initialize = function() {
   };
};
