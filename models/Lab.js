const Sequelize = require('sequelize');
// const bcrypt = require('bcryptjs');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Lab = sequelize.define('Lab', {
    name: {type: DataTypes.STRING, unique: true},
    address: { type: Sequelize.STRING },
    country:{ type: Sequelize.STRING},
    // user_name: { type: Sequelize.STRING },
    // user_email: { type: Sequelize.STRING, unique: true, validate: { isEmail: true } },
    // user_pass: { type: Sequelize.STRING }, // encrypted
    active: { type: Sequelize.BOOLEAN, defaultValue: true },
    deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
    phone: { type: Sequelize.STRING },
    additional: { type: Sequelize.STRING },
    license: { type: Sequelize.STRING },
    issued: { type: Sequelize.DATE},
    expiry: { type: Sequelize.DATE},
    updates: { type: Sequelize.BOOLEAN, defaultValue: false},
}, {});
  Lab.associate = function(models) {
    Lab.belongsToMany(models.Owner, { through: models.LabOwner});

    Lab.hasMany(models.User);
  };
  // Lab.addHook('beforeValidate', (lab, opt) => {
  //   // console.log(`Lab: ${JSON.stringify(lab)}`);
  //   lab.user_pass = bcrypt.hashSync(lab.user_pass, 8);
  // });
  return Lab;
};