'use strict'

const Sequelize = require('sequelize')

const STATUS_READY   = 'ready'
const STATUS_RUNNING = 'running'
const STATUS_RERUN   = 'rerun'
const STATUS_DONE    = 'done'
const STATUS_ERROR   = 'error'

module.exports = (sequelize, DataTypes) => {
  const task = sequelize.define('task', {
    name: { type: DataTypes.STRING },
    job_id: {type: Sequelize.INTEGER },
    status: {type: Sequelize.STRING },
    error_message: {type: Sequelize.STRING },
    num_reruns: {type: Sequelize.INTEGER, defaultValue: 0}, 
    task_data: {type: Sequelize.STRING },
    task_state: {type: Sequelize.STRING }
  }, {
    logging:true,
    underscored: true,
    timestamps: true,
  })

  return task
}