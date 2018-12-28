'use strict';

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const OwnerInfo = sequelize.define('OwnerInfo', {
    owner_id: DataTypes.STRING,
    name: DataTypes.STRING
  }, {});
  OwnerInfo.associate = function (models) {
    // associations can be defined here
  };
  OwnerInfo.addHook('beforeValidate', (oi, opt) => {
    var idstr = ''+ oi.lab_id;
    oi.lab_id = bcrypt.hashSync(idstr, 8);
  });
  return OwnerInfo;
};