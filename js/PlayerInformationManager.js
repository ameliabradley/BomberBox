PlayerInformationManager = function () {
   var self = this,
      m_aPlayerInformation = [];

   self.add = function (iPlayerId, strPlayerName) {
      var playerInformation = new PlayerInformation();
      playerInformation.setName(strPlayerName);

      m_aPlayerInformation[iPlayerId] = playerInformation;

      return playerInformation;
   };

   self.get = function (iPlayerId) {
      return m_aPlayerInformation[iPlayerId];
   };
};
