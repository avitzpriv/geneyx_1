'use strict';
module.exports = (sequelize, DataTypes) => {
  const LabOwner = sequelize.define('LabOwner', {
    active: DataTypes.BOOLEAN,
    deleted: DataTypes.BOOLEAN,
  }, {});
  LabOwner.associate = function(models) {
    // associations can be defined here
  };
  return LabOwner;
};