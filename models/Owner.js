const Sequelize = require('sequelize');
// const bcrypt = require('bcryptjs');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Owner = sequelize.define('Owner', {
    // name: { type: DataTypes.STRING },
    // email : { type: DataTypes.STRING, unique: true, validate: {isEmail: true } }, 
    // password: { type: Sequelize.STRING, allowNull: false },
    identity: {type: Sequelize.STRING},  // The external id
    active: { type: Sequelize.BOOLEAN, defaultValue: false },
    deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    birth_date: { type: Sequelize.DATE },
    gender: { type: Sequelize.BOOLEAN },
    blood_type: { type: Sequelize.INTEGER },
    property1: { type: Sequelize.STRING },
    property2: { type: Sequelize.STRING }

  }, {});
  Owner.associate = function(models) {
     models.Owner.belongsToMany(models.Lab, {through: models.LabOwner});
     //models.Owner.hasMany(models.File)
     models.Owner.hasOne(models.User);
  };
  // Owner.addHook('beforeValidate', (owner, opt) => {
  //   // console.log(`owner: ${JSON.stringify(owner)}`);
  //   owner.password = bcrypt.hashSync(owner.password, 8);
  // });
  return Owner;
};