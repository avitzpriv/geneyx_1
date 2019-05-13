'use strict'

module.exports = (sequelize, DataTypes) => {
  const lab_owner = sequelize.define('lab_owner', {
    active: DataTypes.BOOLEAN,
    deleted: DataTypes.BOOLEAN,
  }, {
    underscored: true,
    timestamps: true
  })
  lab_owner.associate = function(models) {
    // associations can be defined here
  }

  return lab_owner
}