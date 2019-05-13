const Sequelize = require('sequelize')

'use strict'

module.exports = (sequelize, DataTypes) => {
  const owner = sequelize.define('owner', {
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
  }, {
    underscored: true,
    timestamps: true
  })
  owner.associate = function(models) {
     models.owner.belongsToMany(models.lab, {through: models.lab_owner})
     models.owner.hasOne(models.user)
     models.owner.hasOne(models.file)
  }

  return owner
}