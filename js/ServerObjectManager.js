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

var ServerObjectManager = function (fnUpdateObject) {
   var self = this,
      m_iTotalObjects = 0,
      m_aObjects = [],
      m_oObjectById = {};

   self.addNetworkObject = function (fnSerialize) {
      m_oObjectById[m_iTotalObjects] = fnSerialize;
      var iObjectId = m_iTotalObjects++;
      return {
         update: function (o) {
            fnUpdateObject(iObjectId);
         }
      };
   };

   self.getStateAsJson = function () {
      var iCurrent = m_iTotalObjects,
         fnSerialize,
         oJsonObject,
         aSerializedObjects;

      while (iCurrent--) {
         fnSerialize = m_aObjects[iCurrent];
         oJsonObject = fnSerialize();
         aSerializedObjects.push(oJsonObject);
      }

      return aSerializedObjects;
   };
};
