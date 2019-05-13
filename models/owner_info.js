'use strict'

const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const owner_info = sequelize.define('owner_info', {
    owner_id: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    underscored: true,
    timestamps: true
  })
  owner_info.associate = function (models) {
    // associations can be defined here
  }
  owner_info.addHook('beforeValidate', (oi, opt) => {
    var idstr = ''+ oi.lab_id;
    oi.lab_id = bcrypt.hashSync(idstr, 8)
  })
  return owner_info
}