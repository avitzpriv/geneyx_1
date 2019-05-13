'use strict'

const Sequelize = require('sequelize')
const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    user_name: { type: DataTypes.STRING },
    email : { type: DataTypes.STRING, unique: true, validate: {isEmail: true } }, 
    type: {type: Sequelize.INTEGER },
    lab_id: {type: Sequelize.INTEGER },
    owner_id: {type: Sequelize.INTEGER},
    password: { type: Sequelize.STRING, allowNull: false }
  }, {
    logging:true,
    underscored: true,
  })

  // associations can be defined here
  user.associate = function(models) {
    
    user.belongsTo(models.lab)
    user.belongsTo(models.owner)
  }

  user.addHook('beforeValidate', (_user, opt) => {
    console.log('In model User, in beforeValidate()')
    _user.password = bcrypt.hashSync(_user.password, 10)
    _user.email = _user.email.toLowerCase()
  })

  return user
}