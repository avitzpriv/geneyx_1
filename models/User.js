const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userName: { type: DataTypes.STRING },
    email : { type: DataTypes.STRING, unique: true, validate: {isEmail: true } }, 
    type: {type: Sequelize.INTEGER },
    LabId: {type: Sequelize.INTEGER },
    OwnerId: {type: Sequelize.INTEGER},
    password: { type: Sequelize.STRING, allowNull: false }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.belongsTo(models.Lab);
    User.belongsTo(models.Owner);
  };
  User.addHook('beforeValidate', (user, opt) => {
    // console.log(`owner: ${JSON.stringify(user)}`);
    user.password = bcrypt.hashSync(user.password, 8);
    user.email = user.email.toLowerCase();
  });
  return User;
};