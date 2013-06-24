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
StoreItem = function () {
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
