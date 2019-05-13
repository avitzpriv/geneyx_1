'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('owners', {
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
      hpo_terms: { type: Sequelize.STRING(2048) },
      ethnicity: { type: Sequelize.STRING },
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
    return queryInterface.dropTable('owners');
  }
};