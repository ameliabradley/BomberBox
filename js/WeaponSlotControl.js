WeaponSlotControl = function() {
   var self = this,
      m_aWeaponSlots = [],
      m_oWeapons = {},
      m_jSlots,
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
      m_jSlots.removeClass("selected");
      m_jSlots.eq(m_iWeaponIndex).addClass("selected");
      // TODO: Display Weapon Name
   };

   self.addWeapon = function(weapon) {
      var index = m_aWeaponSlots.length;
      m_aWeaponSlots.push(weapon);

      m_oWeapons[weapon.getId()] = weapon;


      // TODO: Weapon Image
      var jSlot = m_jSlots.eq(index),
         jCooldown = jSlot.find(".slotCooldown");

      jSlot.removeClass('disabled');

      weapon.setCooldownObserver({
         onItemTestedButNotReady: function() {
            jSlot.css({
               outlineColor: 'white'
            });
            jCooldown.css({
               backgroundColor: 'white'
            });
            setTimeout(function() {
               jSlot.css({
                  outlineColor: ''
               });
               jCooldown.css({
                  backgroundColor: ''
               });
            }, 100);
         },
         startCooldown: function() {
            jCooldown.css({
               height: '0%',
               backgroundColor: 'rgba(255,255,255,0.5)'
            });
         },
         updateCooldown: function(i) {
            jCooldown.css({
               height: Math.floor(i * 100) + '%'
            });
         },
         finishCooldown: function() {
            jCooldown.animate({
               height: '100%',
               backgroundColor: 'rgba(255,255,255,1)'
            }, {
               duration: 200,
               complete: function() {
                  jCooldown.animate({
                     height: '100%',
                     backgroundColor: 'rgba(255,255,255,0)'
                  }, {
                     duration: 100
                  });
               }
            });
         }
      });
   };

   self.getSelectedWeapon = function() {
      return m_aWeaponSlots[m_iWeaponIndex];
   };

   self.initialize = function() {
   /*
      m_jSlots = $("#weaponSelectionContainer .weaponSlot");
      m_jSlots.each(function(i, el) {
         var jSlot = $(this);
         jSlot.hammer({ prevent_default: true }).bind("tap", function() {
            self.setWeapon(i);
         });
      });
   */
   };
};
