/**
 * Copyright © 2012-2013 Lee Bradley 
 * All Rights Reserved
 * 
 * NOTICE: All information herein is, and remains the property of
 * Lee Bradley. Dissemation of this information or reproduction of
 * this material is strictly forbidden unless prior written permission
 * is obtained from Lee Bradley.
 * 
 * The above copyright notice and this notice shall be included in
 * all copies or substantial portions of the Software.
 */

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
