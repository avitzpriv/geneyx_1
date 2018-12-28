const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Owner = sequelize.define('Owner', {
    name: { type: DataTypes.STRING },
    email : { type: DataTypes.STRING, unique: true, validate: {isEmail: true } }, 
    password: { type: Sequelize.STRING, allowNull: false },
    active: { type: Sequelize.BOOLEAN, defaultValue: true },
    deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    type: { type: Sequelize.INTEGER },
    birth_date: { type: Sequelize.DATE },
    gender: { type: Sequelize.BOOLEAN },
    blood_type: { type: Sequelize.INTEGER },
    property1: { type: Sequelize.STRING },
    property2: { type: Sequelize.STRING }

  }, {});
  Owner.associate = function(models) {
     models.Owner.belongsToMany(models.Lab, {through: models.LabOwner});
  };
  Owner.addHook('beforeValidate', (owner, opt) => {
    owner.password = bcrypt.hashSync(owner.password, 8);
  });
  return Owner;
};