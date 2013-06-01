var ItemCooldown = function() {
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

   self.updateProgress = function() {
      if (!m_observer) return;

      var iLeft = getTimeLeft();

      m_observer.updateCooldown(iLeft);
   };

   self.setObserver = function(observer) {
      m_observer = observer;
   };

   self.updateLoop = function() {
      self.updateProgress();
      m_iUpdateTimeoutId = m_world.setTimeout(function() {
         self.updateLoop();
      }, m_iUpdateSpeed);
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
      m_observer.finishCooldown();
   };

   self.setCooldownTime = function(iCooldownTime) {
      m_iCooldownTime = iCooldownTime;

      if (getTimeLeft() <= 0) {
         self.clearCooldown();
      }
   };

   self.tryUseItem = function() {
      if (m_iCooldownTime == 0) return true;

      // TODO: Animation on failure
      if (m_bActive) {
         m_bActive = false;
         m_observer.startCooldown();
         self.updateLoop();
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
