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
