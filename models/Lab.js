const Sequelize = require('sequelize')

'use strict'

module.exports = (sequelize, DataTypes) => {
  const lab = sequelize.define('lab', {
    name: {type: DataTypes.STRING, unique: true},
    address: { type: Sequelize.STRING },
    country:{ type: Sequelize.STRING},
    active: { type: Sequelize.BOOLEAN, defaultValue: true },
    deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    phone: { type: Sequelize.STRING },
    additional: { type: Sequelize.STRING },
    license: { type: Sequelize.STRING },
    issued: { type: Sequelize.DATE},
    expiry: { type: Sequelize.DATE},
    updates: { type: Sequelize.BOOLEAN, defaultValue: false},
}, {
  underscored: true,
  timestamps: true
});
  lab.associate = function(models) {
    lab.belongsToMany(models.owner, { through: models.lab_owner})

    lab.hasMany(models.user)
  }

  return lab
};