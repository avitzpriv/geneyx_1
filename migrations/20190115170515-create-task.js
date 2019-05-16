'use strict'

const ETaskStatus = [
  'eady', 'running', 'rerun', 'done', 'error'
]

module.exports = {

  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      job_id: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      error_message: {
        type: Sequelize.STRING(4096)
      },
      num_reruns: {
        type: Sequelize.INTEGER
      },
      task_data: {
        type: Sequelize.STRING(4096)
      },
      task_state: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('jobs')
  }
}