'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      url: { type: Sequelize.STRING, allowNull: false },
      /* The file meta data is here to capture all information needed to actually locate
         the file. */
      file_meta_data: { type: Sequelize.STRING, allowNull: false },
      owner_id: { type: Sequelize.INTEGER, allowNull: false  },
      upload_date: { type: Sequelize.DATE },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('files')
  }
};