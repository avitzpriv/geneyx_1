const Sequelize = require('sequelize');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    url: DataTypes.STRING,
    file_meta_data: DataTypes.STRING,
    OwnerId: Sequelize.INTEGER,
    uploadDate: Sequelize.DATE
  }, {});
  File.associate = function(models) {
    models.File.belongsTo(models.Owner);
  };
  return File;
};