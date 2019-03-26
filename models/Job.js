'use strict'

const Sequelize = require('sequelize')

const STATUS_OPEN  = 'open'
const STATUS_DONE  = 'done'
const STATUS_ERROR = 'error'

module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    name: { type: DataTypes.STRING },
    user_id: {type: Sequelize.INTEGER },
    status: {type: Sequelize.STRING },
    error_message: {type: Sequelize.STRING },
    createdAt: {type: Sequelize.DATE },
    updatedAt: {type: Sequelize.DATE},
  }, {logging:true})

  // associations can be defined here
  Job.associate = function(models) {
    Job.belongsTo(models.User)
  }

  return Job
}