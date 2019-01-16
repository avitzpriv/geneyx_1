const Sequelize = require('sequelize');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    url: DataTypes.STRING,
    ownerId: Sequelize.INTEGER,
    uploadDate: Sequelize.DATE
  }, {});
  File.associate = function(models) {
    // associations can be defined here
    models.File.belongsTo(models.Owner);
  };
  return File;
};