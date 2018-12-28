const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Lab = sequelize.define('Lab', {
    name: {type: DataTypes.STRING},
    address: { type: Sequelize.STRING },
    user_name: { type: Sequelize.STRING },
    user_email: { type: Sequelize.STRING, unique: true, validate: { isEmail: true } },
    user_pass: { type: Sequelize.STRING }, // encrypted
    active: { type: Sequelize.BOOLEAN, defaultValue: true },
    deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    type: { type: Sequelize.INTEGER },
    property1: { type: Sequelize.STRING },
    property2: { type: Sequelize.STRING }
}, {});
  Lab.associate = function(models) {
    Lab.belongsToMany(models.Owner, { through: models.LabOwner});
    // debugger;
  };
  Lab.addHook('beforeValidate', (lab, opt) => {
    lab.user_pass = bcrypt.hashSync(lab.user_pass, 8);
  });
  return Lab;
};