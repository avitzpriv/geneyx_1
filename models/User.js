'use strict'

const Sequelize = require('sequelize')
const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userName: { type: DataTypes.STRING },
    email : { type: DataTypes.STRING, unique: true, validate: {isEmail: true } }, 
    type: {type: Sequelize.INTEGER },
    LabId: {type: Sequelize.INTEGER },
    OwnerId: {type: Sequelize.INTEGER},
    password: { type: Sequelize.STRING, allowNull: false }
  }, {logging:true})

  // associations can be defined here
  User.associate = function(models) {
    
    User.belongsTo(models.Lab)
    User.belongsTo(models.Owner)
  }

  User.addHook('beforeValidate', (user, opt) => {
    console.log('In model User, in beforeValidate()')
    user.password = bcrypt.hashSync(user.password, 10)
    user.email = user.email.toLowerCase()
  })

  return User
}