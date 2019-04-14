'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.renameColumn('Files', 'fileMetaData', 'file_meta_data')
    queryInterface.renameColumn('Files', 'ownerId', 'OwnerId') 
    queryInterface.changeColumn('Owners', 'hpo_terms', { type: Sequelize.STRING(2048) })
    return queryInterface.changeColumn('Tasks', 'error_message', { type: Sequelize.STRING(4096) })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.renameColumn('Files', 'file_meta_data', 'fileMetaData') 
    queryInterface.renameColumn('Files', 'OwnerId', 'ownerId') 
    queryInterface.changeColumn('Owners', 'hpo_terms', { type: Sequelize.STRING })
    return queryInterface.changeColumn('Tasks', 'error_message', { type: Sequelize.STRING })
  }
}
