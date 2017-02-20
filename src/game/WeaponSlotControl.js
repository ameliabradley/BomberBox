import { each } from './util.js';

const WeaponSlotControl = function() {
   var self = this,
      m_aSlotIndexByItemId = {},
      m_aWeaponSlots = [null, null, null, null, null],
      m_oWeapons = {},
      m_iWeaponIndex = null,
      m_observer,

      getFirstEmptySlot = function () {
         var iSlot = null;
         each(m_aWeaponSlots, function (i, weapon) {
            if (weapon === null) {
               iSlot = i;
               return false;
            }
         });
         return iSlot;
      };

   self.upgradeWeapon = function(iItemId, item) {
      m_oWeapons[iItemId].upgrade(item);
   };

   self.setWeapon = function(iWeaponIndex) {
      m_iWeaponIndex = iWeaponIndex;
      m_observer.onSetWeapon(m_iWeaponIndex);
   };

   self.addWeapon = function(iItemId, weapon) {
      var iWeaponIndex = getFirstEmptySlot();
      m_aSlotIndexByItemId[iItemId] = iWeaponIndex;
      m_aWeaponSlots[iWeaponIndex] = weapon;
      m_oWeapons[iItemId] = weapon;
      m_observer.onAddWeapon(iWeaponIndex, iItemId);
      if (m_iWeaponIndex === null) {
         self.setWeapon(iWeaponIndex);
      }
   };

   self.updateWeaponOrder = function (aItemId) {
      // TODO
   };

   self.removeWeapon = function (iItemId) {
      var iWeaponIndex = m_aSlotIndexByItemId[iItemId];
      m_aWeaponSlots[iWeaponIndex] = null;
      delete m_oWeapons[iItemId];
      m_observer.onRemoveWeapon(iWeaponIndex, iItemId);
   };

   self.getSlotIndexByItemId = function (iItemId) {
      return m_aSlotIndexByItemId[iItemId];
   };

   self.getSelectedWeapon = function() {
      if (m_iWeaponIndex === null) {
         return null;
      } else {
         return m_aWeaponSlots[m_iWeaponIndex];
      }
   };

   self.initialize = function(observer) {
      m_observer = observer;
   };
};

export default WeaponSlotControl;
