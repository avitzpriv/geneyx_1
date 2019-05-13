const Sequelize = require('sequelize')

'use strict'

module.exports = (sequelize, DataTypes) => {
  const file = sequelize.define('file', {
    url: DataTypes.STRING,
    file_meta_data: DataTypes.STRING,
    owner_id: Sequelize.INTEGER,
    upload_date: Sequelize.DATE
  }, {
    underscored: true,
    timestamps: true
  })
  file.associate = function(models) {
    models.file.belongsTo(models.owner)
  }
  return file
}