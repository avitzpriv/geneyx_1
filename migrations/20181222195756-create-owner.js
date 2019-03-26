'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Owners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      identity: {type: Sequelize.STRING},
      active: { type: Sequelize.BOOLEAN, defaultValue: false },
      deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      type: { type: Sequelize.INTEGER },
      birth_date: { type: Sequelize.DATE },
      gender: { type: Sequelize.INTEGER },
      blood_type: { type: Sequelize.INTEGER },
      property1: { type: Sequelize.STRING },
      property2: { type: Sequelize.STRING },
      hpo_terms: { type: Sequelize.STRING },
      ethnicity: { type: Sequelize.STRING },
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
    return queryInterface.dropTable('Owners');
  }
};