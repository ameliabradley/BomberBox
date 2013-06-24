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

var ClientObjectManager = function () {
   var self = this,
      m_iTotalObjects = 0,
      m_oObjectById = {};

   self.createClientObject = function (id, o) {
      m_oObjectById[m_iTotalObjects] = o;
   };

   self.updateClientObject = function (id, o) {
      m_oObjectById[m_iTotalObjects].update(o);
   };
};
