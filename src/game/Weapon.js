import ItemCooldown from './ItemCooldown.js';

const Weapon = function() {
   var self = this,
      m_id,
      m_strName,
      m_weaponImplementation,
      m_world,
      m_cooldown;

   self.getId = function() {
      return m_id;
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

   self.initialize = function(world, iWeaponId, weaponImplentation) {
      m_id = iWeaponId;

      var item = world.getItemManager().getItemById(iWeaponId);

      m_world = world;

      m_strName = item.name;

      m_weaponImplementation = weaponImplentation;

      m_cooldown = new ItemCooldown();
      m_cooldown.initialize(world, item.cooldown);
   };
};

export default Weapon;
