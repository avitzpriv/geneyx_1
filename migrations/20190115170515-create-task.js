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
      jobId: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      errorMessage: {
        type: Sequelize.STRING
      },
      numReruns: {
        type: Sequelize.INTEGER
      },
      taskData: {
        type: Sequelize.STRING
      },
      taskState: {
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