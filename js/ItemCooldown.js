ItemCooldown = function() {
   var self = this,
      m_iCooldownTime,
      m_observer,
      m_bActive = true,
      m_iTimeoutId,
      m_iUpdateTimeoutId,
      m_iUpdateSpeed = 100,
      m_world,

      getTimeLeft = function() {
         var iRemainingTime = m_world.getTimeoutRemaining(m_iTimeoutId),
            iLeft = (iRemainingTime > 0) ? 1 - (iRemainingTime / m_iCooldownTime) : 0;

         return iLeft;
      };

   self.setObserver = function(observer) {
      m_observer = observer;
   };

   self.testItemReady = function() {
      if (!m_bActive && m_observer) {
         m_observer.onItemTestedButNotReady();
      }
      return m_bActive;
   };

   self.clearCooldown = function() {
      m_world.clearTimeout(m_iTimeoutId);
      m_world.clearTimeout(m_iUpdateTimeoutId);
      m_bActive = true;
      if (m_observer) m_observer.finishCooldown();
   };

   self.setCooldownTime = function(iCooldownTime) {
      m_iCooldownTime = iCooldownTime;

      if (getTimeLeft() <= 0) {
         self.clearCooldown();
      }
   };

   self.tryUseItem = function() {
      if (m_iCooldownTime == 0) return true;

      if (m_bActive) {
         m_bActive = false;
         if (m_observer) m_observer.startCooldown(m_iCooldownTime);
         m_iTimeoutId = m_world.setTimeout(function() {
            self.clearCooldown();
         }, m_iCooldownTime);

         return true;
      } else {
         return false;
      }
   };

   self.initialize = function(world, iCooldownTime) {
      m_world = world;
      m_iCooldownTime = iCooldownTime;
      m_world.addResetObserver(function() {
         self.clearCooldown();
      });
   };
};
