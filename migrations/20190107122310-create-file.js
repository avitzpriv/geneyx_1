'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      url: { type: Sequelize.STRING, allowNull: false },
      /* The file meta data is here to capture all information needed to actually locate
         the file.
         
       */
      fileMetaData: { type: Sequelize.STRING, allowNull: false },
      ownerId: { type: Sequelize.INTEGER, allowNull: false  },
      uploadDate: { type: Sequelize.DATE },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Files');
  }
};