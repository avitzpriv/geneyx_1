'use strict'

const ETaskStatus = [
  'eady', 'running', 'rerun', 'done', 'error'
]

module.exports = {

  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tasks', {
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
        type: Sequelize.STRING
      },
      num_reruns: {
        type: Sequelize.INTEGER
      },
      task_data: {
        type: Sequelize.STRING
      },
      task_state: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Jobs')
  }
}