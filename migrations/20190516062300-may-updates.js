'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
  
    return queryInterface
    .changeColumn('tasks', 'task_state', {
      type: Sequelize.TEXT()
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
    .changeColumn('tasks', 'task_state', {
      type: Sequelize.STRING(4096)
    })
  }
}