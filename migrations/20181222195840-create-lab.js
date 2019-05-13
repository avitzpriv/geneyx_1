'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('labs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING, unique: true
      },
      country: {type:Sequelize.STRING},
      address: { type: Sequelize.STRING },
      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      phone: { type: Sequelize.STRING },
      additional: { type: Sequelize.STRING },
      license: { type: Sequelize.STRING },
      issued: { type: Sequelize.DATE},
      expiry: { type: Sequelize.DATE},
      updates: { type: Sequelize.BOOLEAN, defaultValue: false},
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
    return queryInterface.dropTable('labs');
  }
};