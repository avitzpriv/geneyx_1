'use strict'

const Sequelize = require('sequelize')

const STATUS_OPEN  = 'open'
const STATUS_DONE  = 'done'
const STATUS_ERROR = 'error'

module.exports = (sequelize, DataTypes) => {
  const job = sequelize.define('job', {
    name: { type: DataTypes.STRING },
    user_id: {type: Sequelize.INTEGER },
    status: {type: Sequelize.STRING },
    error_message: {type: Sequelize.STRING },
  }, {
    logging:true,
    underscored: true,
    timestamps: true
  })

  // associations can be defined here
  job.associate = function(models) {
    job.belongsTo(models.user)
  }

  return job
}