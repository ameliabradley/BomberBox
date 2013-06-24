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
CameraCursor = function () {
   var self = this,
      m_worldInterface,
      m_iX,
      m_iY;

   self.shift = function(iDirection) {
      switch (iDirection) {
      case "left":
         m_iX -= 1;
         break;
      case "right":
         m_iX += 1;
         break;
      case "up":
         m_iY -= 1;
         break;
      case "down":
         m_iY += 1;
         break;
      }

      m_worldInterface.moveCamera(m_iX, m_iY);
   };

   self.initialize = function (worldInterface, iX, iY) {
      m_worldInterface = worldInterface;
      m_iX = iX;
      m_iY = iY;
   };
};
