const PlayerInformation = function () {
   var self = this,
      m_bConnected = true,
      m_bAlive = false,
      m_strName;

   self.getName = function () { return m_strName; };
   self.setName = function (strName) { m_strName = strName; };

   self.setConnected = function (bConnected) { m_bConnected = bConnected; };
   self.setAlive = function (bAlive) { m_bAlive = bAlive; };
};

export default PlayerInformation;
