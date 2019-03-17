'use strict'

const Sequelize = require('sequelize')

const STATUS_READY   = 'ready'
const STATUS_RUNNING = 'running'
const STATUS_RERUN   = 'rerun'
const STATUS_DONE    = 'done'
const STATUS_ERROR   = 'error'

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: { type: DataTypes.STRING },
    jobId: {type: Sequelize.INTEGER },
    status: {type: Sequelize.STRING },
    numReruns: {type: Sequelize.INTEGER, defaultValue: 0}, 
    taskData: {type: Sequelize.STRING },
    createdAt: {type: Sequelize.DATE },
    updatedAt: {type: Sequelize.DATE},
  }, {logging:true})

  // associations can be defined here
  // Task.associate = function(models) {
  //   Task.belongsTo(models.Job)
  // }

  return Task
}