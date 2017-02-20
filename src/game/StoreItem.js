const StoreItem = function () {
   var self = this,
      m_id,
      m_strName,
      m_strDescription,
      m_iType,
      m_iPrice,
      m_fnItemClass;

   self.initialize = function (o) {
      m_id = o.id;
      m_strName = o.name;
      m_strDescription = o.description;
      m_iType = o.type;
      m_iPrice = o.price;
      m_fnItemClass = o.itemClass;
   };

   self.getName = function () { return m_strName; };
   self.getDescription = function () { return m_strDescription; };
   self.getType = function () { return m_iType; };
   self.getPrice = function () { return m_iPrice; };
   self.getItemClass = function () { return m_fnItemClass; };
};

export default StoreItem;
