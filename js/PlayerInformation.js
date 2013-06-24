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

PlayerInformation = function () {
   var self = this,
      m_bConnected = true,
      m_bAlive = false,
      m_strName;

   self.getName = function () { return m_strName; };
   self.setName = function (strName) { m_strName = strName; };

   self.setConnected = function (bConnected) { m_bConnected = bConnected; };
   self.setAlive = function (bAlive) { m_bAlive = bAlive; };
};
