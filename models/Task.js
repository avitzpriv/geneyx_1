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
    job_id: {type: Sequelize.INTEGER },
    status: {type: Sequelize.STRING },
    error_message: {type: Sequelize.STRING },
    num_reruns: {type: Sequelize.INTEGER, defaultValue: 0}, 
    task_data: {type: Sequelize.STRING },
    task_state: {type: Sequelize.STRING },
    createdAt: {type: Sequelize.DATE },
    updatedAt: {type: Sequelize.DATE},
  }, {logging:true})

  // associations can be defined here
  // Task.associate = function(models) {
  //   Task.belongsTo(models.Job)
  // }

  return Task
}