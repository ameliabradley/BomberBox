var Weapon = function() {
   var self = this,
      m_strId,
      m_strName,
      m_weaponImplementation,
      m_world,
      m_cooldown;

   self.getId = function() {
      return m_strId;
   };

   self.getName = function() {
      return m_strName;
   };
   
   self.setCooldownObserver = function(observer) {
      m_cooldown.setObserver(observer);
   };

   self.activate = function(iX, iY) {
      var bCooldown = m_cooldown.testItemReady(),
         bCanUse = m_weaponImplementation.canUse(iX, iY);

      if (bCooldown && bCanUse) {
         if (m_cooldown.tryUseItem()) {
            m_weaponImplementation.useWeapon(iX, iY);
         }
      }
   };

   self.upgrade = function(upgrade) {
      var weaponModInfo = upgrade.weaponModInfo;
      if (weaponModInfo.name) {
         m_strName = weaponModInfo.name;
      }

      if (weaponModInfo.cooldown) {
         m_cooldown.setCooldownTime(weaponModInfo.cooldown);
      }

      m_weaponImplementation.upgrade(upgrade);
   };

   self.initialize = function(world, strWeaponId, weaponImplentation) {
      var item = PLAYER_ITEMS[strWeaponId];

      m_strId = strWeaponId;

      m_world = world;

      m_strName = item.itemInfo.name;

      m_weaponImplementation = weaponImplentation;
      
      m_cooldown = new ItemCooldown();
      m_cooldown.initialize(world, item.weaponInfo.cooldown);
   };
};
