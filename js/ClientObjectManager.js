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
