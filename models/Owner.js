const Sequelize = require('sequelize')
'use strict'
module.exports = (sequelize, DataTypes) => {
  const Owner = sequelize.define('Owner', {
    identity: {type: Sequelize.STRING},  // The external id
    active: { type: Sequelize.BOOLEAN, defaultValue: false },
    deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    birth_date: { type: Sequelize.DATE },
    gender: { type: Sequelize.INTEGER },
    blood_type: { type: Sequelize.INTEGER },
    property1: { type: Sequelize.STRING },
    property2: { type: Sequelize.STRING },
    hpo_terms: { type: Sequelize.STRING },
    ethnicity: { type: Sequelize.STRING },
    createdAt: {type: Sequelize.DATE},
    updatedAt: {type: Sequelize.DATE},
  }, {})
  Owner.associate = function(models) {
     models.Owner.belongsToMany(models.Lab, {through: models.LabOwner})
     models.Owner.hasOne(models.User)
     models.Owner.hasOne(models.File)
  }

  return Owner
}